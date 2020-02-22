package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.runBlocking
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.*

object WCIFScrambleMatcher {
    const val ID_PENDING = 0 // FIXME should this be -1?

    suspend fun fillScrambleSetsAsync(wcif: Competition, onUpdate: (PuzzlePlugins, String) -> Unit): Competition {
        val scrambledEvents = wcif.events.map { e ->
            val scrambledRounds = coroutineScope {
                e.rounds.map { r -> async { scrambleRound(r, onUpdate) } }.awaitAll()
            }

            e.copy(rounds = scrambledRounds)
        }

        val indexedEvents = reindexScrambleSets(scrambledEvents)
        val scrambled = wcif.copy(events = indexedEvents)

        return matchActivities(scrambled)
    }

    fun fillScrambleSets(wcif: Competition): Competition {
        return runBlocking { fillScrambleSetsAsync(wcif) { _, _ -> Unit } }
    }

    fun getScrambleCountsPerEvent(wcif: Competition): Map<String, Int> {
        return wcif.events.associateWith { it.rounds }
            .mapValues { (_, rs) ->
                rs.map { it.scrambleSetCount * scrambleCountPerSet(it) }.sum()
            }.mapKeys { it.key.id }
    }

    private fun scrambleCountPerSet(round: Round): Int {
        val baseCount = if (round.idCode.eventPlugin == EventPlugins.THREE_MULTI_BLD) {
            val multiExtCount = round.findExtension<MultiScrambleCountExtension>()
                ?.requestedScrambles ?: error("No multiBLD number for round $round specified")

            round.expectedAttemptNum * multiExtCount
        } else {
            round.expectedAttemptNum
        }

        val extraScrambleNum = round.findExtension<ExtraScrambleCountExtension>()?.extraAttempts
            ?: defaultExtraCount(round.idCode.eventPlugin)

        return baseCount + extraScrambleNum
    }

    private fun reindexScrambleSets(events: List<Event>): List<Event> {
        val indexTable = events.flatMap { it.rounds }
            .flatMap { it.scrambleSets }
            .mapIndexed { i, scr -> scr to i + 1 }
            .toMap()

        return events.map { e ->
            val reindexedRounds = e.rounds.map { r ->
                val reindexedScrambleSets = r.scrambleSets.map { s ->
                    val reIndex = indexTable.getValue(s)

                    s.copy(id = reIndex)
                }

                r.copy(scrambleSets = reindexedScrambleSets)
            }

            e.copy(rounds = reindexedRounds)
        }
    }

    private fun scrambleRound(round: Round, onUpdate: (PuzzlePlugins, String) -> Unit): Round {
        val scrambles = List(round.scrambleSetCount) { generateScrambleSet(round, onUpdate) }

        return round.copy(scrambleSets = scrambles)
    }

    private fun generateScrambleSet(round: Round, onUpdate: (PuzzlePlugins, String) -> Unit): ScrambleSet {
        val puzzle = Event.findPuzzlePlugin(round.idCode.eventId)
            ?: error("Unable to load scrambler for Round ${round.idCode}")

        val scrambles = if (round.idCode.eventPlugin == EventPlugins.THREE_MULTI_BLD) {
            val multiExtCount = round.findExtension<MultiScrambleCountExtension>()
                ?.requestedScrambles ?: error("No multiBLD number for round $round specified")

            List(round.expectedAttemptNum) {
                val scrambles = puzzle.generateEfficientScrambles(multiExtCount) { onUpdate(puzzle, it) }
                    .joinToString(Scramble.WCIF_NEWLINE_CHAR)

                Scramble(scrambles)
            }
        } else {
            puzzle.generateEfficientScrambles(round.expectedAttemptNum) { onUpdate(puzzle, it) }
                .map { Scramble(it) }
        }

        val extraScrambleNum = round.findExtension<ExtraScrambleCountExtension>()?.extraAttempts
            ?: defaultExtraCount(round.idCode.eventPlugin)
        val extraScrambles = puzzle.generateEfficientScrambles(extraScrambleNum) { onUpdate(puzzle, it) }
            .map { Scramble(it) }

        // dummy ID -- indexing happens afterwards
        return ScrambleSet(ID_PENDING, scrambles, extraScrambles)
    }

    fun installExtensions(wcif: Competition, ext: Map<ExtensionBuilder, EventPlugins>): Competition {
        return ext.entries.fold(wcif) { acc, e -> installExtensionForEvents(acc, e.key, e.value) }
    }

