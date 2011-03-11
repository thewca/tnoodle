package tk.tnoodle.tools.ant;

import java.io.BufferedInputStream;
import java.io.IOException;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

public class DeleteSansSymlinksTask extends Task {

	@Override
	public void execute() throws BuildException {
		// TODO check if we're on windows...
		boolean isWindows = false;
		ProcessBuilder pb;
		if(isWindows) {
			// TODO - test! /S for silent operation?
			pb = new ProcessBuilder("rmdir", "/D", dir);
		} else {
			pb = new ProcessBuilder("/bin/rm", "-r", dir);
		}
		Process p;
		try {
			p = pb.start();
		} catch (IOException e) {
			e.printStackTrace();
			return;
		}
		pb.redirectErrorStream(true);
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

	private String dir;
	public void setDir(String dir) {
		this.dir = dir;
	}
}
