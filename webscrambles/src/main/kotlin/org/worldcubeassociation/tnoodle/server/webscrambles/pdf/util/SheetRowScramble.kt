package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Scramble
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet

data class SheetRowScramble(val scramble: String, val type: ScrambleRowType) {
    enum class ScrambleRowType {
        STANDARD, EXTRA
    }

    val isStandard get() = type == ScrambleRowType.STANDARD
    val isExtra get() = type == ScrambleRowType.EXTRA

    companion object {
        fun fromScrambleSet(scrambleSet: ScrambleSet, event: EventData?): List<SheetRowScramble> {
            val standard = scrambleSet.scrambles.toPDFStrings(event)
                .map { scr -> SheetRowScramble(scr, ScrambleRowType.STANDARD) }

            val extra = scrambleSet.extraScrambles.toPDFStrings(event)
                .map { scr -> SheetRowScramble(scr, ScrambleRowType.EXTRA) }

            return standard + extra
        }

        fun List<Scramble>.toPDFStrings(event: EventData?) =
            flatMap { it.allScrambleStrings }
                .takeUnless { event == EventData.MEGA } // Megaminx scrambles intentionally include "\n" chars for alignment
                ?: map { it.scrambleString }
    }
}
