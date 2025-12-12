package org.worldcubeassociation.tnoodle.server.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.wcif.util.ActivityCoordinate

@Serializable
data class Schedule(val numberOfDays: Int, val venues: List<Venue>) {
    val leafActivities get() = this.activityCoordinates { leafChildActivities }.map { it.activity }

    val hasMultipleDays: Boolean get() = numberOfDays > 1
    val hasMultipleVenues: Boolean get() = venues.size > 1

    fun activityCoordinates(rootActivityResolver: Activity.() -> List<Activity> = Activity::selfAndChildActivities): List<ActivityCoordinate> {
        return venues.flatMap { venue ->
            venue.rooms.flatMap { room ->
                room.activities.flatMap { rootActivity ->
                    rootActivity.rootActivityResolver().map { activity ->
                        ActivityCoordinate(venue, room, activity)
                    }
                }
            }
        }
    }
}
