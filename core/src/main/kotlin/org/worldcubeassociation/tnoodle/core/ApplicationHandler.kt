package org.worldcubeassociation.tnoodle.core

import io.ktor.server.application.Application

interface ApplicationHandler {
    fun spinUp(app: Application)
}
