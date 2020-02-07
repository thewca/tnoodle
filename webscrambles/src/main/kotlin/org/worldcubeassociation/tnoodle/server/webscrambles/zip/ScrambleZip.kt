package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcGenericSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcScrambleCutoutSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.stripNewlines
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser.atLocalStartOfDay
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFRequestBinding
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive.Companion.toUniqueTitles
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Period

data class ScrambleZip(val scrambleRequests: List<ScrambleRequest>, val wcifBindings: WCIFRequestBinding?) {
    val uniqueTitles = scrambleRequests.toUniqueTitles()

    fun assemble(globalTitle: String?, generationDate: LocalDateTime, versionTag: String, password: String?, generationUrl: String?): ZipArchive {
        val safeGlobalTitle = globalTitle?.toFileSafeString()

        val computerDisplayZip = ComputerDisplayZip(scrambleRequests)
        val computerDisplayZipBytes = computerDisplayZip.assemble(globalTitle, generationDate.toLocalDate(), versionTag)

        val passcodeList = computerDisplayZip.passcodes.entries
            .joinToString("\r\n") { "${it.key}: ${it.value}" }

        val passcodeListingTxt = ScrambleRequest::class.java.getResourceAsStream(TXT_PASSCODE_TEMPLATE)
            .bufferedReader().readText()
            .replace("%%GLOBAL_TITLE%%", globalTitle.orEmpty())
            .replace("%%PASSCODES%%", passcodeList)

        return zipArchive {
            printingFolder(globalTitle, generationDate.toLocalDate(), versionTag, password)
            interchangeFolder(globalTitle, generationDate, versionTag, generationUrl)

            file("$safeGlobalTitle - Computer Display PDFs.zip", computerDisplayZipBytes.compress())
            file("$safeGlobalTitle - Computer Display PDF Passcodes - SECRET.txt", passcodeListingTxt)
        }
    }

    fun FolderBuilder.interchangeFolder(globalTitle: String?, generationDate: LocalDateTime, versionTag: String, generationUrl: String?) {
        val safeGlobalTitle = globalTitle?.toFileSafeString()

        val jsonInterchangeData = ZipInterchangeInfo(scrambleRequests, globalTitle, versionTag, generationDate, generationUrl, wcifBindings?.wcif?.schedule)
        val jsonStr = JsonConfig.SERIALIZER.stringify(ZipInterchangeInfo.serializer(), jsonInterchangeData)

        val jsonpFileName = "$safeGlobalTitle.jsonp"
        val jsonpStr = "var SCRAMBLES_JSON = $jsonStr;"

        val viewerResource = ScrambleRequest::class.java.getResourceAsStream(HTML_SCRAMBLE_VIEWER).bufferedReader().readText()
            .replace("%SCRAMBLES_JSONP_FILENAME%", jsonpFileName)

        folder("Interchange") {
            folder("txt") {
                for ((uniqueTitle, scrambleRequest) in uniqueTitles) {
                    val txtScrambles = scrambleRequest.allScrambles.stripNewlines().joinToString("\r\n")
                    file("$uniqueTitle.txt", txtScrambles)
                }
            }

            file("$safeGlobalTitle.json", jsonStr)
            file(jsonpFileName, jsonpStr)
            file("$safeGlobalTitle.html", viewerResource)
        }
    }

    fun FolderBuilder.printingFolder(globalTitle: String?, generationDate: LocalDate, versionTag: String, password: String?) {
        val safeGlobalTitle = globalTitle?.toFileSafeString()

        val fmcRequests = uniqueTitles.filterValues { it.fmc }

        val genericSolutionSheetPdf = FmcGenericSolutionSheet(ScrambleRequest.empty(ThreeByThreeCubePuzzle()), globalTitle, Translate.DEFAULT_LOCALE)
        val printingCompletePdf = ScrambleRequest.requestsToCompletePdf(globalTitle, generationDate, versionTag, scrambleRequests)

        folder("Printing") {
            folder("Scramble Sets") {
                for ((uniq, req) in uniqueTitles) {
                    // Without passcode, for printing
                    val pdfPrintingByteStream = req.getCachedPdf(globalTitle, generationDate, versionTag, Translate.DEFAULT_LOCALE)

                    file("$uniq.pdf", pdfPrintingByteStream.render())
                }
            }

            if (fmcRequests.isNotEmpty()) {
                folder("Fewest Moves - Additional Files") {
                    file("3x3x3 Fewest Moves Solution Sheet.pdf", genericSolutionSheetPdf.render())
                    for ((uniq, req) in fmcRequests) {
                        val cutoutZipName = "$uniq - Scramble Cutout Sheet.pdf"
                        val cutoutSheet = FmcScrambleCutoutSheet(req, globalTitle)

                        file(cutoutZipName, cutoutSheet.render(password))

                        folder("Translations") {
                            for (locale in Translate.locales) {
                                val languageMarkerTitle = "${locale.toLanguageTag()}_$uniq"

                                // fewest moves regular sheet
                                val printingSheet = FmcSolutionSheet(req, globalTitle, locale)

                                // Generic sheet.
                                val genericPrintingSheet = FmcGenericSolutionSheet(req, globalTitle, locale)

                                file("$languageMarkerTitle.pdf", printingSheet.render(password))
                                file("$languageMarkerTitle Solution Sheet.pdf", genericPrintingSheet.render(password))
                            }
                        }
                    }
                }
            }

            if (wcifBindings != null) {
                folder("Ordered Scrambles") {
                    orderedScramblesFolder(globalTitle, generationDate, versionTag)
                }
            }

            // Note that we're not passing the password into this function. It seems pretty silly
            // to put a password protected pdf inside of a password protected zip file.
            file("$safeGlobalTitle - All Scrambles.pdf", printingCompletePdf.render())
        }
    }

    fun FolderBuilder.orderedScramblesFolder(globalTitle: String?, generationDate: LocalDate, versionTag: String) {
        if (wcifBindings == null) {
            return
        }

        val wcifSchedule = wcifBindings.wcif.schedule

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
                    val scrambles = wcifBindings.activityScrambleRequests
                        .filterKeys { it in activities }

                    val activitiesHaveScrambles = scrambles.values.any { it.isNotEmpty() }

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
                                .flatMap { it.value }

                            val sheet = ScrambleRequest.requestsToCompletePdf(globalTitle, generationDate, versionTag, sortedScrambles)
                            file(pdfFileName, sheet.render())
                        }
                    }
                }
            }
        }

        // Generate all scrambles ordered
        val allScramblesOrdered = wcifSchedule.activitiesWithLocalStartTimes.entries
            .sortedBy { it.value }
            .flatMap { wcifBindings.activityScrambleRequests[it.key].orEmpty() }
            .distinct()

        val completeOrderedPdf = ScrambleRequest.requestsToCompletePdf(globalTitle, generationDate, versionTag, allScramblesOrdered)

        file("Ordered $globalTitle - All Scrambles.pdf", completeOrderedPdf.render())
    }

    companion object {
        private val HTML_SCRAMBLE_VIEWER = "/wca/scrambleviewer.html"
        private val TXT_PASSCODE_TEMPLATE = "/text/passcodeTemplate.txt"
    }
}
