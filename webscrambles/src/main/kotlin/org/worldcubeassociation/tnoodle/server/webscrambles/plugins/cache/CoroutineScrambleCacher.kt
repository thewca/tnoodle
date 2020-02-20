package org.worldcubeassociation.tnoodle.server.webscrambles.plugins.cache

import kotlinx.coroutines.*
import kotlinx.coroutines.channels.produce
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.routing.job.JobSchedulingHandler
import kotlin.coroutines.CoroutineContext

class CoroutineScrambleCacher(val puzzle: Puzzle, capacity: Int) : CoroutineScope {
    var available: Int = 0
        private set

    override val coroutineContext: CoroutineContext
        get() = JobSchedulingHandler.JOB_CONTEXT

    @ExperimentalCoroutinesApi
    private val buffer = produce(capacity = capacity) {
        while (true) {
            send(puzzle.generateScramble())
                .also { synchronized(available) { available++ } }
        }
    }

    suspend fun yieldScramble(): String = buffer.receive()
        .also { synchronized(available) { available-- } }

    fun getScramble(): String = runBlocking { yieldScramble() }
}
