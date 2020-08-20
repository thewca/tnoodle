package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.application.ApplicationCall
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.cio.websocket.CloseReason
import io.ktor.http.cio.websocket.Frame
import io.ktor.http.cio.websocket.close
import io.ktor.websocket.WebSocketServerSession
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlin.coroutines.CoroutineContext

abstract class LongRunningJob<T> : CoroutineScope {
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Unconfined

    open val errorCodes: Map<Throwable, HttpStatusCode> = emptyMap()

    abstract suspend fun extractCall(call: ApplicationCall): T
    abstract suspend fun extractFrame(call: ApplicationCall, frame: Frame.Text): T

    abstract suspend fun T.compute(statusBackend: StatusBackend): Pair<ContentType, ByteArray>

    abstract fun getTargetState(data: T): Map<String, Int>
    abstract fun getResultMarker(data: T): String

    fun launch(request: T): JobCreationMessage {
        val jobId = JobSchedulingHandler.nextJobID()
        val statusBackend = StatusBackend.JobRegistry(jobId)

        launch {
            try {
                val (type, resultData) = request.compute(statusBackend)
                JobSchedulingHandler.registerResult(jobId, type, resultData)
            } catch (t: Throwable) {
                val probableCode = errorCodes[t] ?: HttpStatusCode.InternalServerError
                JobSchedulingHandler.reportError(jobId, probableCode, t)
            }
        }

        val targetState = getTargetState(request)
        return JobCreationMessage(jobId, targetState)
    }

    fun runBlocking(request: T): Pair<ContentType, ByteArray> {
        return runBlocking { request.compute(StatusBackend.NoOp) }
    }

    suspend fun channel(request: T, socket: WebSocketServerSession): Pair<ContentType, ByteArray> {
        val statusBackend = StatusBackend.Websocket(socket)

        try {
            return request.compute(statusBackend)
        } catch (t: Throwable) {
            socket.close(CloseReason(CloseReason.Codes.INTERNAL_ERROR, t.toString()))
            throw t
        }
    }
}
