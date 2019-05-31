package dependencies

import org.gradle.plugin.use.PluginDependenciesSpec
import org.gradle.plugin.use.PluginDependencySpec

object Plugins {
    inline val PluginDependenciesSpec.SHADOW_ACTUAL: PluginDependencySpec
        get() = id("com.github.johnrengelman.shadow").version(Versions.Plugins.SHADOW)

    inline val PluginDependenciesSpec.GWT_ACTUAL: PluginDependencySpec
        get() = id("gwt").version(Versions.Plugins.GWT)

    inline val PluginDependenciesSpec.NODEJS_ACTUAL: PluginDependencySpec
        get() = id("com.moowork.node").version(Versions.Plugins.NODEJS)

    inline val PluginDependenciesSpec.ANDROID_APP_ACTUAL: PluginDependencySpec
        get() = id("com.android.application")
}
