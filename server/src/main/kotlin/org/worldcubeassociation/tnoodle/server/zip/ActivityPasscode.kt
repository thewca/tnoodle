package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.wcif.model.ActivityCode

class ActivityPasscode(
    val passcode: String,
    var activityCode: ActivityCode? = null,
    var title: String? = ""
) {
}
