package org.worldcubeassociation.tnoodle.server.exceptions

class BadWcifParameterException(message: String) : Exception(message) {
    companion object {
        fun error(message: String): Nothing = throw BadWcifParameterException(message)
    }
}
