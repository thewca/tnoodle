import tmt
import subprocess
from os.path import join, exists

class Project(tmt.EclipseProject):
    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)

Project(tmt.projectName(), description="A 100% java implementation of php.")
