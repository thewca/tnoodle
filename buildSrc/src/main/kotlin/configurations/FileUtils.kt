package configurations

import org.gradle.api.Task
import java.io.File
import java.io.IOException
import java.nio.file.Files

object FileUtils {
    fun Task.symlink(linkName: File, originFile: File): Boolean {
        return try {
            if (linkName.exists()) {
                if (linkName.delete()) {
                    logger.info("Deleted old symlink")
                } else {
                    logger.warn("Unable to create symlink: Cannot override previously existing file with same name as target")
                    return false
                }
            }

            Files.createSymbolicLink(linkName.toPath(), originFile.toPath())
            true
        } catch (e: IOException) {
            logger.warn("Unable to create symlink: IOException", e)
            false
        } catch (e: SecurityException) {
            logger.warn("Unable to create symlink: SecurityException", e)
            false
        }
    }
}
