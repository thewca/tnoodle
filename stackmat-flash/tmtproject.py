import tmt
import subprocess
from os.path import join, exists
import shutil
import sys
import time

class Project(tmt.EclipseProject):
    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)

        self.APPLET_FILENAME = join(self.name, 'StackApplet.swf')
        try:
            retVal, stdOut, stdErr = tmt.runCmd([ 'mxmlc', '--version' ])
        except OSError:
            retVal = 1

        self.mxmlcInstalled = (retVal == 0)

    def checkoutSwf(self, bin):
        # If mxmlc is not installed, then we restore our applet from the repository,
        # because we can't recreate it.
        retVal, stdout, stderr = tmt.runCmd([ 'git', 'checkout', self.APPLET_FILENAME ], showStatus=True)
        assert retVal == 0

    def innerCompile(self, src, tempBin, bin):
        if src == self.src:
            if not self.mxmlcInstalled:
                # Couldn't find mxmlc with which to compile,
                # Note that there's a symlink from the src_tnoodle_resources
                # directory to the generated stackmat-flash/bin/StackApplet.swf.
                # This allows people without the flex sdk installed to work on tnoodle.
                # Fortunately, we don't follow symlinks when evaluating whether
                # a project needs to be rebuilt, so this symlink hack doesn't
                # force infinite rebuilds if mxmlc is installed.
                if not tmt.args.skip_noflex_warning:
                    realOutSwf = self.APPLET_FILENAME
                    print("""\n\nWARNING: It appears you do not have the flex sdk installed (specifically the mxmlc binary), which is needed to build stackmat-flash. I'm going to go ahead and use the version of %s from the git repository.""" % ( realOutSwf ))
                self.checkoutSwf(tempBin)
            else:
                # Wowow, you've gotta love it when you have such great tools
                asFile = join(src, 'StackApplet.as')
                if exists(asFile):
                    assert self.mxmlcInstalled
                    outSwf = self.APPLET_FILENAME
                    retVal, stdout, stderr = tmt.runCmd([ 'mxmlc', '-benchmark=True', '-creator=tnoodle', '-static-link-runtime-shared-libraries=true', '-output=%s' % outSwf, asFile ], showStatus=True)
                    assert retVal == 0

                    # Yikes. mxmlc doesn't seem to have any command line args to treat
                    # warnings as errors. Look what they've made me do!
                    assert len(stderr) == 0

            # Neither of the two operations above update the timestamp of a file in self.bin.
            # We explicitly update timestamp of a file in self.bin so there aren't any issues where we try
            # to recompile this project when we don't need to.
            f = open(join(tempBin, ".timestamp"), 'w')
            f.write("%s" % time.time())

Project(tmt.projectName(), description="A flash applet that can interpret the sound of a stackmat plugged into your computer.")
