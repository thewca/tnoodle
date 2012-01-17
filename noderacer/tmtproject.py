import tmt

class Project(tmt.TmtProject):
	def getDependencies(self):
		return [ tmt.TmtProject.projects['jsracer'] ]

	def compile(self):
		pass

Project(tmt.projectName(), description="A nodejs server that multicasts turns to its clients")
