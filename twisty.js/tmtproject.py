import tmt

class Project(tmt.TmtProject):
	def getDependencies(self):
		return []

	def compile(self):
		pass

	def clean(self):
		pass

	def check(self):
		pass

Project(tmt.projectName(), description="Lucas Garron's Javascript puzzle simulator.")
