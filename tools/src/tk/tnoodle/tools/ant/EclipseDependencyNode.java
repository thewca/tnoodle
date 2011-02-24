package tk.tnoodle.tools.ant;

import java.io.File;
import java.util.Set;

import org.apache.tools.ant.BuildException;

public class EclipseDependencyNode {
	public final File dependency; // this can be a project directory or a jar file
	public final Set<EclipseDependencyNode> uses;
	public EclipseDependencyNode(File dependency, Set<EclipseDependencyNode> uses) {
		if(uses == null || dependency == null) {
			throw new BuildException();
		}
		this.dependency = dependency;
		this.uses = uses;
	}
	
	public String getClasspathEntry() {
		if(dependency.getName().endsWith(".jar")) {
			return dependency.getAbsolutePath();
		}
		return new File(dependency, "bin").getAbsolutePath();
	}
	
	public long getLastSourceTimestamp() {
		if(dependency.getName().endsWith(".jar")) {
			return dependency.lastModified();
		}
		return getLatestTimestamp(new File(dependency, "src"));
	}
	
	public long getLastDistTimestamp() {
		if(dependency.getName().endsWith(".jar")) {
			return dependency.lastModified();
		}
		return getLatestTimestamp(new File(dependency, "dist"));
	}
	
	public long getLastBuildTimestamp() {
		if(dependency.getName().endsWith(".jar")) {
			return dependency.lastModified();
		}
		return getLatestTimestamp(new File(dependency, "bin"));
	}
	
	private long getLatestTimestamp(File f) {
		if(f.isFile()) {
			return f.lastModified();
		}
		long latest = 0;
		for(File child : f.listFiles()) {
			latest = Math.max(latest, getLatestTimestamp(child));
		}
		return latest;
	}
	
	@Override
	public String toString() {
		return dependency.getName();
	}
}
