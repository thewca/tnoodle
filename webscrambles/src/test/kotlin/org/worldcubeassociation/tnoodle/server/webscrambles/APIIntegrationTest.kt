package org.worldcubeassociation.tnoodle.server.webscrambles

import kotlinx.serialization.list
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.function.ThrowingSupplier
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.UpcomingCompetition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.MultiScrambleCountExtension
import java.net.URL
import java.time.LocalDateTime
import kotlin.random.Random
import kotlin.system.measureTimeMillis

object APIIntegrationTest {
    @Test
    fun `test that every upcoming competition produces some output without error`() {
        val upcomingRaw = URL("https://www.worldcubeassociation.org/api/v0/competitions/").readText()
        val upcomingComps = JsonConfig.SERIALIZER.parse(UpcomingCompetition.serializer().list, upcomingRaw)

        val generationDate = LocalDateTime.now()
        val testCompCount = upcomingComps.size

        for ((i, upcomingComp) in upcomingComps.withIndex()) {
            val id = upcomingComp.id
            println("(${i+1}/$testCompCount) Testing ZIP builder for '${upcomingComp.name}' (id $id)")

            val url = "https://www.worldcubeassociation.org/api/v0/competitions/$id/wcif/public"

            val wcifRaw = URL(url).readText()
            val multiCubes = MultiScrambleCountExtension(Random.nextInt(10, 20))

            val blankWcif = WCIFParser.parseComplete(wcifRaw).run {
                WCIFScrambleMatcher.installExtensionForEvents(this, multiCubes, EventPlugins.THREE_MULTI_BLD)
            }

            println("Fetched WCIF. On to computing scrambles…")
            val scrambledWcif = WCIFScrambleMatcher.fillScrambleSets(blankWcif)

            println("Scrambles generated successfully. On to rendering the PDF…")
            val completePdf = WCIFDataBuilder.wcifToCompletePdf(scrambledWcif, generationDate.toLocalDate(), "JUnit-Test")
            val renderedPdf = Assertions.assertDoesNotThrow(ThrowingSupplier { completePdf.render() })
            Assertions.assertTrue(renderedPdf.isNotEmpty())

            val computationTime = measureTimeMillis {
                println("Single PDF rendered successfully. On to compiling the ZIP…")
                val completeZip = WCIFDataBuilder.wcifToZip(scrambledWcif, null, generationDate, "JUnit-Test", "https://test.local")
                Assertions.assertTrue(completeZip.allFiles.isNotEmpty())
                val compiledZip = Assertions.assertDoesNotThrow(ThrowingSupplier { completeZip.compress() })
                Assertions.assertTrue(compiledZip.isNotEmpty())
            }

            println("ZIP compilation was successful! Took $computationTime ms")
            println()
        }
    }
}
