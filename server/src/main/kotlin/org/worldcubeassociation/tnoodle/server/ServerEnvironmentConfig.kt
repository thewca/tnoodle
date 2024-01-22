package org.worldcubeassociation.tnoodle.server

import java.io.InputStream
import java.io.OutputStream

interface ServerEnvironmentConfig {
    val projectName: String
    val projectVersion: String

    val title
        get() = "$projectName-$projectVersion"

    val usePruning: Boolean

    fun pruningTableExists(tableName: String): Boolean

    fun getPruningTableInput(tableName: String): InputStream
    fun getPruningTableOutput(tableName: String): OutputStream

    fun createLocalPruningCache()
}
