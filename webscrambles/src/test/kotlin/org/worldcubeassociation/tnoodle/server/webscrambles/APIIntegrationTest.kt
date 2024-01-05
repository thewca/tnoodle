package org.worldcubeassociation.tnoodle.server.webscrambles

import kotlinx.coroutines.*
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.function.ThrowingSupplier
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.UpcomingCompetition
import org.worldcubeassociation.tnoodle.server.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.wcif.WCIFDataBuilder.toDocuments
import org.worldcubeassociation.tnoodle.server.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.wcif.model.extension.MultiScrambleCountExtension
import java.net.URL
import java.time.LocalDateTime
import kotlin.random.Random
import kotlin.system.measureTimeMillis

class APIIntegrationTest {
    @Test
    fun `test that every upcoming competition produces some output without error`() = runBlocking {
        val upcomingRaw = withContext(Dispatchers.IO) { URL("https://www.worldcubeassociation.org/api/v0/competitions/").readText() }
        val upcomingComps = JsonConfig.SERIALIZER.decodeFromString<List<UpcomingCompetition>>(upcomingRaw).shuffled()

        val generationDate = LocalDateTime.now()

        val jobs = upcomingComps.map { it.id }.map {
            launch(Dispatchers.Default) {
                val url = "https://www.worldcubeassociation.org/api/v0/competitions/$it/wcif/public"

                val wcifRaw = withContext(Dispatchers.IO) { URL(url).readText() }
                val multiCubes = MultiScrambleCountExtension(Random.nextInt(10, 20))

                val websiteWcif = JsonConfig.SERIALIZER.decodeFromString(Competition.serializer(), wcifRaw)
                val blankWcif = WCIFScrambleMatcher.installExtensionForEvents(websiteWcif, multiCubes, EventData.THREE_MULTI_BLD)

                println("[$it] Fetched WCIF. On to computing scrambles…")
                val scrambledWcif = WCIFScrambleMatcher.fillScrambleSets(blankWcif)

                println("[$it] Scrambles generated successfully. On to rendering the PDF…")
                val sheets = scrambledWcif.toDocuments("JUnit-Test", Translate.DEFAULT_LOCALE)
                val renderedPdf = Assertions.assertDoesNotThrow(ThrowingSupplier { WCIFDataBuilder.compileOutlinePdf(sheets) })
                Assertions.assertTrue(renderedPdf.isNotEmpty())

                val computationTime = measureTimeMillis {
                    println("[$it] Single PDF rendered successfully. On to compiling the ZIP…")
                    val completeZip = WCIFDataBuilder.wcifToZip(scrambledWcif, null, "JUnit-Test", Translate.DEFAULT_LOCALE, generationDate, "https://test.local")
                    Assertions.assertTrue(completeZip.allFiles.isNotEmpty())
                    val compiledZip = Assertions.assertDoesNotThrow(ThrowingSupplier { completeZip.compress() })
                    Assertions.assertTrue(compiledZip.isNotEmpty())
                }

                println("[$it] ZIP compilation was successful! Took $computationTime ms")
            }
        }

        jobs.joinAll()
    }
}
