package org.worldcubeassociation.tnoodle.server.job

import io.ktor.websocket.*
import kotlinx.coroutines.CoroutineScope

sealed class StatusBackend {
    abstract suspend fun onProgress(worker: String)

    class JobRegistry(val jobId: Int) : StatusBackend() {
        override suspend fun onProgress(worker: String) = JobSchedulingHandler.registerProgress(jobId, worker)
    }

    data object NoOp : StatusBackend() {
        override suspend fun onProgress(worker: String) {}
    }

    class Websocket(val socket: WebSocketSession) : StatusBackend(), CoroutineScope by socket {
        override suspend fun onProgress(worker: String) {
            socket.send(worker)
        }
    }
}
