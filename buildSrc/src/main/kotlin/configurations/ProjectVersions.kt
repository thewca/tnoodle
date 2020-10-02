package configurations

import org.gradle.api.Project
import org.gradle.api.Task
import org.gradle.api.plugins.ExtraPropertiesExtension
import org.gradle.kotlin.dsl.extra
import org.gradle.kotlin.dsl.invoke
import org.gradle.kotlin.dsl.provideDelegate

object ProjectVersions {
    const val TNOODLE_IMPL_KEY = "TNOODLE_IMPL"
    const val TNOODLE_VERSION_KEY = "TNOODLE_VERSION"

    const val TNOODLE_IMPL_DEFAULT = "TNoodle-LOCAL"

    const val TNOODLE_SYMLINK = "TNoodle-Build-latest.jar"

    fun Project.gitVersionTag(): String {
        val gitVersion: groovy.lang.Closure<String> by extra
        return gitVersion()
    }

    fun Task.setTNoodleRelease(ext: ExtraPropertiesExtension, name: String, version: String? = null) {
        ext.set(TNOODLE_IMPL_KEY, name)
        ext.set(TNOODLE_VERSION_KEY, version ?: project.version)
    }

    fun Project.tNoodleImplOrDefault(): String {
        return project.findProperty(TNOODLE_IMPL_KEY)?.toString()
            ?: TNOODLE_IMPL_DEFAULT
    }

    fun Project.tNoodleVersionOrDefault(): String {
        return project.findProperty(TNOODLE_VERSION_KEY)?.toString()
            ?: "devel-${gitVersionTag()}"
    }
}
