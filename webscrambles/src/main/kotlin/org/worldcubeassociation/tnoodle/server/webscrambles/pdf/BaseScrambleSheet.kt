package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.Rectangle
import com.itextpdf.text.pdf.PdfReader
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.io.ByteArrayOutputStream

abstract class BaseScrambleSheet(val wcif: Competition, val activity: Activity) : BasePdfSheet<PdfWriter>(wcif.name) {
    override fun openDocument() =
        Document(PAGE_SIZE, 0f, 0f, 75f, 75f).apply {
            addCreationDate()
            addProducer()

            if (title != null) {
                addTitle(title)
            }
        }

    override fun Document.getWriter(bytes: ByteArrayOutputStream): PdfWriter {
        return PdfWriter.getInstance(this, bytes).apply {
            setBoxSize("art", Rectangle(36f, 54f, PAGE_SIZE.width - 36, PAGE_SIZE.height - 54))
        }
    }

    protected val scrambleSet = wcif.events.asSequence()
        .flatMap { it.rounds.asSequence() }
        .flatMap { it.scrambleSets.asSequence() }
        .find { it.id == activity.scrambleSetId } // FIXME WCIF if only one attempt specified, then only draw one scr (singleton list)
        ?: error("Cannot draw PDF: Scramble set for activity $activity not found in competition ${wcif.id}")

    protected val scramblingPuzzle = PuzzlePlugins.PUZZLES[activity.activityCode.eventId]?.value // FIXME WCIF bf --> ni
        ?: error("Cannot draw PDF: Scrambler for $activity not found in plugins")

    protected val currentRound = wcif.events.asSequence()
        .flatMap { it.rounds.asSequence() }
        .find { it.idCode.isParentOf(activity.activityCode) }
        ?: error("Cannot draw PDF: Round for activity $activity not found in competition ${wcif.id}")

    override fun finalise(processedBytes: ByteArrayOutputStream, password: String?): ByteArray {
        val pdfReader = PdfReader(processedBytes.toByteArray(), password?.toByteArray())

        val buffer = ByteArray(pdfReader.fileLength.toInt())
        pdfReader.safeFile.readFully(buffer)

        return buffer
    }
}
