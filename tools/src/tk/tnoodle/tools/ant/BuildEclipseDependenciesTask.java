package tk.tnoodle.tools.ant;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.tools.ant.BuildException;
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
		
		File bin = new File(project, "bin");
		File src = new File(project, "src");
		File root = project.getParentFile();
		
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
						// path points to either a jar file or another project.
						if(path.endsWith(".jar")) {
							// project depends on a precompiled jar, so we simply
							// extract the jar to our bin directory.
							extractJar(pathFile, bin);
						} else {
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
						}
					} else if(kind.equals("con")) {
						// I'm not sure what this is, but I think we can safely ignore it
					} else if(kind.equals("output")) {
						if(!pathFile.equals(bin))
							throw new BuildException();
					} else if(kind.equals("src")) {
						if(!pathFile.equals(src))
							throw new BuildException();
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
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
			InputStream is = jar.getInputStream(file);
			FileOutputStream fos = new FileOutputStream(f);
			while(is.available() > 0) {
				fos.write(is.read());
			}
			fos.close();
			is.close();
		}
	}

	private void build(File project) {
		//TODO
		System.out.println("This is where we recursively invoke ant on " + project);
	}
	
	private File project = null;
	public void setProject(File project) {
		this.project = project;
	}
}
