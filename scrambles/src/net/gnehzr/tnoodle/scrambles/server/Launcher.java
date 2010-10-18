package  net.gnehzr.tnoodle.scrambles.server;

import java.util.Arrays;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;

public class Launcher {
	/*
		TODO document!
	*/
	public static void wrapMain(String[] args) {
		wrapMain(null, args);
	}

	public static void wrapMain(String name, String[] args) {
		if(args.length > 0 && args[0].equals("-exe")) {
			args[0] = "";
			return;
		}
		if(!System.getProperty("os.name").startsWith("Windows")) {
			// We only do this java.exe magic if we're on windows
			// Linux and Mac seem to show useful information if you
			// ps -efw
			return;
		}
		File jar = getJarFile();
		if(jar == null) {
			//we're not going to bother with this... too tricky
			return;
		}
		if(name == null) {
			name = jar.getName();
			if(name.toLowerCase().endsWith(".jar"))
				name = name.substring(0, name.length() - ".jar".length());
		}
		if(!name.toLowerCase().endsWith(".exe")) {
			name = name + ".exe";
		}
		File jre = new File(System.getProperty("java.home"));
		File java = new File(jre + "\\bin", "java.exe");
		File launcherDir = new File(jre + "\\temp-launcher");
		launcherDir.mkdir();
		if(!launcherDir.exists() && !launcherDir.isDirectory()) {
			return;
		}
		File newLauncher = new File(launcherDir, name);
		if(!newLauncher.exists()) {
			//this will fail if someone puts something stupid in the directory
			try {
				copyFile(java, newLauncher);
			} catch (IOException e) {
				e.printStackTrace();
				return;
			}
		}
		
		String jvm = "\"" + newLauncher.getPath() + "\"";
		ArrayList<String> jvmArgs = new ArrayList<String>();
		jvmArgs.add(jvm);
		jvmArgs.add("-jar");
		jvmArgs.add("\"" + jar.getPath() + "\"");
		jvmArgs.add("-exe"); //TODO - document this!
		jvmArgs.addAll(Arrays.asList(args));

		System.out.println(jvmArgs);
		try {
			ProcessBuilder pb = new ProcessBuilder(jvmArgs);
			pb.redirectErrorStream(true);
			final Process p = pb.start();

			//final Process p = Runtime.getRuntime().exec(jvmArgs);

			//TODO have child process periodically check its parent process?
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
			e.printStackTrace();
		}
		// TODO - can use this functionality to kill the old process and replace it
		// with ourselves
	}
	public static void copyFile(File sourceFile, File destFile) throws IOException {
		if(!destFile.exists()) {
			destFile.createNewFile();
		}

		FileChannel source = null;
		FileChannel destination = null;
		try {
			source = new FileInputStream(sourceFile).getChannel();
			destination = new FileOutputStream(destFile).getChannel();
			destination.transferFrom(source, 0, source.size());
		}
		finally {
			if(source != null) {
				source.close();
			}
			if(destination != null) {
				destination.close();
			}
		}
	}

	public static File getJarFile() {
		File jar;
		try {
			jar = new File(Launcher.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
		} catch (URISyntaxException e) {
			return null;
		}
		if(jar.isFile()) //this should indicate a jar file
			return jar;
		return null;
	}
	/**
	 * @return A File representing the directory in which this program resides.
	 * If this is a jar file, this should be obvious, otherwise things are a little ambiguous.
	 */
	public static File getProgramDirectory() {
		File defaultScrambleFolder;
		try {
			defaultScrambleFolder = new File(Launcher.class.getProtectionDomain().getCodeSource().getLocation().toURI().getPath());
		} catch (URISyntaxException e) {
			return new File(".");
		}
		if(defaultScrambleFolder.isFile()) //this should indicate a jar file
			defaultScrambleFolder = defaultScrambleFolder.getParentFile();
		return defaultScrambleFolder;
	}
}
