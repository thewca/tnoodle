import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;

public class Launcher {
	public static void main(String[] args) {
		File jre = new File(System.getProperty("java.home"));
		File java = new File(jre + "\\bin", "java.exe");
		File launcherDir = new File(jre + "\\temp-launcher");
		launcherDir.mkdir();
		if(!launcherDir.exists() && !launcherDir.isDirectory()) {
			return;
		}
		File newLauncher = new File(launcherDir, "test.exe");
		if(!newLauncher.exists()) {
			//this will fail if someone puts something stupid in the directory
			try {
				copyFile(java, newLauncher);
			} catch (IOException e) {
				e.printStackTrace();
				return;
			}
		}
		System.out.println(newLauncher.exists());
		
//		ProcessBuilder pb = new ProcessBuilder("\""+newLauncher.getPath()+"\"", "-jar", "\"C:\\Users\\Jeremy\\My Dropbox\\Programming\\Java\\tnoodle\\tnt\\dist\\TNTServer.jar\"");
//		pb.redirectErrorStream(true);
		try {
//			Process p = pb.start();
			String[] jvmArgs = {"\""+newLauncher.getPath()+"\"", "-jar", "\"C:\\Users\\Jeremy\\My Dropbox\\Programming\\Java\\tnoodle\\tnt\\dist\\TNTServer.jar\""};
			final Process p = Runtime.getRuntime().exec(jvmArgs);
			Runtime.getRuntime().addShutdownHook(new Thread() {
				public void run() {
					System.out.println(p);
					p.destroy();
					System.out.println(p);
				};
			});
			BufferedInputStream in = new BufferedInputStream(p.getInputStream());
			byte[] buff = new byte[1024];
			int read;
			while((read = in.read(buff)) >= 0 ) {
				System.out.write(buff, 0, read);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
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
}
