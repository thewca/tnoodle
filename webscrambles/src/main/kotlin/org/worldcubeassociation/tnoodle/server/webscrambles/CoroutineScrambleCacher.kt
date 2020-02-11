package org.worldcubeassociation.tnoodle.server.webscrambles

import kotlinx.coroutines.*
import kotlinx.coroutines.channels.produce
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import java.util.concurrent.Executors
import kotlin.coroutines.CoroutineContext

class CoroutineScrambleCacher(val puzzle: Puzzle, capacity: Int) : CoroutineScope {
    var available: Int = 0
        private set

    override val coroutineContext: CoroutineContext
        get() = THREAD_POOL

    @ExperimentalCoroutinesApi
    private val buffer = produce(capacity = capacity) {
        while (true) {
            send(puzzle.generateScramble())
            synchronized(available) { available++ }
        }
    }

    suspend fun yieldScramble(): String = buffer.receive()
        .also { synchronized(available) { available-- } }

    fun getScramble(): String = runBlocking { yieldScramble() }

    companion object {
        val THREAD_POOL = Executors.newFixedThreadPool(2).asCoroutineDispatcher()
    }
}
