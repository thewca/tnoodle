package tk.tnoodle.tools.ant;

import java.io.File;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

public class DrawEclipseDependenciesTask extends Task {
	@Override
	public void execute() throws BuildException {
		if(project == null) {
			throw new BuildException("No project specified");
		}
		System.out.println(this.graph.toString());
	}
		
	private File project;
	private EclipseDependencyGraph graph;
	public void setProject(File project) {
		this.project = project;
		this.graph = new EclipseDependencyGraph(project);
	}
}
