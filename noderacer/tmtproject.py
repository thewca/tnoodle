import tmt
import os
import sys

class Project(tmt.TmtProject):
    def getDependencies(self):
        return [ tmt.TmtProject.projects['jsracer'] ]

    def assertNodeInstallation(self):
        retVal = 1
        try:
            retVal = tmt.runCmd([ 'npm', '-version' ], interactive=True)
        except:
            pass
        if retVal != 0:
            print()
            print("It appears you do not have npm (node's package manager) installed.")
            print("Install node (http://nodejs.org/, it should provide npm) and try again.")
            sys.exit(1)

    def compile(self):
        self.assertNodeInstallation()
        oldDir = self._chdir()
        retVal = tmt.runCmd([ 'npm', 'install' ], interactive=True)
        assert retVal == 0
        os.chdir(oldDir)

    def _chdir( self ):
        oldDir = os.path.abspath('.')
        os.chdir(tmt.projectName())
        return oldDir

    def run(self):
        self.compile()
        oldDir = self._chdir()
        tmt.runCmd([ 'node', 'noderacer.js' ], interactive=True)
        os.chdir(oldDir)

    def clean(self):
        pass

    def check(self):
        pass

Project(tmt.projectName(), description="A nodejs game server that multicasts turns to its clients")
