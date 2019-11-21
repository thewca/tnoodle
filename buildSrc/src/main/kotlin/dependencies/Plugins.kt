package dependencies

import org.gradle.kotlin.dsl.kotlin
import org.gradle.plugin.use.PluginDependenciesSpec
import org.gradle.plugin.use.PluginDependencySpec

object Plugins {
    inline val PluginDependenciesSpec.SHADOW_ACTUAL: PluginDependencySpec
        get() = id("com.github.johnrengelman.shadow").version(Versions.Plugins.SHADOW)

    inline val PluginDependenciesSpec.NODEJS_ACTUAL: PluginDependencySpec
        get() = id("com.github.node-gradle.node").version(Versions.Plugins.NODEJS)

    inline val PluginDependenciesSpec.KOTLIN_JVM_ACTUAL: PluginDependencySpec
        get() = kotlin("jvm").version(Versions.Plugins.KOTLIN_JVM)

    inline val PluginDependenciesSpec.KOTLIN_MULTIPLATFORM_ACTUAL: PluginDependencySpec
        get() = id("kotlin-multiplatform").version(Versions.Plugins.KOTLIN_MULTIPLATFORM)
}
