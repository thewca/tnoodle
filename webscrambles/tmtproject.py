import tmt
import subprocess

class Project(tmt.EclipseProject):
    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)

        self.nonJavaResourceDeps |= tmt.glob(self.src, '.*\\.html$', relativeTo=self.src)
        self.nonJavaSrcDeps |= tmt.glob(self.src, '.*\\.properties$', relativeTo=self.src)

Project(tmt.projectName(), description="A server plugin wrapper for scrambles that also draws pdfs.")

