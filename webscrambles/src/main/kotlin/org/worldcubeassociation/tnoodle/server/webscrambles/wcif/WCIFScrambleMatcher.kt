package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.*

object WCIFScrambleMatcher {
    const val PSEUDO_ID = "%%pseudoGen"
    const val ID_PENDING = 0 // FIXME should this be -1?

    fun requestsToPseudoWCIF(requests: List<ScrambleRequest>, name: String): Competition {
        val rounds = requests.groupBy { it.event to it.round }
            .map { (k, it) ->
                val roundId = "${k.first}-r${k.second}"

                val avgScrambleSetSize = it.map { scr -> scr.scrambles.size }.average().toInt()
                val format = guessRoundFormat(avgScrambleSetSize, k.first)

                val scrambleSets = it.map { scr ->
                    ScrambleSet(
                        ID_PENDING, // dummy ID -- indexed separately down below
                        scr.scrambles.map(::Scramble),
                        scr.extraScrambles.map(::Scramble),
                        listOf(FmcExtension(scr.fmc))
                    )
                }

                Round(roundId, format, it.size, scrambleSets)
            }

        val events = rounds.groupBy { it.idCode.eventId }
            .map { Event(it.key, it.value) }

        val indexEvents = reindexScrambleSets(events)

        return Competition("1.0", PSEUDO_ID, name, name, indexEvents, Schedule.EMPTY)
    }

    fun fillScrambleSets(wcif: Competition): Competition {
        val scrambledEvents = wcif.events.map { e ->
            val scrambledRounds = e.rounds.map { r -> scrambleRound(r) }

            e.copy(rounds = scrambledRounds)
        }

        val indexedEvents = reindexScrambleSets(scrambledEvents)
        val scrambled = wcif.copy(events = indexedEvents)

        return matchActivities(scrambled)
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

    private fun scrambleRound(round: Round): Round {
        val scrambles = List(round.scrambleSetCount) { generateScrambleSet(round) }

        return round.copy(scrambleSets = scrambles)
    }

    // FIXME coroutines, progressBar
    private fun generateScrambleSet(round: Round): ScrambleSet {
        val puzzle = Event.findPuzzlePlugin(round.idCode.eventId)
            ?: error("Unable to load scrambler for Round ${round.idCode}")

        val scrambles = if (round.idCode.eventId == "333mbf") {
            val multiExtCount = round.findExtension<MultiScrambleCountExtension>()
                ?.data ?: error("No multiBLD number for round $round specified")

            List(round.expectedAttemptNum) {
                val scrambles = puzzle.generateEfficientScrambles(multiExtCount)
                    .joinToString(Scramble.WCIF_NEWLINE_CHAR)

                Scramble(scrambles)
            }
        } else {
            puzzle.generateEfficientScrambles(round.expectedAttemptNum).map { Scramble(it) }
        }

        val extraScrambleNum = round.findExtension<ExtraScrambleCountExtension>()?.data
            ?: defaultExtraCount(round.idCode.eventId)
        val extraScrambles = puzzle.generateEfficientScrambles(extraScrambleNum).map { Scramble(it) }

        // dummy ID -- indexing happens afterwards
        return ScrambleSet(ID_PENDING, scrambles, extraScrambles)
    }

    fun installExtensions(wcif: Competition, ext: Map<Extension, String>): Competition {
        return ext.entries.fold(wcif) { acc, e -> installExtensionForEvents(acc, e.key, e.value) }
    }

    private fun installExtensionForEvents(wcif: Competition, ext: Extension, eventId: String): Competition {
        fun installRoundExtension(e: Event): Event {
            val extendedRounds = e.rounds.map { r ->
                r.copy(extensions = r.withExtension(ext))
            }

            return e.copy(rounds = extendedRounds)
        }

        val extendedEvents = wcif.events.map { e ->
            e.takeUnless { it.id == eventId }
                ?: installRoundExtension(e)
        }

        return wcif.copy(events = extendedEvents)
    }

    private fun defaultExtraCount(eventId: String): Int {
        return when (eventId) {
            "333mbf", "333fm" -> 0
            else -> 2
        }
    }

    private fun guessRoundFormat(numScrambles: Int, eventId: String): String {
        return when (numScrambles) {
            1, 2 -> numScrambles.toString()
            3 -> when (eventId) {
                "333fm", "333bf" -> "m"
                else -> "3"
            }
            else -> "a"
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

        val reindexingActivities = allActivities.filter { it.id != ID_PENDING }
        val maxAssignedId = (allActivities - reindexingActivities)
            .maxBy { it.id }?.id ?: 1

        val idIndex = reindexingActivities.mapIndexed { i, act -> act to i + maxAssignedId }
            .toMap()

        return venues.map { v ->
            val matchedRooms = v.rooms.map { r ->
                val matchedActivities = r.activities.map { a ->
                    idIndex[a]?.let { a.copy(id = it) } ?: a
                }

                r.copy(activities = matchedActivities)
            }

            v.copy(rooms = matchedRooms)
        }
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
            ?: error("An activity of the schedule did not match an event.")
    }
}
