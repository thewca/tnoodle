import tmt
import subprocess
from os.path import join, exists
import shutil

class Project(tmt.EclipseProject):
        def configure(self):
                tmt.EclipseProject.configure(self)
                tmt.WinstoneServer.addPlugin(self, needsDb=True)

Project(tmt.projectName(), description="A very basic demo of a java servlet and a php page.")
