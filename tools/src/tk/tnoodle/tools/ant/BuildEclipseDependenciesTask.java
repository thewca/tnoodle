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

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.ProjectHelper;
import org.apache.tools.ant.Task;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class BuildEclipseDependenciesTask extends Task {
	@Override
	public void execute() throws BuildException {
		if(project == null) {
			throw new BuildException("No project specified");
		}
		System.out.println("Building dependencies of " + project);
		
		try {
			//TODO error checking!
			File classpathFile = new File(project, ".classpath");
			DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
			Document doc = dBuilder.parse(classpathFile);
			doc.getDocumentElement().normalize();

			NodeList nList = doc.getElementsByTagName("classpathentry");

			for (int temp = 0; temp < nList.getLength(); temp++) {

				Node nNode = nList.item(temp);	    
				if (nNode.getNodeType() == Node.ELEMENT_NODE) {

					Element eElement = (Element) nNode;
					String kind = eElement.getAttribute("kind");
					boolean exported = "true".equals(eElement.getAttribute("exported"));
					String path = eElement.getAttribute("path");
					File pathFile;
					if(path.startsWith("/")) {
						pathFile = new File(root, path);
					} else {
						pathFile = new File(project, path);
					}
					if(kind.equals("lib")) {
						if(path.endsWith(".jar")) {
							// project depends on a precompiled jar, so we simply
							// extract the jar to our bin directory.
							extractJar(pathFile, bin);
						} else {
							throw new BuildException();
						}
					} else if(kind.equals("con")) {
						// I'm not sure what this is, but I think we can safely ignore it
					} else if(kind.equals("output")) {
						if(!pathFile.equals(bin))
							throw new BuildException();
					} else if(kind.equals("src")) {
						if(!pathFile.equals(src)) {
							// We assume this is an eclipse style project (that is,
							// it has a .classpath file) and build it and then copy its
							// contents into our bin directory.
							File subproject = pathFile;
							if(!subproject.isDirectory()) {
								throw new BuildException();
							}
							if(!new File(subproject, ".classpath").exists()) {
								throw new BuildException();
							}
							build(subproject);
							//throw new BuildException(pathFile.getAbsolutePath() + " != " + src.getAbsolutePath());
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	//TODO - can this get sped up?
	private void extractJar(File jarFile, File destDir) throws IOException {
		System.out.println("Extracting " + jarFile + " to " + destDir);
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
			InputStream is = jar.getInputStream(file);
			FileOutputStream fos = new FileOutputStream(f);
			while(is.available() > 0) {
				fos.write(is.read());
			}
			fos.close();
			is.close();
		}
	}

	private void build(File project) throws IOException {
		System.out.println("Compiling " + this.project + " dependency: " + project);
		File buildFile = new File(project, "build.xml");
		File childBin = new File(project, "bin");
		if(!buildFile.isFile()) {
			throw new BuildException();
		}

		Project p = new Project();
		p.setUserProperty("ant.file", buildFile.getAbsolutePath());
		p.init();
		ProjectHelper helper = ProjectHelper.getProjectHelper();
		p.addReference("ant.projectHelper", helper);
		helper.parse(p, buildFile);
		p.executeTarget("compile");
		
		System.out.println("Copying" + childBin + " to " + this.bin);
		copyDirectory(childBin, this.bin);
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

			// Copy the bits from instream to outstream
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf)) > 0) {
				out.write(buf, 0, len);
			}
			in.close();
			out.close();
		}
	}
	
	private File project, src, bin, root;
	public void setProject(File project) {
		this.project = project;
		this.src = new File(project, "src");
		this.bin = new File(project, "bin");
		this.root = project.getParentFile();
		
	}
}
