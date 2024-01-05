package org.worldcubeassociation.tnoodle.server.wcif.model

import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder
import java.util.*

data class CountryCode(val isoString: String) {
    val countryLocale: Locale
        get() = Locale.forLanguageTag(isoString)

    companion object : SingletonStringEncoder<CountryCode>("CountryCode") {
        override fun encodeInstance(instance: CountryCode) = instance.isoString
        override fun makeInstance(deserialized: String) = CountryCode(deserialized)
    }
}
