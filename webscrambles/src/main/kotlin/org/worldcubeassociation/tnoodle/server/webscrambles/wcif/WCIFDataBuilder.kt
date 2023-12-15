package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.GeneralScrambleSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder.pickWatermarkPhrase
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.*
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.ScrambleZip
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.util.StringUtil.withUniqueTitles
import org.worldcubeassociation.tnoodle.svglite.Color
import java.time.LocalDateTime
import java.util.*

object WCIFDataBuilder {
    const val WATERMARK_STAGING = "STAGING"
    const val WATERMARK_OUTDATED = "OUTDATED"
    const val WATERMARK_UNOFFICIAL = "UNOFFICIAL"
    const val WATERMARK_MANUAL = "MANUAL"

    fun Competition.toDocuments(
        versionTag: String,
        locale: Locale
    ): List<ScrambleSheet> {
        return events.flatMap { e ->
            e.rounds.flatMap { r ->
                r.scrambleSets.withIndex()
                    .flatMap { (groupNum, scrSet) ->
                        scrambleSetToDocuments(this, e, r, groupNum, scrSet, versionTag, locale)
                    }
            }
        }
    }

    private fun scrambleSetToDocuments(
        comp: Competition,
        event: Event,
        round: Round,
        group: Int,
        scrambleSet: ScrambleSet,
        versionTag: String,
        locale: Locale,
    ): List<ScrambleSheet> {
        val frontendStatus = comp.findExtension<TNoodleStatusExtension>()
        val watermark = frontendStatus?.pickWatermarkPhrase()

        val frontendColorScheme = event.findExtension<ColorSchemeExtension>()
        val colorScheme = frontendColorScheme?.colorScheme

        val baseCode = round.idCode.copyParts(groupNumber = group)

        when (event.eventModel) {
            EventData.THREE_MULTI_BLD -> {
                return scrambleSet.mapAttempts(baseCode) { attemptCode, scrambleStr ->
                    // In 333mbf, each "scramble" is actually a newline separated list of 333ni scrambles.
                    val scrambles = scrambleStr.allScrambleStrings.map { Scramble(it) }

                    val attemptScrambles = scrambleSet.copy(
                        scrambles = scrambles,
                        extraScrambles = listOf()
                    )

                    makeGenericSheet(
                        comp,
                        round,
                        attemptScrambles,
                        attemptCode,
                        versionTag,
                        locale,
                        watermark,
                        colorScheme
                    )
                }
            }

            EventData.THREE_FM -> {
                return scrambleSet.mapAttempts(baseCode) { attemptCode, scrambleStr ->
                    val totalAttempts = round.expectedAttemptNum
                    val hasGroupId = round.scrambleSetCount > 1

                    FmcSolutionSheet(
                        scrambleStr,
                        totalAttempts,
                        scrambleSet.id,
                        comp.shortName,
                        attemptCode,
                        hasGroupId,
                        locale,
                        watermark,
                        colorScheme
                    )
                }
            }

            else -> {
                val genericSheet = makeGenericSheet(comp, round, scrambleSet, baseCode, versionTag, locale, watermark, colorScheme)
                return listOf(genericSheet)
            }
        }
    }

    private fun <T> ScrambleSet.mapAttempts(activityCode: ActivityCode, fn: (ActivityCode, Scramble) -> T): List<T> {
        return scrambles.mapIndexed { nthAttempt, scrambleStr ->
            val pseudoCode = activityCode.copyParts(attemptNumber = nthAttempt)
            fn(pseudoCode, scrambleStr)
        }
    }

    private fun makeGenericSheet(
        comp: Competition,
        round: Round,
        scrambleSet: ScrambleSet,
        activityCode: ActivityCode,
        versionTag: String,
        locale: Locale,
        watermark: String?,
        colorScheme: Map<String, Color>?,
    ): GeneralScrambleSheet {
        val hasGroupId = round.scrambleSetCount > 1

        return GeneralScrambleSheet(
            scrambleSet,
            versionTag,
            comp.shortName,
            activityCode,
            hasGroupId,
            locale,
            watermark,
            colorScheme
        )
    }

    fun TNoodleStatusExtension.pickWatermarkPhrase(): String? {
        return if (isStaging) {
            WATERMARK_STAGING
        } else if (!isSignedBuild) {
            WATERMARK_UNOFFICIAL
        } else if (!isAllowedVersion) {
            WATERMARK_OUTDATED
        } else if (isManual) {
            WATERMARK_MANUAL
        } else null
    }

    fun wcifToZip(
        wcif: Competition,
        pdfPassword: String?,
        versionTag: String,
        locale: Locale,
        generationDate: LocalDateTime,
        generationUrl: String
    ): ZipArchive {
        val drawingData = wcif.toDocuments(versionTag, locale)
        val namedSheets = drawingData.withUniqueTitles { it.title }

        val frontendStatus = wcif.findExtension<TNoodleStatusExtension>()
        val frontendWatermark = frontendStatus?.pickWatermarkPhrase()

        val fmcTranslations = wcif.events.find { it.id == EventData.THREE_FM.id }
            ?.findExtension<FmcLanguagesExtension>()
            ?.languageTags.orEmpty()
            .mapNotNull { Translate.LOCALES_BY_LANG_TAG[it] }

        val scrambleZip = ScrambleZip(wcif, namedSheets, fmcTranslations, frontendWatermark)

        return scrambleZip.assemble(generationDate, versionTag, pdfPassword, generationUrl)
    }

    fun compileOutlinePdf(documents: List<ScrambleSheet>, password: String? = null): ByteArray {
        return compileOutlinePdfBytes(documents.map { it.document }, password)
    }

    fun compileOutlinePdfBytes(documents: List<Document>, password: String? = null): ByteArray {
        return Document.DEFAULT_ENGINE.renderWithOutline(documents, password)
    }
}
