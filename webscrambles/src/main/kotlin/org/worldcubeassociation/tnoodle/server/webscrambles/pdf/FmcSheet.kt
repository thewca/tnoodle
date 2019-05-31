package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import java.util.*

abstract class FmcSheet(scrambleRequest: ScrambleRequest, globalTitle: String?, password: String?, val locale: Locale = Translate.DEFAULT_LOCALE) : BaseScrambleSheet(scrambleRequest, globalTitle, password) {
    companion object {
        const val WCA_MAX_MOVES_FMC = 80
    }
}
