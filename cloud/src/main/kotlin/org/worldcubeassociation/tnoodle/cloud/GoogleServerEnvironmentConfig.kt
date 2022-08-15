package org.worldcubeassociation.tnoodle.cloud

import org.worldcubeassociation.tnoodle.core.ServerEnvironmentConfig
import java.io.File
import java.io.File.separator

object GoogleServerEnvironmentConfig : ServerEnvironmentConfig {
    private val CONFIG_FILE = javaClass.getResourceAsStream("/version.tnoodle")
    private val CONFIG_DATA = CONFIG_FILE?.reader()?.readLines() ?: listOf()

    val JAVA_HOME = System.getProperty("java.home")

    const val FONT_CONFIG_NAME = "fontconfig.Prodimage.properties"
    const val FONT_CONFIG_PROPERTY = "sun.awt.fontconfig"

    val FONT_CONFIG = ("$JAVA_HOME${separator}lib${separator}$FONT_CONFIG_NAME")

    const val DEFAULT_PROJECT_NAME = "TNoodle-Cloud"

    override val projectName: String
        get() = CONFIG_DATA.getOrNull(0)
            ?: DEFAULT_PROJECT_NAME

    override val projectVersion: String
        get() = CONFIG_DATA.getOrNull(1)
            ?: ServerEnvironmentConfig.DEVEL_VERSION

    fun overrideFontConfig() {
        if (File(FONT_CONFIG).exists()) {
            System.setProperty(FONT_CONFIG_PROPERTY, FONT_CONFIG)
        }
    }
}
