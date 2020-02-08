package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtraScrambleCountExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcExtension

object WCIFBindingGenerator {
    const val PSEUDO_ID = "%%pseudoGen"

    fun requestsToPseudoWCIF(requests: List<ScrambleRequest>, name: String): Competition {
        val rounds = requests.groupBy { it.event to it.round }
            .map { (k, it) ->
                val roundId = "${k.first}-r${k.second}"

                val avgScrambleSetSize = it.map { scr -> scr.scrambles.size }.average().toInt()
                val format = guessRoundFormat(avgScrambleSetSize, k.first)

                val scrambleSets = it.map { scr ->
                    ScrambleSet(
                        42, // dummy ID -- indexed separately down below
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
            .mapIndexed { i, scr -> scr to i }
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

    private fun generateScrambleSet(round: Round): ScrambleSet {
        val puzzle = Event.loadScrambler(round.idCode.eventId)
            ?: error("Unable to load scrambler for Round ${round.idCode}")

        val scrambles = puzzle.generateScrambles(round.expectedAttemptNum).asList().map { Scramble(it) }

        val extraScrambleNum = round.findExtension<ExtraScrambleCountExtension>()?.data
            ?: defaultExtraCount(round.idCode.eventId)
        val extraScrambles = puzzle.generateScrambles(extraScrambleNum).asList().map { Scramble(it) }

        // FIXME WCIF how to handle 333mbf?
        // dummy ID -- indexing happens afterwards
        return ScrambleSet(42, scrambles, extraScrambles)
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

        val matchedSchedule = wcif.schedule.copy(venues = matchedVenues)
        return wcif.copy(schedule = matchedSchedule)
    }

    private fun matchActivity(activity: Activity, wcif: Competition): Activity {
        if (activity.activityCode.eventId in ActivityCode.IGNORABLE_KEYS) {
            return activity
        }

        val matchedId = findScrambleSetId(wcif, activity)
        val matchedChildren = activity.childActivities.map { matchActivity(it, wcif) }

        return activity.copy(scrambleSetId = matchedId, childActivities = matchedChildren)
    }

    private fun findScrambleSetId(wcif: Competition, activity: Activity): Int {
        val matchingSets = wcif.events
            .filter { it.id == activity.activityCode.eventId }
            .flatMap { it.rounds }
            .find { it.idCode.isParentOf(activity.activityCode) }
            ?.scrambleSets ?: error("An activity of the schedule did not match an event.")

        val groupNumber = activity.activityCode.groupNumber ?: error("Trying to match an Activity that has no group!")

        return matchingSets[groupNumber].id
    }
}
