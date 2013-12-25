import tmt

class Project(tmt.TmtProject):
    def getDependencies(self):
        return [ tmt.TmtProject.projects['twisty.js'] ]

    def getClasspathEntities(self, *args, **keyargs):
        # This is here just to make jracer's getClasspathEntities happy
        return set()

    def compile(self):
        pass

    def clean(self):
        pass

    def check(self):
        pass

Project(tmt.projectName(), description="A javascript game framework created with multiplayer racing in mind")
