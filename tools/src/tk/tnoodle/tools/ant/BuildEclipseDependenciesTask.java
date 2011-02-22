package tk.tnoodle.tools.ant;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

public class BuildEclipseDependenciesTask extends Task {
	@Override
	public void execute() throws BuildException {
		System.out.println("Building dependencies...");
	}
}
