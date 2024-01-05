package org.worldcubeassociation.tnoodle.server.wcif

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.runBlocking
import org.worldcubeassociation.tnoodle.server.crypto.StringEncryption
import org.worldcubeassociation.tnoodle.server.crypto.SymmetricCipher
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.exceptions.ScrambleMatchingException
import org.worldcubeassociation.tnoodle.server.wcif.model.*
import org.worldcubeassociation.tnoodle.server.wcif.model.extension.ExtensionBuilder
import org.worldcubeassociation.tnoodle.server.wcif.model.extension.ExtraScrambleCountExtension
import org.worldcubeassociation.tnoodle.server.wcif.model.extension.MultiScrambleCountExtension
import org.worldcubeassociation.tnoodle.server.wcif.provider.IndexingIdProvider
import java.security.Key
import javax.crypto.Cipher

object WCIFScrambleMatcher {
    const val ID_PENDING = 0

    // SCRAMBLE SET ENCRYPTION / DECRYPTION -----

    fun encryptScrambleSets(wcif: Competition, cipherKey: Key) =
        cryptScrambleSets(wcif, cipherKey, Cipher.ENCRYPT_MODE, StringEncryption::applyCipherEncrypt)

    fun encryptScrambleSets(wcif: Competition, password: String) =
        encryptScrambleSets(wcif, SymmetricCipher.generateKey(password))

    fun decryptScrambleSets(wcif: Competition, cipherKey: Key) =
        cryptScrambleSets(wcif, cipherKey, Cipher.DECRYPT_MODE, StringEncryption::applyCipherDecrypt)

    fun decryptScrambleSets(wcif: Competition, password: String) =
        decryptScrambleSets(wcif, SymmetricCipher.generateKey(password))

    private fun cryptScrambleSets(
        wcif: Competition,
        cipherKey: Key,
        cipherOpMode: Int,
        cipherMethod: (Cipher, String) -> String
    ): Competition {
        val initedCipherInstance = SymmetricCipher.CIPHER_INSTANCE
            .apply { init(cipherOpMode, cipherKey) }

        fun applyCipherToScrambles(scrambles: List<Scramble>, cipherFn: (String) -> String) =
            scrambles.map { it.copy(scrambleString = cipherFn(it.scrambleString)) }

        val scrambledEvents = wcif.events.map { e ->
            val scrambledRounds = e.rounds.map { r ->
                val cryptedSets = r.scrambleSets.map { scr ->
                    val cryptedStdScrambles =
                        applyCipherToScrambles(scr.scrambles) { cipherMethod(initedCipherInstance, it) }
                    val cryptedExtraScrambles =
                        applyCipherToScrambles(scr.extraScrambles) { cipherMethod(initedCipherInstance, it) }

                    scr.copy(scrambles = cryptedStdScrambles, extraScrambles = cryptedExtraScrambles)
                }

                r.copy(scrambleSets = cryptedSets)
            }

            e.copy(rounds = scrambledRounds)
        }

        return wcif.copy(events = scrambledEvents)
    }

    // SCRAMBLE SET FILLING -----

