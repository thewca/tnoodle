package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import java.util.*

data class CountryCode(val countryIso2: String) {
    val countryLocale: Locale
        get() = Locale.forLanguageTag(countryIso2)
}
