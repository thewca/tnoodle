import tmt

class Project(tmt.TmtProject):
	def compile(self):
		pass
	
	def getDependencies(self):
		return [ tmt.TmtProject.projects['timer'],
			 	 tmt.TmtProject.projects['noderacer'],
				 tmt.TmtProject.projects['jracer'] ]

	def check(self):
		return
	
	def clean(self):
		for dep in self.getDependencies():
			dep.clean()

Project(tmt.projectName(), description="")
