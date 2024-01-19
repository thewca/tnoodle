package org.worldcubeassociation.tnoodle.server.zip

import kotlinx.serialization.encodeToString
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.stripNewlines
import org.worldcubeassociation.tnoodle.server.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.serial.ZipInterchangeInfo
import org.worldcubeassociation.tnoodle.server.zip.model.Folder
import org.worldcubeassociation.tnoodle.server.zip.model.dsl.folder
import java.time.LocalDateTime

data class InterchangeFolder(val wcif: Competition, val uniqueTitles: Map<String, ScrambleSheet>, val globalTitle: String) {
    fun assemble(generationDate: LocalDateTime, versionTag: String, generationUrl: String?): Folder {
        val safeGlobalTitle = globalTitle.toFileSafeString()

        val jsonInterchangeData = ZipInterchangeInfo(globalTitle, versionTag, generationDate, generationUrl, wcif)
        val jsonStr = JsonConfig.SERIALIZER.encodeToString<ZipInterchangeInfo>(jsonInterchangeData)

        val jsonpFileName = "$safeGlobalTitle.jsonp"
        val jsonpStr = "var SCRAMBLES_JSON = $jsonStr;"

        val viewerResource = this::class.java.getResourceAsStream(HTML_SCRAMBLE_VIEWER)
            .bufferedReader()
            .readText()
            .replace("%SCRAMBLES_JSONP_FILENAME%", jsonpFileName)

        return folder("Interchange") {
            folder("txt") {
                for ((uniqueTitle, scrambleSheet) in uniqueTitles) {
                    val scrambleLines = scrambleSheet.scrambles.flatMap { it.allScrambleStrings }
                    val txtScrambles = scrambleLines.joinToString("\r\n") { it.stripNewlines() }
                    file("$uniqueTitle.txt", txtScrambles)
                }
            }

            file("$safeGlobalTitle.json", jsonStr)
            file(jsonpFileName, jsonpStr)
            file("$safeGlobalTitle.html", viewerResource)
        }
    }

    companion object {
        private const val HTML_SCRAMBLE_VIEWER = "/wca/scrambleviewer.html"
    }
}
