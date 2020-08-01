package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import io.ktor.application.call
import io.ktor.features.StatusPages
import io.ktor.http.HttpStatusCode
import io.ktor.response.respond
import kotlinx.serialization.Serializable
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

        inline fun <reified T : Throwable> StatusPages.Configuration.frontendException(status: HttpStatusCode) =
            exception<T> { call.respond(status, it.asFrontendError()) }
    }
}
