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

    inline val PluginDependenciesSpec.KOTLIN_SERIALIZATION_ACTUAL: PluginDependencySpec
        get() = kotlin("plugin.serialization").version(Versions.Plugins.KOTLIN_SERIALIZATION)

    inline val PluginDependenciesSpec.KOTLIN_MULTIPLATFORM_ACTUAL: PluginDependencySpec
        get() = id("kotlin-multiplatform").version(Versions.Plugins.KOTLIN_MULTIPLATFORM)

    inline val PluginDependenciesSpec.DEPENDENCY_VERSIONS_ACTUAL: PluginDependencySpec
        get() = id("com.github.ben-manes.versions").version(Versions.Plugins.DEPENDENCY_VERSIONS)

    inline val PluginDependenciesSpec.GIT_VERSION_TAG_ACTUAL: PluginDependencySpec
        get() = id("com.palantir.git-version").version(Versions.Plugins.GIT_VERSION_TAG)

    // not versioned because the classpath from the buildscript {} block already implies a version
    inline val PluginDependenciesSpec.GOOGLE_APPENGINE_ACTUAL: PluginDependencySpec
        get() = id("com.google.cloud.tools.appengine")

    inline val PluginDependenciesSpec.KOTLESS_ACTUAL: PluginDependencySpec
        get() = id("io.kotless").version(Versions.Plugins.KOTLESS)
}
