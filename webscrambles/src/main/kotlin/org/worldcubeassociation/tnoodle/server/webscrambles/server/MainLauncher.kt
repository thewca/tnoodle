package org.worldcubeassociation.tnoodle.server.webscrambles.server

import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils
import java.io.File
import java.io.IOException
import kotlin.math.max
import kotlin.system.exitProcess

object MainLauncher {
    private val LOG = LoggerFactory.getLogger(MainLauncher::class.java)

    const val NO_REEXEC_OPT = "--noReexec"

    var processType = ProcessType.UNKNOWN
        private set

    enum class ProcessType {
        UNKNOWN,
        WRAPPER,
        WORKER
    }

    /*
     * Windows doesn't give good names for java programs in the task manager,
     * they all just show up as instances of java.exe.
     * On Windows this wrapper function attempts to
     * create a copy of java.exe called name.exe and reexecs itself.
     * If name == null, name is derived from the jar filename or the main classname.
     * This wrapper also ensures that the jvm is running with at least
     * minHeapSizeMegs mb of heap space, and if not, reexecs itself and passes
     * an appropriate -Xmx to the jvm.
     */
    fun wrapMain(args: Array<String>, minHeapSizeMegs: Int, name: String? = null) {
        LOG.trace("Entering ${MainLauncher::class.java}, method wrapMain, args ${args + minHeapSizeMegs.toString()}")

        if (NO_REEXEC_OPT in args) {
            processType = ProcessType.WORKER
            return
        }

        val t = Thread.currentThread()
        assert("main" == t.name)

        val availableHeapSizeMegs = (Runtime.getRuntime().maxMemory() / 1024 / 1024).toInt()

        // Note that we don't want to use minHeapSizeMegs, as that may be 0 or something.
        // We want to re-exec with -Xmx = MAX(newHeapSizeMegs, minHeapSizeMegs)
        val newHeapSizeMegs = max(availableHeapSizeMegs, minHeapSizeMegs)

        val os = System.getProperty("os.name")
        val mainClass = t.stackTrace.last().className

        LOG.info("Detected os: $os")

        val needsHeapSizeReExec = newHeapSizeMegs < minHeapSizeMegs
        val (jvm, needsJvmReExec) = detectJVM(os, name, mainClass)

        val needsReExecing = needsHeapSizeReExec || needsJvmReExec
        LOG.info("needsReExecing: $needsReExecing")

        if (needsReExecing) {
            processType = ProcessType.WRAPPER
        } else {
            processType = ProcessType.WORKER
            return
        }

        // Fortunately, classpath contains our jar file if we were run
        // with the -jar command line arg, so classpath and our mainClass
        // are all we need to re-exec ourselves.
        val classpath = System.getProperty("java.class.path")

        // Note that any command line arguments that are passed to the jvm won't
        // pass through to the new jvm we create. I don't believe it's possible to figure
        // them out in a general way.
        val jvmArgs = listOf(jvm, "-Xmx${newHeapSizeMegs}m", "-classpath", classpath, mainClass, NO_REEXEC_OPT) + args

        try {
            LOG.info("Re-execing with $jvmArgs")

            val pb = ProcessBuilder(jvmArgs).apply { redirectErrorStream(true) }
            val p = pb.start()

            // If we don't do something like this on Windows, killing the parent process
            // will leave the child process around.
            // There's still the change that if we get forcibly shut down, we won't
            // execute this shutdown hook.
            Runtime.getRuntime().addShutdownHook(Thread { p.destroy() })

            val stream = p.inputStream.buffered()
            System.out.write(stream.readBytes())

            exitProcess(0)
        } catch (e: IOException) {
            LOG.warn("Starting the child process failed!", e)
        }
    }

    private fun detectJVM(os: String, name: String?, mainClass: String): Pair<String, Boolean> {
        if (os.startsWith("Windows")) {
            val jar = WebServerUtils.jarFile

            // We only do this java.exe magic if we're on windows
            // Linux and Mac seem to show useful information if you ps -efw
            val launcherName = name ?: jar?.name?.substringBeforeLast(".jar") ?: mainClass
            val launcherExecutable = "${launcherName.substringBeforeLast(".exe")}.exe"

            val jre = File(System.getProperty("java.home"))
            val java = File("$jre\\bin", "java.exe")

            val launcherDir = File("$jre\\temp-launcher").apply { mkdir() }

            if (launcherDir.isDirectory) {
                val newLauncher = File(launcherDir, launcherExecutable)

                // This will fail if someone puts something stupid in the directory
                val jvm = "\"${newLauncher.path}\""

                if (!newLauncher.exists()) {
                    try {
                        WebServerUtils.copyFile(java, newLauncher)
                        LOG.info("Successfully copied $java -> $newLauncher")

                        // We successfully created a new executable, so lets use it!
                        return jvm to true
                    } catch (e: IOException) {
                        LOG.warn("Couldn't copy java.exe", e)
                    }
                }

                return jvm to false
            } else {
                LOG.warn("$launcherDir is not a directory.")
            }
        }

        return "java" to false
    }
}
