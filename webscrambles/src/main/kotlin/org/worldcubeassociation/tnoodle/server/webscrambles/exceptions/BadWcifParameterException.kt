package org.worldcubeassociation.tnoodle.server.webscrambles.exceptions

class BadWcifParameterException(message: String) : Exception(message) {
    companion object {
        fun error(message: String): Nothing = throw BadWcifParameterException(message)
    }
}

