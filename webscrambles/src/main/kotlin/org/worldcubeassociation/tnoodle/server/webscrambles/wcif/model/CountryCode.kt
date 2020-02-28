package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import org.worldcubeassociation.tnoodle.server.webscrambles.serial.SingletonStringEncoder
import java.util.*

data class CountryCode(val countryIso2: String) {
    val countryLocale: Locale
        get() = Locale.forLanguageTag(countryIso2)

    companion object : SingletonStringEncoder<CountryCode>("CountryCode") {
        override fun encodeInstance(instance: CountryCode) = instance.countryIso2
        override fun makeInstance(deserialized: String) = CountryCode(deserialized)
    }
}
