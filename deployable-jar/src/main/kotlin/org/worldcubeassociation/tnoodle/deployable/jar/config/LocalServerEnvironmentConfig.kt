package org.worldcubeassociation.tnoodle.deployable.jar.config

import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.deployable.jar.server.WebServerUtils.DEVEL_VERSION
import org.worldcubeassociation.tnoodle.deployable.jar.server.WebServerUtils.PRUNING_FOLDER
import org.worldcubeassociation.tnoodle.deployable.jar.server.WebServerUtils
import org.worldcubeassociation.tnoodle.deployable.jar.server.WebServerUtils.jarFile
import java.io.File
import java.io.FileNotFoundException

object LocalServerEnvironmentConfig : ServerEnvironmentConfig {
    override val projectName
        get() = this::class.java.getPackage()?.implementationTitle
            ?: WebServerUtils.callerClass?.simpleName!!

    override val projectVersion
        get() = this::class.java.getPackage()?.implementationVersion
            ?: DEVEL_VERSION

    override val usePruning: Boolean
        get() = System.getenv("CI") != null

    private fun getPruningTableCache(assertExists: Boolean = true): File {
        val baseDir = File(WebServerUtils.programDirectory, PRUNING_FOLDER)

        // Each version of TNoodle extracts its pruning tables
        // to its own subdirectory of PRUNING_FOLDER
        val file = baseDir.takeIf { projectVersion == DEVEL_VERSION }
            ?: File(baseDir, projectVersion)

        if (assertExists && !file.isDirectory) {
            throw FileNotFoundException("${file.absolutePath} does not exist, or is not a directory")
        }

        return file
    }

    override fun pruningTableExists(tableName: String) = localPruningFile(tableName).exists()

    override fun getPruningTableInput(tableName: String) = localPruningFile(tableName).inputStream()

    override fun getPruningTableOutput(tableName: String) =
        localPruningFile(tableName).takeIf { it.parentFile.isDirectory || it.parentFile.mkdirs() }?.outputStream()
            ?: error("Unable to create pruning file for table '$tableName'")

    private fun localPruningFile(tableName: String) = File(getPruningTableCache(false), "$tableName.prun")

    override fun createLocalPruningCache() {
        if (jarFile != null) {
            val pruningTableDirectory = getPruningTableCache(false)

            if (pruningTableDirectory.isDirectory) {
                // If the pruning table folder already exists, we don't bother re-extracting the
                // files.
                return
            }

            assert(pruningTableDirectory.mkdirs())
        }
    }
}
