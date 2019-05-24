package org.worldcubeassociation.tnoodle.server

import java.io.BufferedInputStream
import java.io.File
import java.io.IOException
import java.util.ArrayList
import java.util.Arrays
import java.util.logging.Level
import java.util.logging.Logger

object MainLauncher {
    private val l = Logger.getLogger(MainLauncher::class.java.name)

    val NO_REEXEC_OPT = "noReexec"

    var processType = MainLauncher.PROCESS_TYPE.UNKNOWN
        private set

    enum class PROCESS_TYPE {
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
        var name = name

        l.entering(MainLauncher::class.java.toString(), "wrapMain", arrayOf<Any>(name ?: "", Arrays.toString(args), minHeapSizeMegs))

        if ("--$NO_REEXEC_OPT" in args) {
            args[0] = "" // FIXME
            processType = MainLauncher.PROCESS_TYPE.WORKER
            return
        }

        val t = Thread.currentThread()
        assert("main" == t.name)

        val stack = t.stackTrace
        val main = stack[stack.size - 1]
        val mainClass = main.className


        var newHeapSizeMegs = (Runtime.getRuntime().maxMemory() / 1024 / 1024).toInt()
        var needsReExecing = false

        if (newHeapSizeMegs < minHeapSizeMegs) {
            // Note that we don't want to use minHeapSizeMegs, as that may be 0 or something.
            // We want to re-exec with -Xmx = MAX(newHeapSizeMegs, minHeapSizeMegs)
            newHeapSizeMegs = minHeapSizeMegs
            needsReExecing = true
        }

        val jar = WebServerUtils.jarFile
        var jvm = "java"
        val os = System.getProperty("os.name")
        l.info("Detected os: $os")
        if (System.getProperty("os.name").startsWith("Windows")) {
            // We only do this java.exe magic if we're on windows
            // Linux and Mac seem to show useful information if you
            // ps -efw
            if (name == null) {
                if (jar == null) {
                    name = mainClass
                } else {
                    name = jar.name
                    if (name!!.toLowerCase().endsWith(".jar")) {
                        name = name.substring(0, name.length - ".jar".length)
                    }
                }
            }
            if (!name!!.toLowerCase().endsWith(".exe")) {
                name = "$name.exe"
            }
            val jre = File(System.getProperty("java.home"))
            val java = File("$jre\\bin", "java.exe")
            val launcherDir = File("$jre\\temp-launcher")
            launcherDir.mkdir()
            if (launcherDir.isDirectory) {
                val newLauncher = File(launcherDir, name)
                if (newLauncher.exists()) {
                    // This will fail if someone puts something stupid in the directory
                    jvm = "\"" + newLauncher.path + "\""
                } else {
                    try {
                        WebServerUtils.copyFile(java, newLauncher)
                        jvm = "\"" + newLauncher.path + "\""

                        // We successfully created a new executable, so lets use it!
                        needsReExecing = true
                        l.info("Successfully copied $java -> $newLauncher")
                    } catch (e: IOException) {
                        l.log(Level.WARNING, "Couldn't copy java.exe", e)
                    }

                }
            } else {
                l.log(Level.WARNING, "$launcherDir is not a directory.")
            }
        }
        l.info("needsReExecing: $needsReExecing")
        if (!needsReExecing) {
            processType = MainLauncher.PROCESS_TYPE.WORKER
            return
        } else {
            processType = MainLauncher.PROCESS_TYPE.WRAPPER
        }

        val classpath = System.getProperty("java.class.path")
        // Fortunately, classpath contains our jar file if we were run
        // with the -jar command line arg, so classpath and our mainClass
        // are all we need to re-exec ourselves.

        // Note that any command line arguments that are passed to the jvm won't
        // pass through to the new jvm we create. I don't believe it's possible to figure
        // them out in a general way.
        val jvmArgs = ArrayList<String>()
        jvmArgs.add(jvm)
        jvmArgs.add("-Xmx" + newHeapSizeMegs + "m")
        jvmArgs.add("-classpath")
        jvmArgs.add(classpath)
        jvmArgs.add(mainClass)
        jvmArgs.add("--$NO_REEXEC_OPT")
        jvmArgs.addAll(Arrays.asList(*args))

        try {
            l.info("Re-execing with $jvmArgs")
            val pb = ProcessBuilder(jvmArgs)
            pb.redirectErrorStream(true)
            val p = pb.start()

            // If we don't do something like this on Windows, killing the parent process
            // will leave the child process around.
            // There's still the change that if we get forcibly shut down, we won't
            // execute this shutdown hook.
            Runtime.getRuntime().addShutdownHook(object : Thread() {
                override fun run() {
                    p.destroy()
                }
            })

            val `in` = BufferedInputStream(p.inputStream)
            val buff = ByteArray(1024)
            var read: Int = `in`.read(buff)
            while (read >= 0) {
                System.out.write(buff, 0, read)
                read = `in`.read(buff)
            }
            System.exit(0)
        } catch (e: IOException) {
            l.log(Level.WARNING, "", e)
        }
    }
}
