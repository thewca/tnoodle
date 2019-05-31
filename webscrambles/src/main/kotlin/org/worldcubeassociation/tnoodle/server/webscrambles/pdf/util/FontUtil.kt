package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import com.itextpdf.text.log.CounterFactory
import com.itextpdf.text.log.NoOpCounter
import com.itextpdf.text.pdf.BaseFont
import java.util.*

object FontUtil {
    val CJK_FONT: BaseFont = BaseFont.createFont("fonts/wqy-microhei.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED)
    val MONO_FONT: BaseFont = BaseFont.createFont("fonts/LiberationMono-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED)
    val NOTO_SANS_FONT: BaseFont = BaseFont.createFont("fonts/NotoSans-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED)

    const val MAX_SCRAMBLE_FONT_SIZE = 20f
    const val MINIMUM_ONE_LINE_FONT_SIZE = 12f

    private val FONT_BY_LOCALE = mapOf(
        Locale.forLanguageTag("zh-CN") to CJK_FONT,
        Locale.forLanguageTag("zh-TW") to CJK_FONT,
        Locale.forLanguageTag("ko") to CJK_FONT,
        Locale.forLanguageTag("ja") to CJK_FONT
    )

    init {
        // Email agpl@itextpdf.com if you want to know what this is about =)
        CounterFactory.getInstance().counter = NoOpCounter()
    }

    fun getFontForLocale(locale: Locale) = FONT_BY_LOCALE[locale] ?: NOTO_SANS_FONT
}
