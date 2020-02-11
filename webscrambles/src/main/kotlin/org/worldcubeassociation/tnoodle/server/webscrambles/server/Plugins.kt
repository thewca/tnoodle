package org.worldcubeassociation.tnoodle.server.webscrambles.server

import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.scrambles.PuzzleRegistry
import org.worldcubeassociation.tnoodle.scrambles.ScrambleCacher

class Plugins {
    private val filePlugins = mutableMapOf<String, Lazy<Puzzle>>()
    private val extraCachers = mutableMapOf<String, ScrambleCacher>()

    val plugins: Map<String, Lazy<Puzzle>>
        get() = filePlugins

    val cachers: Map<String, ScrambleCacher>
        get() = extraCachers

    fun register(value: PuzzleRegistry) {
        filePlugins[value.key] = lazy {
            value.also { extraCachers[it.key] = ScrambleCacher(it.scrambler, CACHE_SIZE, false) }.scrambler
        }
    }

    companion object {
        const val CACHE_SIZE = 30
    }
}
