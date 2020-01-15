package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.WCIF
import kotlin.math.pow

data class WCIFRequestBinding(val wcif: WCIF, val activityScrambleRequests: Map<Activity, List<ScrambleRequest>>) {
    companion object {
        // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
        // If we ever accept any other such ignorable key, it should be added here.
        private val WCIF_IGNORABLE_KEYS = listOf("other")

        fun WCIF.computeBindings(allScrambleRequests: List<ScrambleRequest>): WCIFRequestBinding {
            val allActivities = schedule.venues
                .flatMap { it.rooms }
                .flatMap { it.activities }
                .flatMap { it.finestChildActivities } // FIXME do we want this w/ legacy?

            val index = allActivities.associateWith { allScrambleRequests.filterForActivity(it) }

            return WCIFRequestBinding(this, index)
        }

        fun List<ScrambleRequest>.filterForActivity(activity: Activity): List<ScrambleRequest> {
            val activitySplit = activity.activityCode.split("-")
            val event = activitySplit[0]

            if (event in WCIF_IGNORABLE_KEYS) {
                return emptyList()
            }

            // This part assumes every round, group and attempt is labeled with an integer from competitionJson
            val round = activitySplit.findPrefixedGroup("r")?.toInt() ?: 0
            val group = activitySplit.findPrefixedGroup("g")?.toInt() ?: 0
            val attempt = activitySplit.findPrefixedGroup("a")?.toInt() ?: 0

            // First, we add all requests whose events equals what we need
            val matchingRequests = filter { it.event == event }
                // Then, we start removing, depending on the defined details.
                .filter { round <= 0 || it.round == round }
                .filter { group <= 0 || it.group.orEmpty().matchesNumericalIndex(group) }

            val mappedRequests = matchingRequests.map { request ->
                request.takeUnless { attempt > 0 }
                    ?: request.copyForAttempt(attempt)
            }

            return mappedRequests.takeIf { it.isNotEmpty() }
                ?: error("An activity of the schedule did not match an event.")
        }

        fun List<String>.findPrefixedGroup(prefix: String) =
            find { it.startsWith(prefix) }?.substring(prefix.length)

        fun ScrambleRequest.copyForAttempt(targetAttempt: Int) =
            copy(
                scrambles = listOf(scrambles[targetAttempt - 1]),
                attempt = targetAttempt,
                totalAttempt = scrambles.size // useful for FMC
            )

        fun String.matchesNumericalIndex(number: Int): Boolean {
            val sum = reversed().withIndex().sumBy { (i, c) ->
                (c - 'A' + 1) * (26f.pow(i).toInt())
            }

            return sum == number
        }
    }
}
