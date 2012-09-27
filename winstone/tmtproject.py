import tmt
import os
import os.path
from os.path import join, basename, relpath
import shutil
import xml.etree.ElementTree as ET

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		self.main = "TNoodleServer"
		tmt.WinstoneServer = self

        # It is important that when we iterate through the plugins
        # in topological sorted order. This way if B uses A, B can clobber
        # A's settings.
		self.plugins = OrderedDict()

	def addPlugin(self, project):
		# Note that this may be called multiple times.
		# We only care about the last project to call this,
		# as it will be highest up in the dependency graph.
		project.main = self.main
		project.argv = self.argv
		project.winstonePlugin = True

		self.plugins[project.name] = project

		notDotfile = lambda dirname: not dirname.startswith(".")
		def wrapCompile(ogCompile):
			def newCompile(self):
				if ogCompile(self):
					assert self.webContent
					for dirpath, dirnames, filenames in os.walk(self.webContent):
						dirnames[:] = filter(notDotfile, dirnames) # Note that we're modifying dirnames in place

						if "WEB-INF" in dirnames:
							dirnames.remove("WEB-INF")
						for filename in filter(notDotfile, filenames):
							path = os.path.normpath(os.path.join(dirpath, filename))
							pathRelToWebContent = relpath(path, self.webContent)
							name = join(tmt.WinstoneServer.binResource, "webapps", "ROOT", pathRelToWebContent)
							linkParent = os.path.dirname(name)
							if not os.path.exists(linkParent):
								os.makedirs(linkParent)
							else:
								assert os.path.isdir(linkParent)
							tmt.createSymlinkIfNotExistsOrStale(relpath(path, linkParent), name)
					tmt.WinstoneServer.createWebXml(topLevelWebProject=self)
			return newCompile
		project.__class__.compile = wrapCompile(project.__class__.compile)

		def webContentDist(self):
			# We just compiled ourself, which caused a recompile
			# of winstone server, so there's no need to recompile it.
			# In fact, recompiling it would be bad, as it would nuke
			# our carefully constructed tnoodle_resources.
			tmt.WinstoneServer.dist(noRemake=True)
			tmt.WinstoneServer.distJarFile()
			shutil.copy(tmt.WinstoneServer.distJarFile(), self.distJarFile())
		project.__class__.webContentDist = webContentDist

	def createWebXml(self, topLevelWebProject):
		deps = topLevelWebProject.getRecursiveDependenciesTopoSorted()

		webappsDir = join(self.binResource, "webapps")
		webappDir = join(webappsDir, "ROOT")
		webappWebInfDir = join(webappDir, "WEB-INF")
		if not os.path.isdir(webappWebInfDir):
			os.makedirs(webappWebInfDir)

		webXmlRoot = ET.fromstring("""
<web-app version="2.5" xmlns="http://java.sun.com/xml/ns/javaee"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
</web-app>
""")
		for project in deps:
			if hasattr(project, 'winstonePlugin'):
				assert project.webContent
				pluginWebXmlFile = join(project.webContent, "WEB-INF", "web.xml")
				tree = ET.parse(pluginWebXmlFile)
				root = tree.getroot()
				for child in root:
					webXmlRoot.append(child)

		webXmlFile = join(webappWebInfDir, "web.xml")
		webXmlFileOut = open(webXmlFile, 'w')

		ET.register_namespace("", "http://java.sun.com/xml/ns/javaee")

		webXmlFileOut.write(ET.tostring(webXmlRoot))
		webXmlFileOut.close()

	def tweakJarFile(self, jar):
        # We don't necessarily want all the plugins in self.plugins to load here,
        # we only want the ones that the project we're currently building somehow
        # depends on.
		webProject = tmt.TmtProject.projects[tmt.args.project]

		# Out jar file already contains everything needed to start up winstone.
		# All the contents of tnoodle_resources are there too (including webroot).
		# The problem is that even after compiling, webroot/WEB-INF/lib/ and
		# webroot/WEB-INF/classes/ are still unpopulated, so simply jarring it up
		# isn't good enough. Here we populate classes/ and lib/. To do so, we need
		# all of the things that webProject depends on, EXCEPT for winstone (ourself).
		deps = webProject.getRecursiveDependenciesTopoSorted(exclude=set([self]))

		webInf = join("tnoodle_resources", "webapps", "ROOT", "WEB-INF")
		libDir = join(webInf, "lib")
		classesDir = join(webInf, "classes")
		for project in deps:
			assert project is not self
			if hasattr(project, "jarFile"):
				arcPath = join(libDir, basename(project.jarFile))
				jar.write(project.jarFile, arcPath)
			elif isinstance(project, tmt.EclipseProject):
				for dirpath, dirnames, filenames in os.walk(project.bin, followlinks=True):
					for name in filenames:
						path = join(dirpath, name)
						arcPath = join(classesDir, basename(path))
						jar.write(path, arcPath)


Project(tmt.projectName(), description="Tiny embeddable webserver that implements the java servlet spec.")