    suspend fun fillScrambleSetsAsync(wcif: Competition, onUpdate: (EventData, String) -> Unit): Competition {
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

    // helper fn for synchronously running tests
    fun fillScrambleSets(wcif: Competition) = runBlocking { fillScrambleSetsAsync(wcif) { _, _ -> } }

    private suspend fun scrambleRound(round: Round, onUpdate: (EventData, String) -> Unit): Round {
        val scrambles = coroutineScope {
            List(round.scrambleSetCount) { async { generateScrambleSet(round, onUpdate) } }.awaitAll()
        }

        return round.copy(scrambleSets = scrambles)
    }

    private fun generateScrambleSet(round: Round, onUpdate: (EventData, String) -> Unit): ScrambleSet {
        val eventModel = round.idCode.eventModel
            ?: ScrambleMatchingException.error("Unable to load scrambler for Round ${round.idCode}")

        val puzzle = eventModel.scrambler
        val totalScrambleNum = totalScrambleCountPerSet(round)

        // generate scrambles for a round all at once to allow for easy duplicate checking
        val rawScrambles = puzzle.generateEfficientScrambles(totalScrambleNum) { onUpdate(eventModel, it) }

        val scrambles = wrapRawScrambles(rawScrambles, round, false)
        val extraScrambles = wrapRawScrambles(rawScrambles, round, true)

        // dummy ID -- indexing happens afterwards
        return ScrambleSet(ID_PENDING, scrambles, extraScrambles)
    }

    private fun wrapRawScrambles(rawScrambles: List<String>, round: Round, isExtra: Boolean = false): List<Scramble> {
        val standardScrambleNum = standardScrambleCountPerSet(round)
        val extraScrambleNum = extraScrambleCountPerSet(round)

        if (round.idCode.eventModel == EventData.THREE_MULTI_BLD) {
            val standardCountPerAttempt = standardScrambleNum / round.expectedAttemptNum
            val extraCountPerAttempt = extraScrambleNum / round.expectedAttemptNum

            return List(round.expectedAttemptNum) { n ->
                val scrambles = rawScrambles
                    // drop previous attempts first
                    .drop(n * (standardCountPerAttempt + extraCountPerAttempt))
                    // then slice the relevant scrambles *within* the current attempt
                    .sliceScrambles(standardCountPerAttempt, extraCountPerAttempt, isExtra)
                    .joinToString(Scramble.WCIF_NEWLINE_CHAR)

                Scramble(scrambles)
            }
        } else {
            return rawScrambles.sliceScrambles(standardScrambleNum, extraScrambleNum, isExtra)
                .map(::Scramble)
        }
    }

    private fun <T> List<T>.sliceScrambles(standardCount: Int, extraCount: Int, isExtra: Boolean = false): List<T> {
        // This is a bit wild. We generate *all* scrambles for a round at once,
        // in order to be able to easily check for duplicates during generation.
        // But in the WCIF model, we want to split "standard" scrambles from extra scrambles.
        return this
            // so if we want extra scrambles, we skip over the standard scrambles
            .drop(if (isExtra) standardCount else 0)
            // and then we either take the remaining extra scrambles or the first N standard scrambles.
            .take(if (isExtra) extraCount else standardCount)
    }

    private fun standardScrambleCountPerSet(round: Round): Int {
        return if (round.idCode.eventModel == EventData.THREE_MULTI_BLD) {
            val multiExtCount = round.findExtension<MultiScrambleCountExtension>()
                ?.requestedScrambles ?: ScrambleMatchingException.error("No multiBLD number for round $round specified")

            round.expectedAttemptNum * multiExtCount
        } else {
            round.expectedAttemptNum
        }
    }

    private fun extraScrambleCountPerSet(round: Round): Int {
        val baseExtraCount = round.findExtension<ExtraScrambleCountExtension>()?.extraAttempts
            ?: defaultExtraCount(round.idCode.eventModel)

        if (round.idCode.eventModel == EventData.THREE_MULTI_BLD)
            return baseExtraCount * round.expectedAttemptNum

        return baseExtraCount
    }

    private fun defaultExtraCount(event: EventData?): Int {
        return when (event) {
            EventData.THREE_MULTI_BLD, EventData.THREE_FM -> 0
            else -> 2
        }
    }

    // JOB RESULT SCRAMBLE COUNT COMPUTATION -----

    fun getScrambleCountsPerEvent(wcif: Competition): Map<String, Int> {
        return wcif.events.associateWith { it.rounds }
            .mapValues { (_, rs) ->
                rs.sumOf { it.scrambleSetCount * totalScrambleCountPerSet(it) }
            }.mapKeys { it.key.id }
    }

    private fun totalScrambleCountPerSet(round: Round): Int {
        return standardScrambleCountPerSet(round) + extraScrambleCountPerSet(round)
    }

    // EXTENSION HANDLING -----

    fun installExtensionForEvents(wcif: Competition, ext: ExtensionBuilder, event: EventData): Competition {
        fun installRoundExtension(e: Event): Event {
            val extendedRounds = e.rounds.map { r ->
                r.copy(extensions = r.withExtension(ext))
            }

            return e.copy(rounds = extendedRounds)
        }

        val extendedEvents = wcif.events.map { e ->
            e.takeUnless { it.id == event.id }
                ?: installRoundExtension(e)
        }

        return wcif.copy(events = extendedEvents)
    }

    // INDEXING -----

    private fun reindexActivities(venues: List<Venue>): List<Venue> {
        val allActivities = venues.flatMap { it.rooms }
            .flatMap { it.activities }
            .flatMap { it.selfAndChildActivities }

        val idIndex = buildReindexingMap(allActivities)

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

    private fun reindexScrambleSets(events: List<Event>): List<Event> {
        val allScrambleSets = events.flatMap { it.rounds }
            .flatMap { it.scrambleSets }

        val indexTable = buildReindexingMap(allScrambleSets)

        return events.map { e ->
            val reindexedRounds = e.rounds.map { r ->
                val reindexedScrambleSets = r.scrambleSets.map { s ->
                    indexTable[s]?.let { s.copy(id = it) } ?: s
                }

                r.copy(scrambleSets = reindexedScrambleSets)
            }

            e.copy(rounds = reindexedRounds)
        }
    }

    private fun <T : IndexingIdProvider> buildReindexingMap(candidates: List<T>): Map<T, Int> {
        val forReindexing = candidates.filter { it.id == ID_PENDING }
        val maxAssignedId = (candidates - forReindexing).maxOfOrNull { it.id } ?: ID_PENDING

        return forReindexing.mapIndexed { i, elem -> elem to maxAssignedId + 1 + i }
            .toMap()
    }

    // ACTIVITY MATCHING -----

    fun matchActivities(wcif: Competition): Competition {
        val matchedVenues = wcif.schedule.venues.map { v ->
            val matchedRooms = v.rooms.map { r ->
                val matchedActivities = r.activities.map { a ->
                    matchActivity(a, wcif.events)
                }

                r.copy(activities = matchedActivities)
            }

            v.copy(rooms = matchedRooms)
        }

        val matchedVenuesWithIndex = reindexActivities(matchedVenues)
        val matchedSchedule = wcif.schedule.copy(venues = matchedVenuesWithIndex)

        return wcif.copy(schedule = matchedSchedule)
    }

    private fun matchActivity(activity: Activity, events: List<Event>): Activity {
        if (activity.activityCode.eventId in ActivityCode.IGNORABLE_KEYS) {
            return activity
        }

        val registeredEventIds = events.map { it.id }.toSet()

        // manually compensating for https://github.com/thewca/worldcubeassociation.org/issues/4653
        if (activity.activityCode.eventId !in registeredEventIds) {
            return activity
        }

        val children = activity.childActivities

        // we have children that need to be specified!
        if (children.isNotEmpty()) {
            val matchedChildren = children.map { matchActivity(it, events) }
            return activity.copy(childActivities = matchedChildren)
        }

        val matchedRound = findRound(events, activity)
            ?: return activity

        val actGroup = activity.activityCode.groupNumber

        // uh oh. no child activities where there should be some. Resort to creating them ourselves…
        if (actGroup == null) {
            if (matchedRound.scrambleSetCount == 1) {
                val scrambleSet = matchedRound.scrambleSets.single()
                return activity.copy(scrambleSetId = scrambleSet.id)
            }

            val inventedChildren = List(matchedRound.scrambleSetCount) {
                val copiedActCode = activity.activityCode.copyParts(groupNumber = it)
                val childSetId = matchedRound.scrambleSets[it].id

                activity.copy(
                    id = ID_PENDING,
                    activityCode = copiedActCode,
                    childActivities = listOf(),
                    scrambleSetId = childSetId
                )
            }

            return activity.copy(childActivities = inventedChildren)
        }

        // manually compensating for https://github.com/thewca/worldcubeassociation.org/issues/4653
        if (actGroup >= matchedRound.scrambleSetCount) {
            return activity
        }

        val scrambleSet = matchedRound.scrambleSets[actGroup]
        return activity.copy(scrambleSetId = scrambleSet.id)
    }

    private fun findRound(events: List<Event>, activity: Activity): Round? {
        return events
            .filter { it.id == activity.activityCode.eventId }
            .flatMap { it.rounds }
            .find { it.idCode.isParentOf(activity.activityCode) }
    }
}
