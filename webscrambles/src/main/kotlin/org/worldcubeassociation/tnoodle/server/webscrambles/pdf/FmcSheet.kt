package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.util.*

abstract class FmcSheet(wcif: Competition, activity: Activity, val locale: Locale = Translate.DEFAULT_LOCALE) : BaseScrambleSheet(wcif, activity) {
    companion object {
        const val WCA_MAX_MOVES_FMC = 80
    }
}
