package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.application.ApplicationCall
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.worldcubeassociation.tnoodle.server.model.cache.CoroutineScrambleCacher
import kotlin.coroutines.CoroutineContext

abstract class LongRunningJob<T> : CoroutineScope {
    override val coroutineContext: CoroutineContext
        get() = CoroutineScrambleCacher.JOB_CONTEXT

    open val errorCodes: Map<Throwable, HttpStatusCode> = emptyMap()

    abstract suspend fun extractCall(call: ApplicationCall): T

    abstract suspend fun T.compute(statusBackend: StatusBackend): Pair<ContentType, ByteArray>

    abstract fun getTargetState(data: T): Map<String, Int>

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

    fun computeBlocking(request: T): Pair<ContentType, ByteArray> {
        return runBlocking { request.compute(StatusBackend.NoOp) }
    }
}
