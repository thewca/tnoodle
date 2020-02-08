package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.Rectangle
import com.itextpdf.text.pdf.PdfReader
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Event
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet
import java.io.ByteArrayOutputStream

abstract class BaseScrambleSheet(val scrambleSet: ScrambleSet, val activityCode: ActivityCode) : BasePdfSheet<PdfWriter>() {
    override fun openDocument() =
        Document(PAGE_SIZE, 0f, 0f, 75f, 75f).apply {
            addCreationDate()
            addProducer()
            addTitle(activityCode.compileTitleString())
        }

    override fun Document.getWriter(bytes: ByteArrayOutputStream): PdfWriter {
        return PdfWriter.getInstance(this, bytes).apply {
            setBoxSize("art", Rectangle(36f, 54f, PAGE_SIZE.width - 36, PAGE_SIZE.height - 54))
        }
    }

    protected val scramblingPuzzle = Event.loadScrambler(activityCode.eventId)
        ?: error("Cannot draw PDF: Scrambler for $activityCode not found in plugins")

    override fun finalise(processedBytes: ByteArrayOutputStream, password: String?): ByteArray {
        val pdfReader = PdfReader(processedBytes.toByteArray(), password?.toByteArray())

        val buffer = ByteArray(pdfReader.fileLength.toInt())
        pdfReader.safeFile.readFully(buffer)

        return buffer
    }
}
