import tmt
import os
import os.path

class Project(tmt.TmtProject):
    def configure(self):
        self.gradlew = "(cd %s; ./gradlew %%s)" % self.name

    def getDependencies(self):
        return [ tmt.TmtProject.projects['scrambles'] ]

    def compile(self):
        retVal = os.system(self.gradlew % "assemble")
        assert retVal == 0

    def clean(self):
        retVal = os.system(self.gradlew % "clean")
        assert retVal == 0

    def check(self):
        pass

Project(tmt.projectName(), description="Android scrambling library")
