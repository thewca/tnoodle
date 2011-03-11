package tk.tnoodle.tools.ant;

import java.io.BufferedInputStream;
import java.io.IOException;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

public class XPlatformSymlinkTask extends Task {
	
	@Override
	public void execute() throws BuildException {
		// TODO check if we're on windows...
		boolean isWindows = false;
		ProcessBuilder pb;
		if(isWindows) {
			// TODO - test!
			pb = new ProcessBuilder("mklink", "/D", link, resource);
		} else {
			pb = new ProcessBuilder("ln", "-s", resource, link);
		}
		pb.redirectErrorStream(true);
		Process p;
		try {
			p = pb.start();
		} catch (IOException e) {
			e.printStackTrace();
			return;
		}
		BufferedInputStream in = new BufferedInputStream(p.getInputStream());
		byte[] buff = new byte[1024];
		int read;
		try {
			while((read = in.read(buff)) >= 0 ) {
				System.out.write(buff, 0, read);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private String link;
	public void setLink(String link) {
		this.link = link;
	}
	
	private String resource;
	public void setResource(String resource) {
		this.resource = resource;
	}
	
	public static void main(String[] args) {
		System.out.println(System.getenv());
	}
}
