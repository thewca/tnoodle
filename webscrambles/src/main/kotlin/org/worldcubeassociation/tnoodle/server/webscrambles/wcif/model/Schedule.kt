package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
data class Schedule(val numberOfDays: Int, val venues: List<Venue>) {
    val earliestActivity: Activity
        get() = activitiesWithLocalStartTimes
            .minBy { it.value }
            ?.key
            ?: error("I could not find the earliest activity")

    @Transient
    val allActivities = venues
        .flatMap { it.rooms }
        .flatMap { it.activities }
        .flatMap { it.selfAndChildActivities }

    @Transient
    val leafActivities = venues
        .flatMap { it.rooms }
        .flatMap { it.activities }
        .flatMap { it.leafChildActivities }

    @Transient
    val activitiesWithLocalStartTimes = venues
        .associateWith { it.rooms }
        .mapValues { it.value.flatMap(Room::activities) }
        .mapValues { it.value.flatMap(Activity::selfAndChildActivities) }
        // turn Map<Venue, List<Activity>> into Map<Activity, Venue>
        .flatMap { (v, act) ->
            act.map { it to v.dateTimeZone }
        }.toMap()
        // convert timezone to local start date of respective activity
        .mapValues { it.key.getLocalStartTime(it.value) }

    val hasMultipleDays: Boolean get() = numberOfDays > 1
    val hasMultipleVenues: Boolean get() = venues.size > 1

    companion object {
        val EMPTY = Schedule(0, emptyList())
    }
}
