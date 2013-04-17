import tmt
import subprocess
from os.path import join, exists

class Project(tmt.EclipseProject):
        def configure(self):
                tmt.EclipseProject.configure(self)
                self.main = 'cs.sq12phase.Search'

        def compile(self):
                tmt.EclipseProject.compile(self)

Project(tmt.projectName(), description="A copy of Chen Shuang's square 1 two phase solver.")
