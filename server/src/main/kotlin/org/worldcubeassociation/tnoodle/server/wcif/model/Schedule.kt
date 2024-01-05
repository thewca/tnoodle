package org.worldcubeassociation.tnoodle.server.wcif.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient
import org.worldcubeassociation.tnoodle.server.exceptions.ScheduleMatchingException

@Serializable
data class Schedule(val numberOfDays: Int, val venues: List<Venue>) {
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

    val earliestActivity: Activity
        get() = activitiesWithLocalStartTimes
            .minByOrNull { it.value }?.key
            ?: ScheduleMatchingException.error("Unable to compute earliest activity")

    val hasMultipleDays: Boolean get() = numberOfDays > 1
    val hasMultipleVenues: Boolean get() = venues.size > 1
}
