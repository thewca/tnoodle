import tmt
import unifyhtml
import os

class Project(tmt.EclipseProject):
    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)

    def distUnifiedHtmlFile(self):
        return os.path.join(self.distDir, 'tnt.html')

    def dist(self, noRemake=False, implementationTitle=None):
        tmt.EclipseProject.dist(self, noRemake=noRemake, implementationTitle=implementationTitle)

        # Build a standalone tnt.html
        #  - Start a tnt server in the background.
        #  - Then run unifyhtml.unify on http://localhost:8080/tnt/.
        # This is easier than trying to follow the dependencies to extract
        # js files like mootools. We just let the server do its job.
        self.run(wait=False)
        unifiedHtml = unifyhtml.unify('http://localhost:8080/tnt/', try_count=5)
        unifiedHtml = tmt.doTextSubstitution(unifiedHtml)

        unifiedHtmlFile = self.distUnifiedHtmlFile()
        with open(unifiedHtmlFile, 'w') as out:
            out.write(unifiedHtml)

        tmt.notifyDist(unifiedHtmlFile)


Project(tmt.projectName(), description="A Rubik's Cube timer.")
