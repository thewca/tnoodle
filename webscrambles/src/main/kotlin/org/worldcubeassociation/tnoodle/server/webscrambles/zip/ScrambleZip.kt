package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcGenericSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcScrambleCutoutSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.stripNewlines
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFBuilder.getCachedPdf
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFBuilder.toScrambleSetData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser.atLocalStartOfDay
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive.Companion.withUniqueTitles
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Period

data class ScrambleZip(val wcif: Competition) {
    val scrambleDrawingData = wcif.toScrambleSetData()

    val uniqueTitles = scrambleDrawingData.scrambleSheets
        .withUniqueTitles { it.activityCode.compileTitleString() }

    val globalTitle = scrambleDrawingData.competitionTitle
    val safeGlobalTitle = globalTitle.toFileSafeString()

    private fun Competition.hasSchedule(): Boolean = schedule.allActivities.isNotEmpty()

    fun assemble(generationDate: LocalDateTime, versionTag: String, password: String?, generationUrl: String?): ZipArchive {
        val computerDisplayZip = ComputerDisplayZip(wcif)
        val computerDisplayZipBytes = computerDisplayZip.assemble(generationDate.toLocalDate(), versionTag)

        val passcodeList = computerDisplayZip.passcodes.entries
            .joinToString("\r\n") { "${it.key}: ${it.value}" }

        val passcodeListingTxt = this::class.java.getResourceAsStream(TXT_PASSCODE_TEMPLATE)
            .bufferedReader().readText()
            .replace("%%GLOBAL_TITLE%%", globalTitle)
            .replace("%%PASSCODES%%", passcodeList)

        return zipArchive {
            printingFolder(generationDate.toLocalDate(), versionTag, password)
            interchangeFolder(generationDate, versionTag, generationUrl)

            file("$safeGlobalTitle - Computer Display PDFs.zip", computerDisplayZipBytes.compress())
            file("$safeGlobalTitle - Computer Display PDF Passcodes - SECRET.txt", passcodeListingTxt)
        }
    }

    fun FolderBuilder.interchangeFolder(generationDate: LocalDateTime, versionTag: String, generationUrl: String?) {
        val jsonInterchangeData = ZipInterchangeInfo(globalTitle, versionTag, generationDate, generationUrl, wcif)
        val jsonStr = JsonConfig[JsonConfig.SERIALIZER_TNOODLE].stringify(ZipInterchangeInfo.serializer(), jsonInterchangeData)

        val jsonpFileName = "$safeGlobalTitle.jsonp"
        val jsonpStr = "var SCRAMBLES_JSON = $jsonStr;"

        val viewerResource = this::class.java.getResourceAsStream(HTML_SCRAMBLE_VIEWER).bufferedReader().readText()
            .replace("%SCRAMBLES_JSONP_FILENAME%", jsonpFileName)

        folder("Interchange") {
            folder("txt") {
                for ((uniqueTitle, scrambleRequest) in uniqueTitles) {
                    val scrambleLines = scrambleRequest.scrambleSet.allScrambles.flatMap { it.allScrambleStrings }
                    val txtScrambles = scrambleLines.stripNewlines().joinToString("\r\n")
                    file("$uniqueTitle.txt", txtScrambles)
                }
            }

            file("$safeGlobalTitle.json", jsonStr)
            file(jsonpFileName, jsonpStr)
            file("$safeGlobalTitle.html", viewerResource)
        }
    }

    fun FolderBuilder.printingFolder(generationDate: LocalDate, versionTag: String, password: String?) {
        val fmcRequests = uniqueTitles.filterValues { it.isFmc }

        val genericSolutionSheetPdf = FmcGenericSolutionSheet(ScrambleSet.empty(), ActivityCode("333fm-r1"), globalTitle, Translate.DEFAULT_LOCALE)
        val printingCompletePdf = WCIFBuilder.requestsToCompletePdf(scrambleDrawingData, generationDate, versionTag)

        folder("Printing") {
            folder("Scramble Sets") {
                for ((uniq, req) in uniqueTitles) {
                    // Without passcode, for printing
                    val pdfPrintingByteStream = req.getCachedPdf(generationDate, versionTag, globalTitle, Translate.DEFAULT_LOCALE)

                    file("$uniq.pdf", pdfPrintingByteStream.render())
                }
            }

            if (fmcRequests.isNotEmpty()) {
                folder("Fewest Moves - Additional Files") {
                    file("3x3x3 Fewest Moves Solution Sheet.pdf", genericSolutionSheetPdf.render())
                    for ((uniq, req) in fmcRequests) {
                        val cutoutZipName = "$uniq - Scramble Cutout Sheet.pdf"
                        val cutoutSheet = FmcScrambleCutoutSheet(req.scrambleSet, req.activityCode, globalTitle)

                        file(cutoutZipName, cutoutSheet.render(password))

                        folder("Translations") {
                            for (locale in Translate.locales) {
                                val languageMarkerTitle = "${locale.toLanguageTag()}_$uniq"

                                // fewest moves regular sheet
                                val printingSheet = FmcSolutionSheet(req.scrambleSet, req.activityCode, globalTitle, locale)

                                // Generic sheet.
                                val genericPrintingSheet = FmcGenericSolutionSheet(req.scrambleSet, req.activityCode, globalTitle, locale)

                                file("$languageMarkerTitle.pdf", printingSheet.render(password))
                                file("$languageMarkerTitle Solution Sheet.pdf", genericPrintingSheet.render(password))
                            }
                        }
                    }
                }
            }

            if (wcif.hasSchedule()) {
                folder("Ordered Scrambles") {
                    orderedScramblesFolder(generationDate, versionTag)
                }
            }

            // Note that we're not passing the password into this function. It seems pretty silly
            // to put a password protected pdf inside of a password protected zip file.
            file("$safeGlobalTitle - All Scrambles.pdf", printingCompletePdf.render())
        }
    }

