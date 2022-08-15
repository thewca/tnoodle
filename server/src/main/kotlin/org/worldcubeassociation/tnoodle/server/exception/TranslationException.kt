package org.worldcubeassociation.tnoodle.server.exception

class TranslationException(message: String) : Exception(message) {
    companion object {
        fun error(message: String): Nothing = throw TranslationException(message)
    }
}
