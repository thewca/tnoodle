import tmt
from os.path import join

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		self.main = "winstone.Launcher"

Project(tmt.projectName(), description="Tiny embeddable webserver that implements the java servlet spec.")
