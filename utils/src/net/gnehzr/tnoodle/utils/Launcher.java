package  net.gnehzr.tnoodle.utils;

import static net.gnehzr.tnoodle.utils.Utils.azzert;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Launcher {
	private static final Logger l = Logger.getLogger(Launcher.class.getName());
	private static final String NO_REEXEC = "-noReexec";

	public static void wrapMain(String[] args, int minHeapSizeMegs) {
		wrapMain(null, args, minHeapSizeMegs);
	}

	public static enum PROCESS_TYPE {
		UNKNOWN,
		WRAPPER,
		WORKER
	}
	
	private static PROCESS_TYPE processType = PROCESS_TYPE.UNKNOWN;
	
	public static PROCESS_TYPE getProcessType() {
		return processType;
	}
	
	/*
	 * Windows doesn't give good names for java programs in the task manager,
	 * they all just show up as intances of java.exe.
	 * On Windows this wrapper function attempts to
	 * create a copy of java.exe called name.exe and reexecs itself.
	 * If name == null, name is derived from the jar filename or the main classname.
	 * This wrapper also ensures that the jvm is running with at least
	 * minHeapSizeMegs mb of heap space, and if not, reexecs itself and passes
	 * an appropriate -Xmx to the jvm.
	 */
	public static void wrapMain(String name, String[] args, final int minHeapSizeMegs) {
		if(args.length > 0 && args[0].equals(NO_REEXEC)) {
			args[0] = "";
			processType = PROCESS_TYPE.WORKER;
			return;
		}
		
		Thread t = Thread.currentThread();
		azzert("main".equals(t.getName()));
		StackTraceElement[] stack = t.getStackTrace();
		StackTraceElement main = stack[stack.length - 1];
		String mainClass = main.getClassName();

		boolean needsReExecing = false;

		int newHeapSizeMegs = (int) ((Runtime.getRuntime().maxMemory()/1024)/1024);
		if(newHeapSizeMegs < minHeapSizeMegs) {
			// Note that we don't want to use minHeapSizeMegs, as that may be 0 or something.
			// We want to re-exec with -Xmx = MAX(newHeapSizeMegs, minHeapSizeMegs)
			newHeapSizeMegs = minHeapSizeMegs;
			needsReExecing = true;
		}
		File jar = Utils.getJarFile();
		String jvm = "java";
		if(System.getProperty("os.name").startsWith("Windows")) {
			// We only do this java.exe magic if we're on windows
			// Linux and Mac seem to show useful information if you
			// ps -efw
			if(name == null) {
				if(jar == null) {
					name = mainClass;
				} else {
					name = jar.getName();
					if(name.toLowerCase().endsWith(".jar")) {
						name = name.substring(0, name.length() - ".jar".length());
					}
				}
			}
			if(!name.toLowerCase().endsWith(".exe")) {
				name = name + ".exe";
			}
			File jre = new File(System.getProperty("java.home"));
			File java = new File(jre + "\\bin", "java.exe");
			File launcherDir = new File(jre + "\\temp-launcher");
			launcherDir.mkdir();
			if(launcherDir.isDirectory()) {
				File newLauncher = new File(launcherDir, name);
				if(newLauncher.exists()) {
					// This will fail if someone puts something stupid in the directory
					jvm = "\"" + newLauncher.getPath() + "\"";
				} else {
					try {
						Utils.copyFile(java, newLauncher);
						jvm = "\"" + newLauncher.getPath() + "\"";

						// We successfully created a new executable, so lets use it!
						needsReExecing = true;
					} catch (IOException e) {
						l.log(Level.WARNING, "Couldn't copy java.exe", e);
					}
				}
			}
		}
		if(!needsReExecing) {
			processType = PROCESS_TYPE.WORKER;
			return;
		}
		else {
			processType = PROCESS_TYPE.WRAPPER;
		}
		
		String classpath = System.getProperty("java.class.path");
		// Fortunately, classpath contains our jar file if we were run
		// with the -jar command line arg, so classpath and our mainClass
		// are all we need to re-exec ourselves.

		// Note that any command line arguments that are passed to the jvm won't
		// pass through to the new jvm we create. I don't believe it's possible to figure
		// them out in a general way.
		ArrayList<String> jvmArgs = new ArrayList<String>();
		jvmArgs.add(jvm);
		jvmArgs.add("-Xmx" + newHeapSizeMegs + "m");
		jvmArgs.add("-classpath");
		jvmArgs.add(classpath);
		jvmArgs.add(mainClass);
		jvmArgs.add(NO_REEXEC);
		jvmArgs.addAll(Arrays.asList(args));

		try {
			l.info("Re-execing with " + jvmArgs);
			ProcessBuilder pb = new ProcessBuilder(jvmArgs);
			pb.redirectErrorStream(true);
			final Process p = pb.start();

			// If we don't do something like this on Windows, killing the parent process
			// will leave the child process around.
			// There's still the change that if we get forcibly shut down, we won't
			// execute this shutdown hook.
			Runtime.getRuntime().addShutdownHook(new Thread() {
				public void run() {
					p.destroy();
				};
			});
			BufferedInputStream in = new BufferedInputStream(p.getInputStream());
			byte[] buff = new byte[1024];
			int read;
			while((read = in.read(buff)) >= 0 ) {
				System.out.write(buff, 0, read);
			}
			System.exit(0);
		} catch(IOException e) {
			l.log(Level.WARNING, "", e);
		}
	}
}
