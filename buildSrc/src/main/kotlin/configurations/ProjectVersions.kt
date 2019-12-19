package configurations

import org.gradle.api.Project
import org.gradle.kotlin.dsl.extra
import org.gradle.kotlin.dsl.invoke
import org.gradle.kotlin.dsl.provideDelegate

object ProjectVersions {
    fun Project.gitVersionTag(): String {
        val gitVersion: groovy.lang.Closure<String> by extra
	    return gitVersion()
    }
}
