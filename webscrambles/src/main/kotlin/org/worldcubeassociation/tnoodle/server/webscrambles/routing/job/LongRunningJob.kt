package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

import io.ktor.http.ContentType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

abstract class LongRunningJob {
    abstract val targetStatus: Map<String, Int>

    abstract suspend fun compute(jobId: Int): Pair<ContentType, ByteArray>

    fun launch(scope: CoroutineScope): Int {
        val jobId = JobSchedulingHandler.nextJobID()

        scope.launch(context = JobSchedulingHandler.JOB_CONTEXT) {
            val (type, data) = compute(jobId)
            JobSchedulingHandler.registerResult(jobId, type, data)
        }

        return jobId
    }
}
