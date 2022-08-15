package org.worldcubeassociation.tnoodle.server.exception

class ScheduleMatchingException(message: String) : Exception(message) {
    companion object {
        fun error(message: String): Nothing = throw ScheduleMatchingException(message)
    }
}
