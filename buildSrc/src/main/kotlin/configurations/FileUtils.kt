package configurations

import org.gradle.api.Project
import java.io.File
import java.nio.file.Files

object FileUtils {
    fun Project.symlink(linkName: File, originFile: File) {
        Files.createSymbolicLink(linkName.toPath(), originFile.toPath())
    }
}
