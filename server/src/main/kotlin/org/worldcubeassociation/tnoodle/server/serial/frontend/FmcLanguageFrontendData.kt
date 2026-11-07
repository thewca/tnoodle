package org.worldcubeassociation.tnoodle.server.serial.frontend

import kotlinx.serialization.Serializable
import java.util.Locale

@Serializable
data class FmcLanguageFrontendData(
    val code: String,
    val name: String,
) {
    companion object {
        fun fromLocale(locale: Locale) = FmcLanguageFrontendData(locale.toLanguageTag(), locale.displayName)

    }
}
