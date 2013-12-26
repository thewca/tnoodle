import tmt
import sys
from os.path import join, exists, abspath, dirname, isdir
import os
import zipfile
import base64
import textwrap
import json

DESCRIPTION = "A Java scrambling suite. Java applications can use this project as a library. A perfect example of this is the webscrambles package."

class Project(tmt.EclipseProject):
    def __init__(self):
        tmt.EclipseProject.__init__(
            self,
            tmt.projectName(),
            description=DESCRIPTION,
            main='net.gnehzr.tnoodle.scrambles.Main',
            tests=['net.gnehzr.tnoodle.test.ScrambleTest'])

    def configure(self):
        tmt.EclipseProject.configure(self)
        self.nonJavaSrcDeps |= tmt.glob(self.src, '.*png$', relativeTo=self.src)
        self.nonJavaSrcDeps.add('puzzle/puzzles')
        self.javaFilesToIgnore = tmt.glob(join(self.src, 'net/gnehzr/tnoodle/js/'), r'.*\.java')
        self.javaFilesToIgnore |= tmt.glob(join(self.src, 'net/gnehzr/tnoodle/jre/'), r'.*\.java')

Project()
