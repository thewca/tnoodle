import tmt
from os.path import join

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		tmt.Server.addPlugin(self)
		self.nonJavaSrcDeps += [ 'tnoodleServerHandler/timer/' ]

		# I'd rather maintain a single TNoodle.jar binary that multiple different
		# jars with different subsets of what I consider TNoodle.
		self.fullName = "TNoodle"

Project(tmt.projectName(), description="A Rubik's Cube timer.")
