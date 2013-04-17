import tmt
import subprocess
from os.path import join, exists

class Project(tmt.EclipseProject):
        def configure(self):
                tmt.EclipseProject.configure(self)
                self.twophase_tables = 'twophase_tables'

        """
    Commented out because we don't bother generating the tables at compile time anymore.
    They're generated the first time you run tnoodle, and are saved to disk.
        def innerCompile(self, src, tempBin, bin):
                if src == self.srcResource:
                        # build the pruning and transition tables for the two phase algorithm
                        tablesPath = join(tempBin, self.twophase_tables)
                        print "Generating %s" % tablesPath
                        cp = self.getClasspathEntities()
                        cp.add(tempBin) # getClasspathEntities() contains self.bin, which isn't up to date yet
                        assert 0 == tmt.java(
                                                        main="cs.min2phase.Tools",
                                                        classpath=self.toClasspath(cp),
                                                        args=[ tablesPath ])
                        print "Successfully generated %s!" % tablesPath
        """

Project(tmt.projectName(), description="Chen Shuang's (https://github.com/ChenShuang) awesome 3x3 scrambler built on top of Herbert Kociemba's Java library.")
