package org.worldcubeassociation.tnoodle.server

import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.PrintStream
import java.io.UnsupportedEncodingException
import java.net.URISyntaxException
import java.net.URLDecoder
import java.nio.channels.FileChannel
import java.util.jar.JarEntry
import java.util.jar.JarInputStream
import java.util.logging.Level
import java.util.logging.Logger
import java.util.Random

object WebServerUtils {
    private val l = Logger.getLogger(WebServerUtils::class.java.name)

    private val RESOURCE_FOLDER = "tnoodle_resources"
    private val DEVEL_VERSION = "devel"

    val resourceDirectory: File
        get() = getResourceDirectory(true)

    /**
     * @return A File representing the directory in which this program resides.
     * If this is a jar file, this should be obvious, otherwise it's the directory in which
     * our calling class resides.
     */
    val programDirectory: File
        get() {
            var programDirectory = jarFileOrDirectory

            if (programDirectory.isFile) {
                programDirectory = programDirectory.parentFile
            }

            return programDirectory
        }

    // Classes that are part of a web app were loaded with the
    // servlet container's classloader, so we can't necessarily
    // find them.
    private val callerClass: Class<*>?
        get() {
            var callerClass: Class<*>? = null
            val stElements = Thread.currentThread().stackTrace
            for (i in 2 until stElements.size) {
                val ste = stElements[i]
                try {
                    callerClass = Class.forName(ste.className)
                } catch (e: ClassNotFoundException) {
                    return null
                }

                if (WebServerUtils::class.java.getPackage() != callerClass!!.getPackage()) {
                    return callerClass
                }
            }
            return null
        }

    private// We don't know where the class is (it was probably loaded
    // by the servlet container), so just use Util.
    val jarFileOrDirectory: File
        get() {
            var callerClass = callerClass

            if (callerClass == null) {
                callerClass = WebServerUtils::class.java
            }

            val programDirectory: File
            try {
                programDirectory = File(callerClass.protectionDomain.codeSource.location.toURI().path)
            } catch (e: URISyntaxException) {
                return File(".")
            }

            return programDirectory
        }

    val jarFile: File?
        get() {
            val potentialJarFile = jarFileOrDirectory
            return if (potentialJarFile.isFile) {
                potentialJarFile
            } else null
        }

    /**
     * Copied from http://code.google.com/p/guava-libraries/source/browse/guava/src/com/google/common/io/Files.java from http://stackoverflow.com/questions/617414/create-a-temporary-directory-in-java
     * Atomically creates a new directory somewhere beneath the system's
     * temporary directory (as defined by the `java.io.tmpdir` system
     * property), and returns its name.
     *
     *
     * Use this method instead of [File.createTempFile]
     * when you wish to create a directory, not a regular file.  A common pitfall
     * is to call `createTempFile`, delete the file and create a
     * directory in its place, but this leads a race condition which can be
     * exploited to create security vulnerabilities, especially when executable
     * files are to be written into the directory.
     *
     *
     * This method assumes that the temporary volume is writable, has free
     * inodes and free blocks, and that it will not be called thousands of times
     * per second.
     *
     * @return the newly-created directory
     * @throws IllegalStateException if the directory could not be created
     */
    /** Maximum loop count when creating temp directories.  */
    private val TEMP_DIR_ATTEMPTS = 10000

    val projectName: String
        get() {
            val p = WebServerUtils::class.java.getPackage()
            var name: String? = p.implementationTitle

            if (name == null) {
                name = callerClass!!.name!!
            }

            return name
        }

    val version: String
        get() {
            val p = WebServerUtils::class.java.getPackage()
            var version: String? = p.implementationVersion
            if (version == null) {
                version = DEVEL_VERSION
            }
            return version
        }

    val webappsDir: File
        get() = File(resourceDirectory, "/webapps/")

    private var r: Random? = null

    val seededRandom: Random
        get() {
            if (r != null) {
                return r!!
            }

            val randSeedEnvVar = "TNOODLE_RANDSEED"
            var seed: String? = System.getenv(randSeedEnvVar)
            if (seed == null) {
                seed = "" + System.currentTimeMillis()
            }
            println("Using TNOODLE_RANDSEED=$seed")
            r = Random(seed.hashCode().toLong())
            return r!!
        }

