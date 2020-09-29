package org.worldcubeassociation.tnoodle.server.model.cache

import kotlinx.atomicfu.atomic
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.produce
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import java.util.concurrent.Executors
import java.util.concurrent.ThreadFactory
import kotlin.coroutines.CoroutineContext

class CoroutineScrambleCacher(val puzzle: Puzzle, capacity: Int) : CoroutineScope {
    override val coroutineContext: CoroutineContext
        get() = JOB_CONTEXT

    @ExperimentalCoroutinesApi
    private val buffer = produce(capacity = capacity) {
        while (true) {
            send(puzzle.generateScramble())
                .also { size += 1 }
        }
    }

    private val size = atomic(0)

    val available: Int
        get() = size.value

    suspend fun yieldScramble(): String = buffer.receive()
        .also { size -= 1 }

    fun getScramble(): String = runBlocking { yieldScramble() }

    companion object {
        private val DAEMON_FACTORY = ThreadFactory { Executors.defaultThreadFactory().newThread(it).apply { isDaemon = true } }
        private val JOB_CONTEXT = Executors.newFixedThreadPool(2, DAEMON_FACTORY).asCoroutineDispatcher()
    }
}
