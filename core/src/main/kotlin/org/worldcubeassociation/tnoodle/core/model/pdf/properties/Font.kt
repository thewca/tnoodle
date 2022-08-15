package org.worldcubeassociation.tnoodle.core.model.pdf.properties

import java.util.*

object Font {
    enum class Weight {
        NORMAL, BOLD;

        companion object {
            val DEFAULT = NORMAL
        }
    }

    object Size {
        const val DEFAULT = 12f
    }

    object Leading {
        const val DEFAULT = 1.2f
    }

    val DEFAULT: String? = null

    const val CJK = "wqy-microhei"
    const val MONO = "LiberationMono-Regular"
    const val SANS_SERIF = "NotoSans-Regular"

    const val STANDARD = SANS_SERIF

    fun fontForLocale(locale: Locale) = if (locale in CJK_LOCALES) CJK else SANS_SERIF

    private val CJK_LOCALES = listOf(
        Locale.forLanguageTag("zh-CN"),
        Locale.forLanguageTag("zh-TW"),
        Locale.forLanguageTag("ko"),
        Locale.forLanguageTag("ja")
    )
}
