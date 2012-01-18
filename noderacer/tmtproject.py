import tmt
import os

class Project(tmt.TmtProject):
	def getDependencies(self):
		return [ tmt.TmtProject.projects['jsracer'] ]

	def compile(self):
		oldDir = os.path.abspath('.')
		os.chdir(tmt.projectName())
		retVal, stdout, stderr = tmt.runCmd([ 'npm', 'install', '-d' ], showStatus=True)
		assert retVal == 0
		os.chdir(oldDir)

	def run(self):
		oldDir = os.path.abspath('.')
		self.compile()
		tmt.runCmd([ 'node', 'noderacer.js' ], showStatus=True)
		os.chdir(oldDir)

	def clean(self):
		pass

Project(tmt.projectName(), description="A nodejs server that multicasts turns to its clients")
