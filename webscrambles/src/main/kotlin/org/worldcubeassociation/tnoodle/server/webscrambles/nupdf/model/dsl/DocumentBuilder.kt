package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl

import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Page
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Paper

class DocumentBuilder : PropertiesElementBuilder(null) {
    private val pages = mutableListOf<Page>()

    var title: String = ""

    fun page(fn: PageBuilder.() -> Unit) {
        val page = PageBuilder(this).apply(fn).compile()
        pages.add(page)
    }

    fun compile(): Document {
        return Document(title, pages)
    }
}

fun document(fn: DocumentBuilder.() -> Unit): Document {
    return DocumentBuilder().apply(fn).compile()
}
