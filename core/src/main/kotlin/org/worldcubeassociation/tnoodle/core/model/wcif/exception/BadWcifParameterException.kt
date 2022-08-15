package org.worldcubeassociation.tnoodle.core.model.wcif.exception

class BadWcifParameterException(message: String) : Exception(message) {
    companion object {
        fun error(message: String): Nothing = throw BadWcifParameterException(message)
    }
}

