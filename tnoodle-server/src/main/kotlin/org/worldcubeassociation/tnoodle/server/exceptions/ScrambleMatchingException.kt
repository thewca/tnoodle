package org.worldcubeassociation.tnoodle.server.exceptions

class ScrambleMatchingException(message: String) : Exception(message) {
    companion object {
        fun error(message: String): Nothing = throw ScrambleMatchingException(message)
    }
}
