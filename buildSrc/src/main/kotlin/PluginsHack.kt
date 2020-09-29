import dependencies.Libraries.Buildscript.GOOGLE_APPENGINE_GRADLE_ACTUAL
import dependencies.Libraries.Buildscript.PROGUARD_GRADLE_ACTUAL
import dependencies.Libraries.Buildscript.WCA_I18N_ACTUAL
import dependencies.Libraries.Buildscript.KOTLINX_ATOMICFU_GRADLE_ACTUAL
import dependencies.Plugins.DEPENDENCY_VERSIONS_ACTUAL
import dependencies.Plugins.GIT_VERSION_TAG_ACTUAL
import dependencies.Plugins.GOOGLE_APPENGINE_ACTUAL
import dependencies.Plugins.KOTLESS_ACTUAL
import dependencies.Plugins.KOTLIN_JVM_ACTUAL
import dependencies.Plugins.KOTLIN_MULTIPLATFORM_ACTUAL
import dependencies.Plugins.KOTLIN_SERIALIZATION_ACTUAL
import dependencies.Plugins.KOTLINX_ATOMICFU_ACTUAL
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

inline val PluginDependenciesSpec.KOTLIN_SERIALIZATION: PluginDependencySpec
    get() = KOTLIN_SERIALIZATION_ACTUAL

inline val PluginDependenciesSpec.GOOGLE_APPENGINE: PluginDependencySpec
    get() = GOOGLE_APPENGINE_ACTUAL

inline val PluginDependenciesSpec.DEPENDENCY_VERSIONS: PluginDependencySpec
    get() = DEPENDENCY_VERSIONS_ACTUAL

inline val PluginDependenciesSpec.GIT_VERSION_TAG: PluginDependencySpec
    get() = GIT_VERSION_TAG_ACTUAL

inline val PluginDependenciesSpec.KOTLESS: PluginDependencySpec
    get() = KOTLESS_ACTUAL

inline val PluginDependenciesSpec.KOTLINX_ATOMICFU: PluginDependencySpec
    get() = KOTLINX_ATOMICFU_ACTUAL

inline val PROGUARD_GRADLE: String
    get() = PROGUARD_GRADLE_ACTUAL

inline val WCA_I18N: String
    get() = WCA_I18N_ACTUAL

inline val GOOGLE_APPENGINE_GRADLE: String
    get() = GOOGLE_APPENGINE_GRADLE_ACTUAL

inline val KOTLINX_ATOMICFU_GRADLE: String
    get() = KOTLINX_ATOMICFU_GRADLE_ACTUAL
