package org.worldcubeassociation.tnoodle.server

import io.ktor.server.application.Application

interface ApplicationHandler {
    fun spinUp(app: Application)
}
