package org.worldcubeassociation.tnoodle.server.wcif.model

import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder

data class AssignmentCode(val wcaString: String) {
    val isStaff
        get() = this.wcaString.startsWith(PREFIX_STAFF)

    val isCompetitor
        get() = this.wcaString == COMPETITOR

    val isStaffJudge
        get() = this.wcaString == STAFF_JUDGE

    val isStaffScrambler
        get() = this.wcaString == STAFF_SCRAMBLER

    val isStaffRunner
        get() = this.wcaString == STAFF_RUNNER

    val isStaffDataEntry
        get() = this.wcaString == STAFF_DATAENTRY

    val isStaffAnnouncer
        get() = this.wcaString == STAFF_ANNOUNCER

    companion object : SingletonStringEncoder<AssignmentCode>("AssignmentCode") {
        const val PREFIX_STAFF = "staff"

        const val COMPETITOR = "competitor"
        const val STAFF_JUDGE = "$PREFIX_STAFF-judge"
        const val STAFF_SCRAMBLER = "$PREFIX_STAFF-scrambler"
        const val STAFF_RUNNER = "$PREFIX_STAFF-runner"
        const val STAFF_DATAENTRY = "$PREFIX_STAFF-dataentry"
        const val STAFF_ANNOUNCER = "$PREFIX_STAFF-announcer"

        override fun encodeInstance(instance: AssignmentCode) = instance.wcaString
        override fun makeInstance(deserialized: String) = AssignmentCode(deserialized)
    }
}
