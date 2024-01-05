package org.worldcubeassociation.tnoodle.server.webscrambles.server

import java.io.*
import java.net.URISyntaxException
import java.nio.file.Files
import java.nio.file.StandardCopyOption

object WebServerUtils {
    val DEVEL_VERSION = "devel-TEMP"

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

    fun copyFile(sourceFile: File, destFile: File) =
        Files.copy(sourceFile.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING)
}
