import tmt
import subprocess
from os.path import join, exists

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		self.fivephase_tables = 'fivephase_tables'
		self.CACHED_FIVEPHASE_TABLES = join(self.name, 'CACHED_FIVEPHASE_TABLES_DELETE_TO_RECREATE')

	def innerCompile(self, src, tempBin, bin):
		if src == self.src:
			tablesPath = join(tempBin, self.fivephase_tables)
			if not exists(self.CACHED_FIVEPHASE_TABLES):
				# build the pruning and transition tables for the five phase algorithm
				print "Generating %s" % self.CACHED_FIVEPHASE_TABLES
				cp = self.getClasspathEntities()
				cp.add(tempBin) # getClasspathEntities() contains self.bin, which isn't up to date yet
				assert 0 == tmt.java(
									main="cg.fivestage444.Tools",
									classpath=self.toClasspath(cp),
									args=[ self.CACHED_FIVEPHASE_TABLES ])
				print "Successfully generated %s!" % self.CACHED_FIVEPHASE_TABLES
			else:
				print "******************************************************"
				print "I found %s, so I'm just going to copy it into %s because I'm sure you're in a rush. If this isn't what you want, please delete %s. Cleaning will NOT remove this file." % ( self.CACHED_FIVEPHASE_TABLES, tablesPath, self.CACHED_FIVEPHASE_TABLES )
				print "******************************************************"
			shutil.copy(self.CACHED_FIVEPHASE_TABLES, tablesPath)

Project(tmt.projectName(), description="A copy of Clement Gallet's (https://github.com/clementgallet) 4x4 scrambler.")
