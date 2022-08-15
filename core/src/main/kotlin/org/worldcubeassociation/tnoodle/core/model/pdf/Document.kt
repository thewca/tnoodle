package org.worldcubeassociation.tnoodle.core.model.pdf

data class Document(
    val title: String,
    val watermark: String? = null,
    val showPageNumbers: Boolean = false,
    val showHeaderTimestamp: Boolean = false,
    val outlineGroup: List<String> = emptyList(),
    val isShadowCopy: Boolean = false,
    val pages: List<Page>
) : ContainerElement<Page>(pages) {
    companion object {
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
