package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.engine.IText7Engine

class Document(
    val title: String,
    val watermark: String? = null,
    val showPageNumbers: Boolean = false,
    val showHeaderTimestamp: Boolean = false,
    val outlineGroup: List<String> = emptyList(),
    val isShadowCopy: Boolean = false,
    val pages: List<Page>
) : ContainerElement<Page>(pages) {
    private val renderingCache by lazy { directRender(null) }

    fun render(password: String? = null): ByteArray {
        if (password == null)
            return renderingCache

        return directRender(password)
    }

    private fun directRender(password: String? = null): ByteArray {
        // TODO GB default engine configurable?
        return DEFAULT_ENGINE.render(this, password)
    }

    companion object {
        val DEFAULT_ENGINE = IText7Engine

        fun merge(title: String, vararg documents: Document): Document {
            val pages = documents.flatMap { it.pages }

            return Document(
                title,
                null,
                documents.any { it.showPageNumbers },
                documents.any { it.showHeaderTimestamp },
                emptyList(),
                false,
                pages
            )
        }

        fun clone(doc: Document, numCopies: Int): List<Document> {
            return List(numCopies) {
                Document(
                    doc.title,
                    doc.watermark,
                    doc.showPageNumbers,
                    doc.showHeaderTimestamp,
                    doc.outlineGroup,
                    it > 0,
                    doc.pages
                )
            }
        }
    }
}
