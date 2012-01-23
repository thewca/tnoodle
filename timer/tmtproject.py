import tmt
from os.path import join

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		tmt.Server.addPlugin(self)
		self.nonJavaSrcDeps += [ 'tnoodleServerHandler/timer/' ]

	def compile(self):
		recompiled = tmt.EclipseProject.compile(self)

Project(tmt.projectName(), description="A Rubik's Cube timer.")
