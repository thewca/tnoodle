package org.worldcubeassociation.tnoodle.server.webscrambles.exceptions

class TranslationException(message: String) : Exception(message) {
    companion object {
        fun error(message: String): Nothing = throw TranslationException(message)
    }
}
