package org.worldcubeassociation.tnoodle.server.cloudscrambles

import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.DEVEL_VERSION
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.callerClass
import java.io.File
import java.io.File.separator

object GoogleServerEnvironmentConfig : ServerEnvironmentConfig {
    private val CONFIG_FILE = javaClass.getResourceAsStream("/version.tnoodle")
    private val CONFIG_DATA = CONFIG_FILE?.reader()?.readLines() ?: listOf()

    val JAVA_HOME = System.getProperty("java.home")

    val FONT_CONFIG_NAME = "fontconfig.Prodimage.properties"
    val FONT_CONFIG = ("$JAVA_HOME${separator}lib${separator}$FONT_CONFIG_NAME")

    val FONT_CONFIG_PROPERTY = "sun.awt.fontconfig"

    override val projectName: String
        get() = CONFIG_DATA.getOrNull(0)
            ?: callerClass?.simpleName!!

    override val version: String
        get() = CONFIG_DATA.getOrNull(1)
            ?: DEVEL_VERSION

    fun overrideFontConfig() {
        if (File(FONT_CONFIG).exists()) {
            System.setProperty(FONT_CONFIG_PROPERTY, FONT_CONFIG)
        }
    }
}
