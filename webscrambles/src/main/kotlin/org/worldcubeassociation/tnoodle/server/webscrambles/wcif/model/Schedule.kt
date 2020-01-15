package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

data class Schedule(val numberOfDays: Int, val venues: List<Venue>) {
    val earliestActivity: Activity
        get() = activitiesWithLocalStartTimes
            .minBy { it.value }
            ?.key
            ?: error("I could not find the earliest activity")

    val activitiesWithLocalStartTimes = venues
        .associateWith { it.rooms }
        .mapValues { it.value.flatMap(Room::activities) }
        // turn Map<Venue, List<Activity>> into Map<Activity, Venue>
        .flatMap { (v, act) ->
            act.map { it to v.dateTimeZone }
        }.toMap()
        // convert timezone to local start date of respective activity
        .mapValues { it.key.getLocalStartTime(it.value) }

    val hasMultipleDays: Boolean get() = numberOfDays > 1
    val hasMultipleVenues: Boolean get() = venues.size > 1
}
