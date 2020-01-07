package org.worldcubeassociation.tnoodle.server.util

import java.io.*
import java.net.URISyntaxException
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.text.SimpleDateFormat
import java.time.format.DateTimeFormatter
import java.util.Random

object WebServerUtils {
    val PRUNING_FOLDER = "tnoodle_pruning_cache"
    val DEVEL_VERSION = "devel-TEMP"

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
    val callerClass: Class<*>?
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

    fun copyFile(sourceFile: File, destFile: File) =
        Files.copy(sourceFile.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING)
}
