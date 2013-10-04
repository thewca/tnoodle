import tmt
import unifyhtml
import os
from os.path import join

class Project(tmt.EclipseProject):
    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)

        self.unifiedHtmlFiles = {
            join(self.distDir, "tnt.html"): "http://localhost:8080/tnt/",
            join(self.distDir, "bld.html"): "http://localhost:8080/tnt/bld.html"
        }

    def dist(self, noRemake=False, implementationTitle=None):
        tmt.EclipseProject.dist(self, noRemake=noRemake, implementationTitle=implementationTitle)

        # Build standalone html files
        #  - Start a tnt server in the background.
        #  - Then run unifyhtml.unify on everything in self.unifiedHtmlFiles
        # This is easier than trying to follow the dependencies to extract
        # js files like mootools. We just let the server do its job.
        self.run(wait=False)

        for fileName, url in self.unifiedHtmlFiles.items():
            unifiedHtml = unifyhtml.unify(url, try_count=5)
            unifiedHtml = tmt.doTextSubstitution(unifiedHtml)

            with open(fileName, 'w') as out:
                out.write(unifiedHtml)

            tmt.notifyDist(fileName)

Project(tmt.projectName(), description="A Rubik's Cube timer.")
