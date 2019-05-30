package org.worldcubeassociation.tnoodle.server.util

import java.io.*
import java.net.URISyntaxException
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.text.SimpleDateFormat
import java.util.jar.JarEntry
import java.util.jar.JarInputStream
import java.util.Random

object WebServerUtils {
    val SDF = SimpleDateFormat("YYYY-mm-dd")

    private val RESOURCE_FOLDER = "tnoodle_resources"
    private val DEVEL_VERSION = "devel"

    val resourceDirectory: File
        get() = getResourceDirectory(false) // FIXME

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
        get() {
            val p = WebServerUtils::class.java.getPackage()
            return p.implementationTitle ?: callerClass?.name!!
        }

    val version: String
        get() {
            val p = WebServerUtils::class.java.getPackage()
            return p.implementationVersion ?: DEVEL_VERSION
        }

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

    private fun getResourceDirectory(assertExists: Boolean): File {
        val baseDir = File(programDirectory, RESOURCE_FOLDER)

        // Each version of tnoodle extracts its resources
        // to its own subdirectory of RESOURCE_FOLDER
        val file = baseDir.takeIf { version == DEVEL_VERSION } ?: File(baseDir, version)

        if (assertExists && !file.isDirectory) {
            throw FileNotFoundException("${file.absolutePath} does not exist, or is not a directory")
        }

        return file
    }

    /** Maximum loop count when creating temp directories.  */
    private const val TEMP_DIR_ATTEMPTS = 10000

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

        throw IllegalStateException("Failed to create directory within $TEMP_DIR_ATTEMPTS attempts (tried ${baseName}0 to $baseName${TEMP_DIR_ATTEMPTS - 1})")
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

            val jarIs = JarInputStream(jarFile.inputStream())
            var entry: JarEntry? = jarIs.nextJarEntry

            val buf = ByteArray(1024)

            while (entry != null) {
                if (entry.isDirectory) {
                    entry = jarIs.nextJarEntry
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
}
