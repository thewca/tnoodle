package tk.tnoodle.tools.ant;

import java.io.File;
import java.util.HashMap;
import java.util.HashSet;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.tools.ant.BuildException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public class EclipseDependencyGraph {
	private static HashMap<File, EclipseDependencyNode> nodes = new HashMap<File, EclipseDependencyNode>();
	
	public EclipseDependencyNode rootNode;
	public EclipseDependencyGraph(File project) {
		rootNode = createNode(project);
	}
	
	@Override
	public String toString() {
		return toString(rootNode, 0);
	}
	
	private String pad(int level) {
		String pad = "";
		for(int i = 0; i < level; i++) {
			pad += "   ";
		}
		return pad;
	}
	private String toString(EclipseDependencyNode node, int level) {
		String pad = pad(level);
		String str = "";
		
		str += pad + node.dependency.getAbsolutePath() + "\n";
		for(EclipseDependencyNode use : node.uses) {
			str += toString(use, level+1);
		}
		
		return str;
	}

	private EclipseDependencyNode createNode(File project) {
		if(nodes.containsKey(project)) {
			return nodes.get(project);
		}
		
		EclipseDependencyNode dependencyNode;
		if(project.isFile()) {
			if(!project.getName().endsWith(".jar")) {
				throw new BuildException("Invalid jar file: " + project.getAbsolutePath());
			}
			// we're dealing with a jar file, which must be a leaf node
			dependencyNode = new EclipseDependencyNode(project, new HashSet<EclipseDependencyNode>());
		} else {
			if(!project.isDirectory()) {
				throw new BuildException("Invalid project: " + project.getAbsolutePath());
			}

			// we're dealing with an eclipse project, so first we build up the set of dependencies we use
			HashSet<EclipseDependencyNode> uses = new HashSet<EclipseDependencyNode>();

			//TODO error checking!
			File root = project.getParentFile();
			File src = new File(project, "src");
			File bin = new File(project, "bin");
			File classpathFile = new File(project, ".classpath");

			DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder dBuilder = null;
			Document doc = null;
			try {
				dBuilder = dbFactory.newDocumentBuilder();
				doc = dBuilder.parse(classpathFile);
			} catch (Exception e) {
				throw new BuildException(e);
			}
			doc.getDocumentElement().normalize();
			NodeList classpathEntries = doc.getElementsByTagName("classpathentry");
			for(int i = 0; i < classpathEntries.getLength(); i++) {
				Node node = classpathEntries.item(i);
				if(node.getNodeType() == Node.ELEMENT_NODE) {
					Element classpathEntry = (Element) node;
					String kind = classpathEntry.getAttribute("kind");
//					boolean exported = "true".equals(classpathEntry.getAttribute("exported"));
					String path = classpathEntry.getAttribute("path");
					File pathFile;
					if(path.startsWith("/")) {
						pathFile = new File(root, path);
					} else {
						pathFile = new File(project, path);
					}
					if(kind.equals("lib")) {
						if(path.endsWith(".jar")) {
							uses.add(createNode(pathFile));
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
							// it has a .classpath file).
							uses.add(createNode(pathFile));
						}
					}
				}
			}
			dependencyNode = new EclipseDependencyNode(project, uses);
		}

		nodes.put(project, dependencyNode);
		return dependencyNode;
	}
}