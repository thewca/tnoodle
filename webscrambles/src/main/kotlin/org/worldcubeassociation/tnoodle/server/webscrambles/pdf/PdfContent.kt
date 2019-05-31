package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

interface PdfContent {
    fun render(password: String? = null): ByteArray
}
