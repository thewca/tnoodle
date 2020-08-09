package org.worldcubeassociation.tnoodle.server.webscrambles.routing.job

sealed class StatusBackend {
    abstract fun onProgress(worker: String)

    class JobRegistry(val jobId: Int) : StatusBackend() {
        override fun onProgress(worker: String) = JobSchedulingHandler.registerProgress(jobId, worker)
    }

    object NoOp : StatusBackend() {
        override fun onProgress(worker: String) {}
    }
}
