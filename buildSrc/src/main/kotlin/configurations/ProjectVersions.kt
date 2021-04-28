package configurations

import org.gradle.api.Project
import org.gradle.api.Task
import org.gradle.api.plugins.ExtraPropertiesExtension
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.lib.RepositoryBuilder
import java.io.File

object ProjectVersions {
    const val TNOODLE_IMPL_KEY = "TNOODLE_IMPL"
    const val TNOODLE_VERSION_KEY = "TNOODLE_VERSION"

    const val TNOODLE_IMPL_DEFAULT = "TNoodle-LOCAL"

    const val TNOODLE_SYMLINK = "TNoodle-Build-latest.jar"

    fun Project.gitVersionTag(): String {
        val repo = RepositoryBuilder()
            .setGitDir(File(rootDir, "/.git"))
            .readEnvironment()
            .build()

        val version = repo.findRef("HEAD").objectId.name
        val isClean = Git.wrap(repo).status().call().isClean
        return version + (if (isClean) "" else ".dirty")
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
