import tmt
import subprocess
from os.path import join, exists

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		self.fivephase_tables = join(self.binResource, 'fivephase_tables')

	def compile(self):
		tmt.EclipseProject.compile(self)
		# build the pruning and transition tables for the five phase algorithm
		# iff they don't already exist
		if not exists(self.fivephase_tables):
			print "Generating %s" % self.fivephase_tables
			assert 0 == tmt.java(
							main="cg.fivephase.Tools",
							classpath=self.getClasspath(),
							args=[ self.fivephase_tables ])
			print "Successfully generated %s!" % self.fivephase_tables

Project(tmt.projectName(), description="A copy of Clement Gallet's (https://github.com/clementgallet) 4x4 scrambler.")
