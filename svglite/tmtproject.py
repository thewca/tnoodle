import tmt

DESCRIPTION = "A dead simple svg generation written in pure Java, with no dependencies. This scode should run on both desktop Java, Android, and should compile to Javascript with GWT."

tmt.EclipseProject(tmt.projectName(), description=DESCRIPTION)
