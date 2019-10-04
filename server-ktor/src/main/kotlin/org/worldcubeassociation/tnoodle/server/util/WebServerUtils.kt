package org.worldcubeassociation.tnoodle.server.util

import com.google.cloud.storage.StorageOptions
import java.io.*
import java.net.URISyntaxException
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.text.SimpleDateFormat
import java.util.Random
import java.io.File.separator
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.BlobId
import java.nio.channels.Channels


object WebServerUtils {
    val SDF = SimpleDateFormat("YYYY-mm-dd")

    val JAVA_HOME = System.getProperty("java.home")
    val FONT_CONFIG_NAME = "fontconfig.Prodimage.properties"
    val FONT_CONFIG_PROPERTY = "sun.awt.fontconfig"

    val FONT_CONFIG = ("$JAVA_HOME${separator}lib${separator}$FONT_CONFIG_NAME")

    private val CONFIG_FILE = javaClass.getResourceAsStream("/version.tnoodle")
    private val CONFIG_DATA = CONFIG_FILE?.reader()?.readLines() ?: listOf()

    private val PRUNING_FOLDER = "tnoodle_pruning_cache"
    private val DEVEL_VERSION = "devel-TEMP"

    val GCS_SERVICE by lazy { StorageOptions.getDefaultInstance().service }

    /**
     * @return A File representing the directory in which this program resides.
     * If this is a jar file, this should be obvious, otherwise it's the directory in which
     * our calling class resides.
     */
    val programDirectory: File
        get() {
            val programDirectory = jarFileOrDirectory
            return programDirectory.takeUnless { it.isFile } ?: programDirectory.parentFile
        }

    // Classes that are part of a web app were loaded with the
    // servlet container's classloader, so we can't necessarily
    // find them.
    private val callerClass: Class<*>?
        get() {
            val stElements = Thread.currentThread().stackTrace

            for (i in 2 until stElements.size) {
                val ste = stElements[i]

                val callerClass = try {
                    Class.forName(ste.className)
                } catch (e: ClassNotFoundException) {
                    return null
                }

                if (WebServerUtils::class.java.getPackage() != callerClass.getPackage()) {
                    return callerClass
                }
            }

            return null
        }

    private val jarFileOrDirectory: File
        get() {
            // We don't know where the class is (it was probably loaded
            // by the servlet container), so just use Util.
            val callerClass = callerClass
                ?: WebServerUtils::class.java

            return try {
                File(callerClass.protectionDomain.codeSource.location.toURI().path)
            } catch (e: URISyntaxException) {
                File(".")
            }
        }

    val jarFile: File?
        get() = jarFileOrDirectory.takeIf { it.isFile }

    val projectName: String
        get() = CONFIG_DATA.getOrNull(0)
            ?: callerClass?.simpleName!!

    val version: String
        get() = CONFIG_DATA.getOrNull(1)
            ?: DEVEL_VERSION

    val SEEDED_RANDOM: Random by lazy {
        val randSeedEnvVar = "TNOODLE_RANDSEED"

        val seed = System.getenv(randSeedEnvVar) ?: System.currentTimeMillis().toString()
        println("Using TNOODLE_RANDSEED=$seed")

        Random(seed.hashCode().toLong())
    }

    fun throwableToString(e: Throwable) =
        ByteArrayOutputStream().apply {
            e.printStackTrace(PrintStream(this))
        }.toString()

    fun copyFile(sourceFile: File, destFile: File) = Files.copy(sourceFile.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING)

    private fun getPruningTableCache(assertExists: Boolean = true): File {
        val baseDir = File(programDirectory, PRUNING_FOLDER)

        // Each version of tnoodle extracts its pruning tables
        // to its own subdirectory of PRUNING_FOLDER
        val file = baseDir.takeIf { version == DEVEL_VERSION } ?: File(baseDir, version)

        if (assertExists && !file.isDirectory) {
            throw FileNotFoundException("${file.absolutePath} does not exist, or is not a directory")
        }

        return file
    }

    fun pruningTableExists(tableName: String): Boolean {
        return if (runningOnGoogleCloud()) {
            val blobId = remotePruningBlob(tableName)
            GCS_SERVICE.get(blobId).exists()
        } else {
            localPruningFile(tableName).exists()
        }
    }

    fun getPruningTableInput(tableName: String): InputStream {
        return if (runningOnGoogleCloud()) {
            val blobId = remotePruningBlob(tableName)
            val blobReader = GCS_SERVICE.get(blobId).reader()

            Channels.newInputStream(blobReader)
        } else {
            localPruningFile(tableName).inputStream()
        }
    }

    fun getPruningTableOutput(tableName: String): OutputStream {
        return if (runningOnGoogleCloud()) {
            val blobId = remotePruningBlob(tableName)
            val blobInfo = BlobInfo.newBuilder(blobId).setContentType("text/plain").build()

            val blobWriter = GCS_SERVICE.create(blobInfo).writer()

            Channels.newOutputStream(blobWriter)
        } else {
            localPruningFile(tableName).takeIf { it.parentFile.isDirectory || it.parentFile.mkdirs() }?.outputStream()
                ?: error("Unable to create pruning file for table '$tableName'")
        }
    }

    private fun localPruningFile(tableName: String) = File(getPruningTableCache(false), "$tableName.prun")

    private fun remotePruningBlob(tableName: String) = BlobId.of(getCloudBucketName(), tableName)

    fun runningOnGoogleCloud(): Boolean {
        val googleAppEngineEnv = System.getProperty("com.google.appengine.runtime.environment").orEmpty()
        return googleAppEngineEnv.isNotBlank()
    }

    private fun getCloudHostname() = System.getProperty("com.google.appengine.application.id")
    fun getCloudBucketName() = "${getCloudHostname()}.appspot.com"

    fun overrideFontConfig() {
        if (runningOnGoogleCloud() && File(FONT_CONFIG).exists()) {
            System.setProperty(FONT_CONFIG_PROPERTY, FONT_CONFIG)
        }
    }

    fun createLocalPruningCache() {
        if (runningOnGoogleCloud()) {
            return
        }

        val jarFile = jarFile

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
