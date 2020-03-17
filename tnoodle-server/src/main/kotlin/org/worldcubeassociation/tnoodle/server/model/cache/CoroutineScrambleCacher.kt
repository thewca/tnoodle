package org.worldcubeassociation.tnoodle.server.model.cache

import kotlinx.coroutines.*
import kotlinx.coroutines.channels.produce
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import java.util.concurrent.Executors
import java.util.concurrent.ThreadFactory
import kotlin.coroutines.CoroutineContext

class CoroutineScrambleCacher(val puzzle: Puzzle, capacity: Int) : CoroutineScope {
    var available: Int = 0
        private set

    override val coroutineContext: CoroutineContext
        get() = JOB_CONTEXT

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

    companion object {
        val DAEMON_FACTORY = ThreadFactory { Executors.defaultThreadFactory().newThread(it).apply { isDaemon = true } }

        val JOB_CONTEXT = Executors.newFixedThreadPool(2, DAEMON_FACTORY).asCoroutineDispatcher()
    }
}
