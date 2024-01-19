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
        }
    }

    @Test
    fun `test that every upcoming competition produces some output without error`() = runBlocking {
        val upcomingComps =
            getClient().use {
                it.get("https://www.worldcubeassociation.org/api/v0/competitions/").body<List<UpcomingCompetition>>()
            }.shuffled()

        val generationDate = LocalDateTime.now()

        val jobs = upcomingComps.map { it.id }.map {
            launch(Dispatchers.Default) {
                val url = "https://www.worldcubeassociation.org/api/v0/competitions/$it/wcif/public"
                val multiCubes = MultiScrambleCountExtension(Random.nextInt(10, 20))

                val websiteWcif = getClient().use { it.get(url).body<Competition>() }
                val blankWcif =
                    WCIFScrambleMatcher.installExtensionForEvents(websiteWcif, multiCubes, EventData.THREE_MULTI_BLD)

                println("[$it] Fetched WCIF. On to computing scrambles…")
                val scrambledWcif = WCIFScrambleMatcher.fillScrambleSets(blankWcif)

                println("[$it] Scrambles generated successfully. On to rendering the PDF…")
                val sheets = scrambledWcif.toDocuments("JUnit-Test", Translate.DEFAULT_LOCALE)
                val renderedPdf =
                    Assertions.assertDoesNotThrow(ThrowingSupplier { WCIFDataBuilder.compileOutlinePdf(sheets) })
                Assertions.assertTrue(renderedPdf.isNotEmpty())

                val computationTime = measureTimeMillis {
                    println("[$it] Single PDF rendered successfully. On to compiling the ZIP…")
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

                println("[$it] ZIP compilation was successful! Took $computationTime ms")
            }
        }

        jobs.joinAll()
    }
}
