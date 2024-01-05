package org.worldcubeassociation.tnoodle.server.job

import io.ktor.websocket.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

sealed class StatusBackend {
    abstract fun onProgress(worker: String)

    class JobRegistry(val jobId: Int) : StatusBackend() {
        override fun onProgress(worker: String) = JobSchedulingHandler.registerProgress(jobId, worker)
    }

    object NoOp : StatusBackend() {
        override fun onProgress(worker: String) {}
    }

    class Websocket(val socket: WebSocketSession) : StatusBackend(), CoroutineScope by socket {
        override fun onProgress(worker: String) {
            launch { socket.send(worker) }
        }
    }
}
