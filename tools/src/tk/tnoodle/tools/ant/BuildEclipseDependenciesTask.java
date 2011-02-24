package tk.tnoodle.tools.ant;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import org.apache.tools.ant.BuildEvent;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.BuildListener;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.ProjectHelper;
import org.apache.tools.ant.Task;

public class BuildEclipseDependenciesTask extends Task {
	@Override
	public void execute() throws BuildException {
		if(buildingProject == null) {
			throw new BuildException("No project specified");
		}
		
		String classpath = getClasspath(null, graph.rootNode);
		getProject().setProperty("classpath", classpath);
		
		boolean uptodate_src = graph.rootNode.getLastSourceTimestamp() <= graph.rootNode.getLastBuildTimestamp();
		if(buildDependencies) {
			long lastBuilt = graph.rootNode.getLastBuildTimestamp();
			for(EclipseDependencyNode use : graph.rootNode.uses) {
				build(use);
				uptodate_src &= (lastBuilt >= use.getLastBuildTimestamp());
			}
			if(uptodate_src)
				getProject().setProperty("uptodate-src", "true");
		}
		
		if(copyDependencies) {
			copyDependencies(null, graph.rootNode);
		}
		
		if(uptodate_src && graph.rootNode.getLastDistTimestamp() >= graph.rootNode.getLastBuildTimestamp()) {
			getProject().setProperty("uptodate-dist", "true");
		}
	}

	private void copyDependencies(EclipseDependencyNode parent, EclipseDependencyNode project) {
		if(parent == null) {
			// We don't want to copy the root project's bin directory into itself
		} else if(project.dependency.getName().endsWith(".jar")) {
			File jar = project.dependency;
			System.out.println("Extracting " + jar.getAbsolutePath() + " to " + buildingProjectBin.getAbsolutePath());
			try {
				extractJar(jar, buildingProjectBin);
			} catch (IOException e) {
				throw new BuildException(e);
			}
		} else {
			File projectBin = new File(project.dependency, "bin");
			System.out.println("Copying " + projectBin.getAbsolutePath() + " to " + buildingProjectBin.getAbsolutePath());
			try {
				copyDirectory(projectBin, buildingProjectBin);
			} catch (IOException e) {
				throw new BuildException(e);
			}
		}
		for(EclipseDependencyNode use : project.uses) {
			copyDependencies(project, use);
		}
	}

	private String getClasspath(EclipseDependencyNode parent, EclipseDependencyNode project) {
		String classpath = "";
		if(parent != null) {
			// We don't want to include the root project in the generated classpath
			classpath += project.getClasspathEntry();
		}
		for(EclipseDependencyNode use : project.uses) {
			classpath += ";" + getClasspath(project, use);
		}
		if(classpath.startsWith(";")) {
			classpath = classpath.substring(1);
		}
		return classpath;
	}
	
	private void build(EclipseDependencyNode project) {
		if(project.dependency.getName().endsWith(".jar")) {
			// No building required if we're dealing with a jar file,
		} else {
			System.out.println("Invoking 'compile' on " + project.dependency.getName());
			// We're dealing with an eclipse project. Building it will cause its children to be built.
			File buildFile = new File(project.dependency, "build.xml");
			if(!buildFile.isFile()) {
				throw new BuildException();
			}
	
			Project p = new Project();
			
			// Without this BuildListener weirdness, stdout from task execution doesn't getting printed.
			BuildListener bl = new BuildListener() {
				@Override
				public void taskStarted(BuildEvent arg0) {}
				
				@Override
				public void taskFinished(BuildEvent arg0) {}
				
				@Override
				public void targetStarted(BuildEvent arg0) {}
				
				@Override
				public void targetFinished(BuildEvent arg0) {}
				
				@Override
				public void messageLogged(BuildEvent e) {
					if(e.getPriority() <= 2) {
						System.out.println(e.getTarget() + ": " + e.getMessage());
					}
				}
				
				@Override
				public void buildStarted(BuildEvent arg0) {}
				
				@Override
				public void buildFinished(BuildEvent arg0) {}
			};
			p.addBuildListener(bl);
			
			p.setUserProperty("ant.file", buildFile.getAbsolutePath());
			p.init();
			ProjectHelper helper = ProjectHelper.getProjectHelper();
			p.addReference("ant.projectHelper", helper);
			helper.parse(p, buildFile);
			p.executeTarget("compile");
		}
	}
	
	private void extractJar(File jarFile, File destDir) throws IOException {
		JarFile jar = new JarFile(jarFile);
		Enumeration<JarEntry> entries = jar.entries();
		while (entries.hasMoreElements()) {
			JarEntry file = entries.nextElement();
			File f = new File(destDir, file.getName());
			if(file.isDirectory()) {
				f.mkdir();
				continue;
			}
			f.getParentFile().mkdirs(); // apparently files can show up without their ancestor directories
			InputStream in = jar.getInputStream(file);
			FileOutputStream out = new FileOutputStream(f);
			copy(in, out);
//			while(is.available() > 0) {
//				fos.write(is.read());
//			}
//			fos.close();
//			is.close();
		}
	}
	
	private void copy(InputStream in, OutputStream out) throws IOException {
		// Copy the bits from instream to outstream
		byte[] buf = new byte[1024];
		int len;
		while ((len = in.read(buf)) > 0) {
			out.write(buf, 0, len);
		}
		in.close();
		out.close();
	}

	// Copied from: http://www.java-tips.org/java-se-tips/java.io/how-to-copy-a-directory-from-one-location-to-another-loc-2.html
	// If targetLocation does not exist, it will be created.
	public void copyDirectory(File sourceLocation, File targetLocation) throws IOException {
		if(sourceLocation.isDirectory()) {
			if(!targetLocation.exists()) {
				targetLocation.mkdir();
			}

			String[] children = sourceLocation.list();
			for(int i=0; i<children.length; i++) {
				copyDirectory(new File(sourceLocation, children[i]),
							  new File(targetLocation, children[i]));
			}
		} else {
			InputStream in = new FileInputStream(sourceLocation);
			OutputStream out = new FileOutputStream(targetLocation);
			copy(in, out);
		}
	}
	
	private File buildingProject, buildingProjectBin;
	private EclipseDependencyGraph graph;
	public void setProject(File project) {
		this.buildingProject = project;
		this.buildingProjectBin = new File(this.buildingProject, "bin");
		this.graph = new EclipseDependencyGraph(project);
	}
	
	private boolean buildDependencies = true;
	public void setNoBuild(boolean noBuild) {
		this.buildDependencies = !noBuild;
	}
	
	private boolean copyDependencies = false;
	public void setCopyDependencies(boolean copyDependencies) {
		this.copyDependencies = copyDependencies;
	}
}
