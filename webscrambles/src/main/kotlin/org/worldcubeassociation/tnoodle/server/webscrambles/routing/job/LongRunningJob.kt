package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.application.ApplicationCall
import io.ktor.http.ContentType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

abstract class LongRunningJob {
    abstract val targetStatus: Map<String, Int>

    abstract suspend fun ApplicationCall.compute(jobId: Int): Pair<ContentType, ByteArray>

    fun launch(call: ApplicationCall, scope: CoroutineScope): Int {
        val jobId = JobSchedulingHandler.nextJobID()

        scope.launch(context = JobSchedulingHandler.JOB_CONTEXT) {
            val (type, data) = call.compute(jobId)
            JobSchedulingHandler.registerResult(jobId, type, data)
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
