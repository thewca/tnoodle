package org.worldcubeassociation.tnoodle.server

import io.ktor.application.Application

interface ApplicationHandler {
    fun spinUp(app: Application)
}
