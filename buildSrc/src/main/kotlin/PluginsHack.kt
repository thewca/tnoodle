import dependencies.Libraries.Buildscript.PROGUARD_GRADLE_ACTUAL
import dependencies.Libraries.Buildscript.WCA_I18N_ACTUAL
import dependencies.Plugins.KOTLIN_JVM_ACTUAL
import dependencies.Plugins.KOTLIN_MULTIPLATFORM_ACTUAL
import dependencies.Plugins.SHADOW_ACTUAL
import dependencies.Plugins.NODEJS_ACTUAL

import org.gradle.plugin.use.PluginDependenciesSpec
import org.gradle.plugin.use.PluginDependencySpec

// This currently only exists because there is a bug in Gradle
// that prevents "plugins {}" and "buildscript {}" blocks
// to load anything not in the root package.

// See https://github.com/gradle/gradle/issues/9270 for details.

inline val PluginDependenciesSpec.SHADOW: PluginDependencySpec
    get() = SHADOW_ACTUAL

inline val PluginDependenciesSpec.NODEJS: PluginDependencySpec
    get() = NODEJS_ACTUAL

inline val PluginDependenciesSpec.KOTLIN_JVM: PluginDependencySpec
    get() = KOTLIN_JVM_ACTUAL

inline val PluginDependenciesSpec.KOTLIN_MULTIPLATFORM: PluginDependencySpec
    get() = KOTLIN_MULTIPLATFORM_ACTUAL

inline val PROGUARD_GRADLE: String
    get() = PROGUARD_GRADLE_ACTUAL

inline val WCA_I18N: String
    get() = WCA_I18N_ACTUAL
