package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import io.mockk.spyk
import io.mockk.verify
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder.getCachedPdf
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Scramble
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet
import java.time.LocalDate
import java.util.*

object WcifDataBuilderTest {
    val TEST_INSTANCE = LocalDate.now()

    @Test
    fun testPDFCachingCaches() {
        val scrToDraw = spyk(randomScrambleSet(EventData.THREE))

        val first = scrToDraw.getCachedDummyPdf()
        val second = scrToDraw.getCachedDummyPdf()

        verify(atMost = 1) { scrToDraw.createPdf(any(), any(), any(), any()) }

        Assertions.assertSame(first, second)
    }

    @Test
    fun testPDFCachingUpdateScrambleInvalidates() {
        val scrToDraw = spyk(randomScrambleSet(EventData.TWO))

        scrToDraw.getCachedDummyPdf()

        val randomScrambleDrawing = randomScrambleSet(EventData.TWO)

        val shallowUpdatedScramble = scrToDraw.copy(scrambleSet = randomScrambleDrawing.scrambleSet)
        val shallowScrToDraw = spyk(shallowUpdatedScramble)

        val deepUpdatedScramble = scrToDraw.copy(scrambleSet = scrToDraw.scrambleSet.copy(scrambles = randomScrambleDrawing.scrambleSet.scrambles))
        val deepScrToDraw = spyk(deepUpdatedScramble)

        val firstBase = scrToDraw.getCachedDummyPdf()
        val shallowPdf = shallowScrToDraw.getCachedDummyPdf()
        val deepPdf = deepScrToDraw.getCachedDummyPdf()

        verify(exactly = 1) { scrToDraw.createPdf(any(), any(), any(), any()) }
        verify(exactly = 1) { shallowScrToDraw.createPdf(any(), any(), any(), any()) }
        verify(exactly = 1) { deepScrToDraw.createPdf(any(), any(), any(), any()) }

        val secondBase = scrToDraw.getCachedDummyPdf()

        verify(exactly = 1) { scrToDraw.createPdf(any(), any(), any(), any()) }

        Assertions.assertSame(firstBase, secondBase)
        Assertions.assertNotSame(shallowPdf, deepPdf)
    }

    private fun randomScrambleSet(event: EventData): ScrambleDrawingData {
        val scrambles = event.scrambler.generateEfficientScrambles(5)
        val extraScrambles = event.scrambler.generateEfficientScrambles(2)

        val scrSet = ScrambleSet(42, scrambles.map(::Scramble), extraScrambles.map(::Scramble))
        return ScrambleDrawingData(scrSet, ActivityCode.compile(event, 1, 1))
    }

    private fun ScrambleDrawingData.getCachedDummyPdf() =
        getCachedPdf(TEST_INSTANCE, "fooVersion", "fooString", Locale.ENGLISH)
}