    fun FolderBuilder.orderedScramblesFolder(generationDate: LocalDate, versionTag: String) {
        val wcifSchedule = wcif.takeIf { it.hasSchedule() }?.schedule ?: return

        val wcifBindings = wcifSchedule.allActivities
            .associateWith { ac ->
                scrambleDrawingData.scrambleSheets.find { it.scrambleSet.id == ac.scrambleSetId }
                    ?: error("Ordered Scrambles: Could not find ScrambleSet ${ac.scrambleSetId} associated with Activity $ac")
            }

        val activityDays = wcifSchedule.activitiesWithLocalStartTimes
            .map { it.value.dayOfYear }
            .distinct()

        // hasMultipleDays gets a variable assigned on the competition creation using the website's form.
        // Online schedule fit to it and the user should not be able to put events outside it, but we double check here.
        // The next assignment fix possible mistakes (eg. a competition is assigned with 1 day, but events are spread among 2 days).
        val hasMultipleDays = wcifSchedule.hasMultipleDays || activityDays.size > 1
        val hasMultipleVenues = wcifSchedule.hasMultipleVenues

        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        val competitionStartActivity = wcifSchedule.earliestActivity

        for (venue in wcifSchedule.venues) {
            val venueName = venue.fileSafeName
            val hasMultipleRooms = venue.hasMultipleRooms

            val timezone = venue.dateTimeZone
            val competitionStartDate = competitionStartActivity.getLocalStartTime(timezone)

            for (room in venue.rooms) {
                val roomName = room.fileSafeName

                val activitiesPerDay = room.activities
                    .groupBy {
                        Period.between(
                            competitionStartDate.atLocalStartOfDay(),
                            it.getLocalStartTime(timezone).atLocalStartOfDay()
                        ).days
                    }

                for ((nthDay, activities) in activitiesPerDay) {
                    val scrambles = activities.associateWith { wcifBindings.getValue(it) }

                    val activitiesHaveScrambles = scrambles.values.isNotEmpty()

                    if (activitiesHaveScrambles) {
                        val filenameDay = nthDay + 1

                        val parts = listOfNotNull(
                            "$venueName/".takeIf { hasMultipleVenues },
                            "Day $filenameDay/".takeIf { hasMultipleDays },
                            "Ordered Scrambles",
                            " - $venueName".takeIf { hasMultipleVenues },
                            " - Day $filenameDay".takeIf { hasMultipleDays },
                            " - $roomName".takeIf { hasMultipleRooms },
                            ".pdf"
                        )

                        if (hasMultipleVenues || hasMultipleDays || hasMultipleRooms) {
                            // In addition to different folders, we stamp venue, day and room in the PDF's name
                            // to prevent different files with the same name.
                            val pdfFileName = parts.joinToString("")

                            val sortedScrambles = scrambles.entries
                                .sortedBy { it.key.getLocalStartTime(timezone) }
                                .map { it.value }

                            val sheetData = scrambleDrawingData.copy(scrambleSheets = sortedScrambles)
                            val sheet = WCIFBuilder.requestsToCompletePdf(sheetData, generationDate, versionTag)

                            file(pdfFileName, sheet.render())
                        }
                    }
                }
            }
        }

        // Generate all scrambles ordered
        val allScramblesOrdered = wcifSchedule.activitiesWithLocalStartTimes.entries
            .sortedBy { it.value }
            .mapNotNull { wcifBindings[it.key] } // the notNull will effectively never happen, because we guarantee that all activities are indexed
            .distinct()

        val allScramblesData = scrambleDrawingData.copy(scrambleSheets = allScramblesOrdered)
        val completeOrderedPdf = WCIFBuilder.requestsToCompletePdf(allScramblesData, generationDate, versionTag)

        file("Ordered $globalTitle - All Scrambles.pdf", completeOrderedPdf.render())
    }

    companion object {
        private val HTML_SCRAMBLE_VIEWER = "/wca/scrambleviewer.html"
        private val TXT_PASSCODE_TEMPLATE = "/text/passcodeTemplate.txt"
    }
}
