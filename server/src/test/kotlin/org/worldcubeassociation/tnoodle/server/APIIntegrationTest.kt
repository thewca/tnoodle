package org.worldcubeassociation.tnoodle.server

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.*
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.function.ThrowingSupplier
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.wcif.UpcomingCompetition
import org.worldcubeassociation.tnoodle.server.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.wcif.WCIFDataBuilder.toDocuments
import org.worldcubeassociation.tnoodle.server.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.wcif.model.extension.MultiScrambleCountExtension
import java.time.LocalDateTime
import kotlin.random.Random
import kotlin.system.measureTimeMillis
import kotlin.time.Duration.Companion.seconds
import kotlin.time.measureTimedValue

class APIIntegrationTest {
    private fun getClient(): HttpClient {
        return HttpClient(CIO) {
            install(ContentNegotiation) {
                json(JsonConfig.SERIALIZER)
            }

            install(HttpTimeout) {
                // This matches the configuration of our monolith at the time of writing this comment
                requestTimeoutMillis = 60000
            }

            expectSuccess = true
        }
    }

    companion object {
        val MIN_REQUEST_INTERVAL = 5.seconds
    }

    @Test
    fun `test that every upcoming competition produces some output without error`() = runBlocking {
        // Fetch competition IDs and all WCIF payloads sequentially with rate limiting
        val fetchedWcifs = getClient().use { client ->
            val upcomingCompIds = client
                .get("https://www.worldcubeassociation.org/api/v0/competitions/")
                .body<List<UpcomingCompetition>>()
                .map { it.id }

            upcomingCompIds.mapIndexed { index, compId ->
                val url =
                    "https://www.worldcubeassociation.org/api/v0/competitions/$compId/wcif/version/${Competition.FORMAT_VERSION}"

                val (websiteWcif, fetchDuration) = measureTimedValue {
                    client.get(url).body<Competition>()
                }

                println("[$compId] Fetched WCIF in ${fetchDuration.inWholeMilliseconds} ms.")

                // Enforce 5-second pacing between requests (skip delay after the very last fetch)
                if (index < upcomingCompIds.lastIndex) {
                    val remainingWait = MIN_REQUEST_INTERVAL - fetchDuration

                    if (remainingWait.isPositive()) {
                        delay(remainingWait)
                    }
                }

                websiteWcif
            }
        }

        // Run all scramble generation and PDF/ZIP rendering in parallel
        val generationDate = LocalDateTime.now()

        val jobs = fetchedWcifs.map { wcif ->
            launch(Dispatchers.Default) {
                val multiCubes = MultiScrambleCountExtension(Random.nextInt(10, 20))
                val blankWcif =
                    WCIFScrambleMatcher.installExtensionForEvents(wcif, multiCubes, EventData.THREE_MULTI_BLD)

                println("[${wcif.id}] Computing scrambles…")
                val scrambledWcif = WCIFScrambleMatcher.fillScrambleSets(blankWcif)

                println("[${wcif.id}] Scrambles generated successfully. On to rendering the PDF…")
                val sheets = scrambledWcif.toDocuments("JUnit-Test", Translate.DEFAULT_LOCALE)
                val renderedPdf =
                    Assertions.assertDoesNotThrow(ThrowingSupplier { WCIFDataBuilder.compileOutlinePdf(sheets) })
                Assertions.assertTrue(renderedPdf.isNotEmpty())

                val computationTime = measureTimeMillis {
                    println("[${wcif.id}] Single PDF rendered successfully. On to compiling the ZIP…")
                    val completeZip = WCIFDataBuilder.wcifToZip(
                        scrambledWcif,
                        null,
                        "JUnit-Test",
                        Translate.DEFAULT_LOCALE,
                        generationDate,
                        "https://test.local"
                    )
                    Assertions.assertTrue(completeZip.allFiles.isNotEmpty())
                    val compiledZip = Assertions.assertDoesNotThrow(ThrowingSupplier { completeZip.compress() })
                    Assertions.assertTrue(compiledZip.isNotEmpty())
                }

                println("[${wcif.id}] ZIP compilation was successful! Took $computationTime ms")
            }
        }

        jobs.joinAll()
    }
}
