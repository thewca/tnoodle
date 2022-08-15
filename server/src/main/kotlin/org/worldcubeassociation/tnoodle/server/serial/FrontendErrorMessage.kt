package org.worldcubeassociation.tnoodle.server.serial

import io.ktor.http.HttpStatusCode
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.serial.LocalDateTimeSerializer
import java.io.PrintWriter
import java.io.StringWriter
import java.time.LocalDateTime

@Serializable
data class FrontendErrorMessage(
    val timestamp: @Serializable(with = LocalDateTimeSerializer::class) LocalDateTime,
    val message: String,
    val stackTrace: String
) {
    companion object {
        fun Throwable.asFrontendError(): FrontendErrorMessage {
            return FrontendErrorMessage(
                LocalDateTime.now(),
                message.orEmpty(),
                humanStackTrace()
            )
        }

        fun Throwable.humanStackTrace() =
            StringWriter().also { PrintWriter(it).use(this::printStackTrace) }.toString()

        inline fun <reified T : Throwable> StatusPagesConfig.frontendException(status: HttpStatusCode) =
            exception<T> { call, cause -> call.respond(status, cause.asFrontendError()) }
    }
}
