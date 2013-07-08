import tmt

class Project(tmt.EclipseProject):
    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)

Project(tmt.projectName(), description="A Rubik's Cube timer.")
