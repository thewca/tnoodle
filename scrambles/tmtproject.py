import tmt

DESCRIPTION = "A Java scrambling suite. Java applications can use this project as a library. A perfect example of this is the webscrambles package."

class Project(tmt.EclipseProject):
	def __init__(self):
		tmt.EclipseProject.__init__(
				self,
				tmt.projectName(),
				description=DESCRIPTION,
				main='net.gnehzr.tnoodle.scrambles.Main',
				tests=['net.gnehzr.tnoodle.test.ScrambleTest'])

	def configure(self):
		tmt.EclipseProject.configure(self)
		self.nonJavaResourceDeps |= tmt.glob(self.srcResource, '.*png$', relativeTo=self.srcResource)
		self.nonJavaResourceDeps.add('scrambler/scramblers')

Project()
