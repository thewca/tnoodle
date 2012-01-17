import tmt

class Project(tmt.TmtProject):
	def getDependencies(self):
		return [ tmt.TmtProject.projects['twisty.js'] ]

	def compile(self):
		pass

Project(tmt.projectName(), description="A javascript game framework created with multiplayer racing in mind")
