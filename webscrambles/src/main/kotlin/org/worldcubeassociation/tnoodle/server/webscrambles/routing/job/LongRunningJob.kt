package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.application.ApplicationCall
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlin.coroutines.CoroutineContext

abstract class LongRunningJob<T> : CoroutineScope {
    override val coroutineContext: CoroutineContext
        get() = JobSchedulingHandler.JOB_CONTEXT

    open val errorCodes: Map<Throwable, HttpStatusCode> = emptyMap()

    abstract suspend fun ApplicationCall.extractData(): T
    abstract suspend fun T.compute(jobId: Int): Pair<ContentType, ByteArray>

    abstract fun getTargetState(data: T): Map<String, Int>

    fun launch(call: ApplicationCall): JobCreationMessage {
        val jobId = JobSchedulingHandler.nextJobID()
        val execData = runBlocking { call.extractData() } // FIXME is there a prettier alternative than blocking?

        launch {
            try {
                val (type, resultData) = execData.compute(jobId)
                JobSchedulingHandler.registerResult(jobId, type, resultData)
            } catch (t: Throwable) {
                val probableCode = errorCodes[t] ?: HttpStatusCode.InternalServerError
                JobSchedulingHandler.reportError(jobId, probableCode, t)
            }
        }

        val targetState = getTargetState(execData)
        return JobCreationMessage(jobId, targetState)
    }

    fun computeBlocking(call: ApplicationCall): Pair<ContentType, ByteArray> {
        // we don't _effectively_ need a jobId, but we register one
        // just to be sure the execution doesn't collide with other async executions
        val idleJobId = JobSchedulingHandler.nextJobID()

        return runBlocking {
            call.extractData()
                .compute(idleJobId)
        }
    }
}
