package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model

class Document(val title: String, val pages: List<Page>) : ContainerElement<Page>(pages) {
    companion object {
        fun merge(title: String, vararg documents: Document): Document {
            val pages = documents.flatMap { it.pages }
            return Document(title, pages)
        }
    }
}
