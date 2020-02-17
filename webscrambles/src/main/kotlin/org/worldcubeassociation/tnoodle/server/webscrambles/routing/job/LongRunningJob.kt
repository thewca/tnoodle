package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.application.ApplicationCall
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlin.coroutines.CoroutineContext

abstract class LongRunningJob : CoroutineScope {
    override val coroutineContext: CoroutineContext
        get() = JobSchedulingHandler.JOB_CONTEXT

    abstract val targetStatus: Map<String, Int>
    open val errorCodes: Map<Throwable, HttpStatusCode> = emptyMap()

    abstract suspend fun ApplicationCall.compute(jobId: Int): Pair<ContentType, ByteArray>

    fun launch(call: ApplicationCall): Int {
        val jobId = JobSchedulingHandler.nextJobID()

        launch {
            try {
                val (type, data) = call.compute(jobId)
                JobSchedulingHandler.registerResult(jobId, type, data)
            } catch (t: Throwable) {
                val probableCode = errorCodes[t] ?: HttpStatusCode.InternalServerError
                JobSchedulingHandler.reportError(jobId, probableCode, t)
            }
        }

        return jobId
    }

    fun computeBlocking(call: ApplicationCall): Pair<ContentType, ByteArray> {
        // we don't _effectively_ need a jobId, but we register one
        // just to be sure the execution doesn't collide with other async executions
        val idleJobId = JobSchedulingHandler.nextJobID()

        return runBlocking { call.compute(idleJobId) }
    }
}
