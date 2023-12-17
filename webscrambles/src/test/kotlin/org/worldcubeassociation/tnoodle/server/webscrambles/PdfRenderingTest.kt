package org.worldcubeassociation.tnoodle.server.webscrambles

import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfReader
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Scramble
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet
import java.time.LocalDateTime
import java.util.*

class PdfRenderingTest {
    @Test
    fun `test that all FMC translations fit on one page with scramble`() {
        for (locale in Translate.TRANSLATED_LOCALES) {
            println("Rendering FMC solution sheet with scramble in ${locale.toLanguageTag()}")

            repeat(SCRAMBLE_REPETITIONS) {
                val scrambleStr = EventData.THREE_FM.scrambler.generateEfficientScrambles(1).single()
                val fmcSheet = getFewestMovesSheet(Scramble(scrambleStr), locale, ::FmcSolutionSheet)

                assertSheetPagesGetCorrectlyRendered(fmcSheet)
            }
        }
    }

    @Test
    fun `test that all FMC translations fit on one page without scramble`() {
        for (locale in Translate.TRANSLATED_LOCALES) {
            val fmcSheet = getFewestMovesSheet(Scramble(""), locale, ::FmcSolutionSheet)

            println("Rendering blank FMC solution sheet in ${locale.toLanguageTag()}")

            assertSheetPagesGetCorrectlyRendered(fmcSheet)
        }
    }

    @Test
    fun `test that all FMC translations fit on one page as cutout`() {
        for (locale in Translate.TRANSLATED_LOCALES) {
            println("Rendering FMC cutout sheet in ${locale.toLanguageTag()}")

            repeat(SCRAMBLE_REPETITIONS) {
                val scrambleStr = EventData.THREE_FM.scrambler.generateEfficientScrambles(1).single()
                val fmcSheet = getFewestMovesSheet(Scramble(scrambleStr), locale, ::FmcCutoutSheet)

                assertSheetPagesGetCorrectlyRendered(fmcSheet)
            }
        }
    }

    @Test
    fun `test that 3+2 scrambles get displayed on one page`() {
        for (event in EventData.entries) {
            println("Rendering 3+2 layout for ${event.id}")

            repeat(SCRAMBLE_REPETITIONS) {
                val sheet = getGenericScrambleSheet(event, 3, 2)
                assertSheetPagesGetCorrectlyRendered(sheet)
            }
        }
    }

    @Test
    fun `test that 5+2 scrambles get displayed on one page`() {
        for (event in EventData.entries) {
            println("Rendering 5+2 layout for ${event.id}")

            repeat(SCRAMBLE_REPETITIONS) {
                val sheet = getGenericScrambleSheet(event, 5, 2)
                assertSheetPagesGetCorrectlyRendered(sheet)
            }
        }
    }

    @Test
    fun `test that 7+0 scrambles get displayed on one page`() {
        for (event in EventData.entries) {
            println("Rendering 7+0 layout for ${event.id}")

            repeat(SCRAMBLE_REPETITIONS) {
                val sheet = getGenericScrambleSheet(event, 7, 0)
                assertSheetPagesGetCorrectlyRendered(sheet)
            }
        }
    }

    @Test
    fun `test that GenericScrambleSheet gets rendered irrespective of locale`() {
        for (locale in Translate.TRANSLATED_LOCALES) {
            println("Rendering 333 scrambles in 5+2 layout in ${locale.toLanguageTag()}")

            val sheet = getGenericScrambleSheet(EventData.THREE, 5, 2, locale)
            assertSheetPagesGetCorrectlyRendered(sheet)
        }
    }

    @Test
    fun `test that MBLD scrambles get rendered on several pages`() {
        val sheet = getGenericScrambleSheet(EventData.THREE_MULTI_BLD, 42, 0)
        assertSheetPagesGetCorrectlyRendered(sheet)
    }

    companion object {
        const val SCRAMBLE_REPETITIONS = 20

        private val ScrambleSheet.renderedNumberOfPages
            get(): Int {
                val pdfBytes = this.render()

                val itextReader = PdfReader(pdfBytes.inputStream())
                val itextPdf = PdfDocument(itextReader)

                return itextPdf.numberOfPages
            }

        private fun getGenericScrambleSheet(
            event: EventData,
            numScrambles: Int,
            numExtraScrambles: Int = 0,
            locale: Locale = Translate.DEFAULT_LOCALE
        ): GeneralScrambleSheet {
            val scrambleSet = ScrambleSet(
                42,
                event.scrambler.generateEfficientScrambles(numScrambles).map(::Scramble),
                event.scrambler.generateEfficientScrambles(numExtraScrambles).map(::Scramble)
            )

            return GeneralScrambleSheet(
                scrambleSet,
                "TNoodle-JUnit",
                "Test Competition ${LocalDateTime.now().year}",
                ActivityCode.compile(event, 0, 0, 0),
                false,
                locale
            )
        }

        private fun getFewestMovesSheet(
            scramble: Scramble,
            locale: Locale,
            ctor: (Scramble, Int, Int, String, ActivityCode, Boolean, Locale) -> FewestMovesSheet
        ): FewestMovesSheet {
            return ctor(
                scramble,
                3,
                42,
                "Test Competition ${LocalDateTime.now().year}",
                ActivityCode.compile(EventData.THREE_FM, 0, 0, 0),
                false,
                locale
            )
        }

        private fun assertSheetPagesGetCorrectlyRendered(sheet: ScrambleSheet) {
            Assertions.assertEquals(sheet.document.pages.size, sheet.renderedNumberOfPages)
        }
    }
}
