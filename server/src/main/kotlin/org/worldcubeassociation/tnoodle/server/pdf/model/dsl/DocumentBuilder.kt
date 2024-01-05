package org.worldcubeassociation.tnoodle.server.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.pdf.model.Document
import org.worldcubeassociation.tnoodle.server.pdf.model.Page

class DocumentBuilder : PropertiesElementBuilder(null) {
    private val pages = mutableListOf<Page>()

    var title: String = ""
    var watermark: String? = null
    var showPageNumbers: Boolean = false
    var showHeaderTimestamp: Boolean = false
    var outlineGroup: List<String> = emptyList()

    fun page(fn: PageBuilder.() -> Unit) {
        val page = PageBuilder(this).apply(fn).compile()
        pages.add(page)
    }

    fun compile(): Document {
        return Document(title, watermark, showPageNumbers, showHeaderTimestamp, outlineGroup, false, pages)
    }
}

fun document(fn: DocumentBuilder.() -> Unit): Document {
    return DocumentBuilder().apply(fn).compile()
}
