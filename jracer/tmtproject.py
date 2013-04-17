import tmt
from os.path import join

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)

	def compile(self):
		tmt.EclipseProject.compile(self)

Project(tmt.projectName(), description="An easy to distribute and run single player version of noderacer.")