    fun throwableToString(e: Throwable): String {
        val bytes = ByteArrayOutputStream()
        e.printStackTrace(PrintStream(bytes))

        return bytes.toString()
    }

    fun copyFile(sourceFile: File, destFile: File) {
        if (!destFile.exists()) {
            destFile.createNewFile()
        }

        var source: FileChannel? = null
        var destination: FileChannel? = null

        try {
            source = FileInputStream(sourceFile).channel
            destination = FileOutputStream(destFile).channel
            destination!!.transferFrom(source, 0, source!!.size())
        } finally {
            source?.close()
            destination?.close()
        }
    }

    private fun getResourceDirectory(assertExists: Boolean): File {
        var f = File(programDirectory, RESOURCE_FOLDER)

        if (version != DEVEL_VERSION) {
            // Each version of tnoodle extracts its resources
            // to its own subdirectory of RESOURCE_FOLDER
            f = File(f, version)
        }

        if (assertExists) {
            if (!f.isDirectory) {
                l.log(Level.SEVERE, f.absolutePath + " does not exist, or is not a directory!")
                assert(f.isDirectory)
            }
        }

        return f
    }

    fun createTempDir(): File {
        // Calling renameTo() on something in java.io.tmpdir to something in
        // tnoodle_resources doesn't seem to work. We opt to just put temp folders
        // in the same directory as the jar file.
        //File baseDir = new File(System.getProperty("java.io.tmpdir"));
        val baseDir = programDirectory
        val baseName = System.currentTimeMillis().toString() + "-"

        for (counter in 0 until TEMP_DIR_ATTEMPTS) {
            val tempDir = File(baseDir, baseName + counter)
            if (tempDir.mkdir()) {
                return tempDir
            }
        }
        throw IllegalStateException("Failed to create directory within "
            + TEMP_DIR_ATTEMPTS + " attempts (tried "
            + baseName + "0 to " + baseName + (TEMP_DIR_ATTEMPTS - 1) + ')'.toString())
    }

    fun doFirstRunStuff() {
        val jarFile = jarFile

        if (jarFile != null) {
            val resourceDirectory = getResourceDirectory(false)
            if (resourceDirectory.isDirectory) {
                // If the resource folder already exists, we don't bother re-extracting the
                // files.
                return
            }

            val tempResourceDirectory = createTempDir()
            val jarIs = JarInputStream(FileInputStream(jarFile))
            var entry: JarEntry? = jarIs.nextJarEntry
            val buf = ByteArray(1024)

            while (entry != null) {
                if (entry.isDirectory) {
                    continue
                }

                if (entry.name.startsWith(RESOURCE_FOLDER)) {
                    // Remove the leading RESOURCE_FOLDER from the filename,
                    // so we can put it in resourceDirectory directly.
                    val destName = entry.name.substring(RESOURCE_FOLDER.length)
                    val destFile = File(tempResourceDirectory, destName)

                    destFile.parentFile.mkdirs()

                    val out = FileOutputStream(destFile)

                    var n = jarIs.read(buf, 0, buf.size)

                    while (n > -1) {
                        out.write(buf, 0, n)
                        n = jarIs.read(buf, 0, buf.size)
                    }

                    out.close()
                }
                jarIs.closeEntry()
                entry = jarIs.nextJarEntry
            }
            jarIs.close()

            resourceDirectory.parentFile.mkdirs()

            assert(tempResourceDirectory.renameTo(resourceDirectory))
        }
    }

    fun parseQuery(query: String?): Map<String, String> {
        val queryMap = mutableMapOf<String, String>()

        if (query == null) {
            return queryMap
        }

        val pairs = query.split("&".toRegex()).dropLastWhile { it.isEmpty() }

        for (pair in pairs) {
            val keyValue = pair.split("=".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()

            if (keyValue.size == 1) {
                queryMap[keyValue[0]] = "" // this allows for flags such as http://foo/blah?kill&burn
            } else {
                try {
                    queryMap[keyValue[0]] = URLDecoder.decode(keyValue[1], "utf-8")
                } catch (e: UnsupportedEncodingException) {
                    queryMap[keyValue[0]] = keyValue[1] //worst case, just put the undecoded string
                }

            }
        }
        return queryMap
    }
}
