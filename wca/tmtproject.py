import tmt

class Project(tmt.EclipseProject):
    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)

        self.fullName = "TNoodle-WCA"

Project(tmt.projectName(), description="Special target for the WCA")
