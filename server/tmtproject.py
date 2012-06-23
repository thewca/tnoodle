import tmt
import os
from os.path import join, exists, relpath
import shutil
from collections import OrderedDict

SERVER_PLUGIN_DIR = 'tnoodleServerHandler'
CONTEXT_FILE = 'tnoodleServerHandlers'

class Project(tmt.EclipseProject):
	def __init__(self, *args, **kwargs):
		tmt.EclipseProject.__init__(
				self,
				tmt.projectName(),
				description="A basic, extensible webserver",
				main='net.gnehzr.tnoodle.server.TNoodleServer',
				argv=[ '--nobrowser', '--disable-caching', '--consoleLevel=INFO' ])
        # It is important that when we iterate through the plugins
        # in topological sorted order. This way if B uses A, B can clobber
        # A's settings.
		self.plugins = OrderedDict()

	def addPlugin(self, project):
		project.serverPluginSrcDir = join(project.srcResource, SERVER_PLUGIN_DIR)
		project.contextFileName = join(project.serverPluginSrcDir, CONTEXT_FILE)
		assert exists(join(project.serverPluginSrcDir, project.name))
		project.serverPluginBinDir = join(project.binResource, SERVER_PLUGIN_DIR)
		project.serverPluginPackageBinDir = join(project.serverPluginBinDir, project.name)
		project.main = self.main
		project.argv = self.argv
		assert exists(project.contextFileName)
		assert project.name not in self.plugins
		self.plugins[project.name] = project

	def configure(self):
		tmt.Server = self
		tmt.EclipseProject.configure(self)
		self.addPlugin(self)
		self.nonJavaSrcDeps += [ 'tnoodleServerHandler/server/' ]
		self.nonJavaSrcDeps += [ 'icons/' ]

	def compile(self):
		tmt.EclipseProject.compile(self)
		context = ''
		for project in self.plugins.values():
			contextFileName = project.contextFileName
			assert exists(contextFileName)

			if project != self:
				linkName = join(self.serverPluginBinDir, project.name)
				dest = relpath(project.serverPluginPackageBinDir, self.serverPluginBinDir)
				linkUpToDate = False
				if os.path.islink(linkName):
					linkTo = os.readlink(linkName)
					if linkTo == dest.replace(os.sep, '/'):
						linkUpToDate = True
				if not linkUpToDate:
					if exists(linkName):
						os.unlink(linkName)
					os.symlink(dest, linkName)

			inputContextFile = file(contextFileName, 'r')
			context += inputContextFile.read() + '\n'

		outputContextFileName = join(self.serverPluginBinDir, CONTEXT_FILE)
		contextFileUpToDate = False
		if exists(outputContextFileName):
			outputContextFile = file(outputContextFileName, 'r')
			contextFileUpToDate = ( outputContextFile.read() == context )
		if not contextFileUpToDate:
			outputContextFile = file(outputContextFileName, 'w')
			outputContextFile.write(context)

Project()
