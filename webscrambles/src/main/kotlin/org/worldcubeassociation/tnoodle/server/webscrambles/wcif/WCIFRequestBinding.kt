package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Event
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import kotlin.math.*

data class WCIFRequestBinding(val wcif: Competition, val activityScrambleRequests: Map<Activity, List<ScrambleRequest>>) {
    companion object {
        private val EVENT_MAPPING = mapOf(
            "333bf" to "333ni",
            "333oh" to "333",
            "444bf" to "444ni",
            "555bf" to "555ni",
            "333mbf" to "333ni"
        )

        private val FORMAT_SCRAMBLE_COUNTS = mapOf(
            "a" to 5,
            "m" to 3
        )

        fun Competition.computeBindings(allScrambleRequests: List<ScrambleRequest>): WCIFRequestBinding {
            val index = schedule.allActivities
                .associateWith { allScrambleRequests.filterForActivity(it) }

            return WCIFRequestBinding(this, index)
        }

        fun Competition.generateBindings(title: String): WCIFRequestBinding {
            val index = schedule.allActivities
                .associateWith { it.createScrambleRequest(title, events) }
                .mapValues { listOfNotNull(it.value) }

            return WCIFRequestBinding(this, index)
        }

        fun List<ScrambleRequest>.filterForActivity(activity: Activity): List<ScrambleRequest> {
            val event = activity.activityCode.eventId

            if (event in ActivityCode.IGNORABLE_KEYS) {
                return emptyList()
            }

            // This part assumes every round, group and attempt is labeled with an integer from competitionJson
            val round = activity.activityCode.roundNumber ?: 0
            val group = activity.activityCode.groupNumber ?: 0
            val attempt = activity.activityCode.attemptNumber ?: 0

            // First, we add all requests whose events equals what we need
            val matchingRequests = filter { it.event == event }
                // Then, we start removing, depending on the defined details.
                .filter { round <= 0 || it.round == round }
                .filter { group <= 0 || it.group.orEmpty().toNumericalIndex() == group }

            val mappedRequests = matchingRequests.map { request ->
                request.takeUnless { attempt > 0 }
                    ?: request.copyForAttempt(attempt)
            }

            return mappedRequests.takeIf { it.isNotEmpty() }
                ?: error("An activity of the schedule did not match an event.")
        }

        fun ScrambleRequest.copyForAttempt(targetAttempt: Int) =
            copy(
                scrambles = listOf(scrambles[targetAttempt - 1]),
                attempt = targetAttempt,
                totalAttempt = scrambles.size // useful for FMC
            )

        fun Activity.createScrambleRequest(title: String, events: List<Event>, copies: Int = 1): ScrambleRequest? {
            val eventString = activityCode.eventId
            val puzzleString = EVENT_MAPPING[eventString] ?: eventString

            if (puzzleString in ActivityCode.IGNORABLE_KEYS) {
                return null
            }

            val isFmc = "fm" in eventString

            val matchingEvent = events.find { eventString == it.id }
                ?: error("No maching event in WCIF was found for $activityCode")

            val matchingRound = matchingEvent.rounds.find { it.idCode.isParentOf(activityCode) }
                ?: error("No matching round in WCIF was found for $activityCode")

            val scrambleCount = matchingRound.format.toIntOrNull()
                ?: FORMAT_SCRAMBLE_COUNTS[matchingRound.format]
                ?: error("Unable to determine preferred number of scrambles for format ${matchingRound.format}")

            val parsedRequest = ScrambleRequest.parseScrambleRequest(title, "$puzzleString*$scrambleCount*$copies", null)
                .copy(event = eventString, fmc = isFmc)

            val round = activityCode.roundNumber ?: parsedRequest.round
            val group = activityCode.groupNumber?.toColumnIndexString() ?: parsedRequest.group
            val attempt = activityCode.attemptNumber ?: parsedRequest.attempt

            return parsedRequest.copy(round = round, group = group, attempt = attempt)
        }

        fun String.toNumericalIndex(): Int {
            return reversed().withIndex().sumBy { (i, c) ->
                (c - ('A' - 1)) * (26f.pow(i).toInt())
            }
        }

        fun Int.toColumnIndexString(): String {
            val iterLength = max(1, ceil(log(this.toFloat(), 26f)).roundToInt())

            return List(iterLength) {
                ('A' - 1) + ((this / 26f.pow(it).toInt()) % 26)
            }.joinToString("").reversed()
        }
    }
}
