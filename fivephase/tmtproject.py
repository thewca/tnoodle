import tmt
import subprocess
from os.path import join, exists

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		self.fivephase_tables = 'fivephase_tables'

	def innerCompile(self, src, tempBin, bin):
		# build the pruning and transition tables for the five phase algorithm
		tablesPath = join(tempBin, self.fivephase_tables)
		print "Generating %s" % tablesPath
		cp = self.getClasspathEntities()
		cp.add(tempBin) # getClasspathEntities() contains self.bin, which isn't up to date yet
		assert 0 == tmt.java(
						main="cg.fivestage444.Tools",
						classpath=self.toClasspath(cp),
						args=[ tablesPath ])
		print "Successfully generated %s!" % tablesPath

Project(tmt.projectName(), description="A copy of Clement Gallet's (https://github.com/clementgallet) 4x4 scrambler.")