    fun installExtensionForEvents(wcif: Competition, ext: ExtensionBuilder, event: EventPlugins): Competition {
        fun installRoundExtension(e: Event): Event {
            val extendedRounds = e.rounds.map { r ->
                r.copy(extensions = r.withExtension(ext))
            }

            return e.copy(rounds = extendedRounds)
        }

        val extendedEvents = wcif.events.map { e ->
            e.takeUnless { it.id == event.key }
                ?: installRoundExtension(e)
        }

        return wcif.copy(events = extendedEvents)
    }

    private fun defaultExtraCount(event: EventPlugins?): Int {
        return when (event) {
            EventPlugins.THREE_MULTI_BLD, EventPlugins.THREE_FM -> 0
            else -> 2
        }
    }

    fun matchActivities(wcif: Competition): Competition {
        val matchedVenues = wcif.schedule.venues.map { v ->
            val matchedRooms = v.rooms.map { r ->
                val matchedActivities = r.activities.map { a ->
                    matchActivity(a, wcif)
                }

                r.copy(activities = matchedActivities)
            }

            v.copy(rooms = matchedRooms)
        }

        val matchedVenuesWithIndex = reindexActivities(matchedVenues)
        val matchedSchedule = wcif.schedule.copy(venues = matchedVenuesWithIndex)

        return wcif.copy(schedule = matchedSchedule)
    }

    private fun reindexActivities(venues: List<Venue>): List<Venue> {
        val allActivities = venues.flatMap { it.rooms }
            .flatMap { it.activities }
            .flatMap { it.selfAndChildActivities }

        val reindexingActivities = allActivities.filter { it.id == ID_PENDING }
        val maxAssignedId = (allActivities - reindexingActivities)
            .maxBy { it.id }?.id ?: 1

        val idIndex = reindexingActivities.mapIndexed { i, act -> act to i + maxAssignedId + 1 }
            .toMap()

        return venues.map { v ->
            val matchedRooms = v.rooms.map { r ->
                val matchedActivities = r.activities.map { a ->
                    reindexActivityAndChildren(a, idIndex)
                }

                r.copy(activities = matchedActivities)
            }

            v.copy(rooms = matchedRooms)
        }
    }

    private fun reindexActivityAndChildren(activity: Activity, index: Map<Activity, Int>): Activity {
        val reindexedChildren = activity.childActivities.map { reindexActivityAndChildren(it, index) }
        val reindexId = index[activity] ?: activity.id

        return activity.copy(id = reindexId, childActivities = reindexedChildren)
    }

    private fun matchActivity(activity: Activity, wcif: Competition): Activity {
        if (activity.activityCode.eventId in ActivityCode.IGNORABLE_KEYS) {
            return activity
        }

        val children = activity.childActivities

        // we have children that need to be specified!
        if (children.isNotEmpty()) {
            val matchedChildren = children.map { matchActivity(it, wcif) }
            return activity.copy(childActivities = matchedChildren)
        }

        val matchedRound = findRound(wcif, activity)
        val actGroup = activity.activityCode.groupNumber

        // uh oh. no child activities where there should be some.
        if (actGroup == null) {
            val actAttempt = activity.activityCode.attemptNumber

            // resort to creating them ourselves…
            if (actAttempt == null) {
                val inventedChildren = List(matchedRound.scrambleSetCount) {
                    val copiedActCode = activity.activityCode.copyParts(groupNumber = it + 1)
                    val childSetId = matchedRound.scrambleSets[it].id

                    activity.copy(id = ID_PENDING, activityCode = copiedActCode, childActivities = listOf(), scrambleSetId = childSetId)
                }

                return activity.copy(childActivities = inventedChildren)
            }

            if (matchedRound.scrambleSetCount > 1) {
                error("Attempt-only specification ${activity.activityCode} for activity ${activity.id} is impossible to match")
            }

            val onlyPossibleSet = matchedRound.scrambleSets.single()
            return activity.copy(scrambleSetId = onlyPossibleSet.id)
        }

        val scrambleSet = matchedRound.scrambleSets[actGroup - 1]

        return activity.copy(scrambleSetId = scrambleSet.id)
    }

    private fun findRound(wcif: Competition, activity: Activity): Round {
        return wcif.events
            .filter { it.id == activity.activityCode.eventId }
            .flatMap { it.rounds }
            .find { it.idCode.isParentOf(activity.activityCode) }
            ?: error("An activity of the schedule did not match an event: $activity")
    }
}
