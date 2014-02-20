import tmt
import sys
from os.path import join, exists, abspath, dirname, isdir
import os
import zipfile
import base64
import textwrap
import json

DESCRIPTION = "Compiles the scramble java code to javascript using GWT."

GWT_MODULE = 'scrambles'

NO_GWT_ENV_VAR = "TNOODLE_NO_GWT"
INSTALL_GWT_ENV_VAR = "TNOODLE_INSTALL_GWT"

def yesNoPrompt(promptStr):
    inStr = None
    while inStr not in [ 'y', 'n' ]:
        inStr = input("%s [y/n] " % promptStr)

    return inStr == 'y'

# Copied from http://blog.radevic.com/2012/07/python-download-url-to-file-with.html
def dl(url):
    import sys
    import urllib.request, urllib.error, urllib.parse
    import tempfile

    tempDir = tempfile.mkdtemp()
    file_name = join(tempDir, url.split('/')[-1])
    u = urllib.request.urlopen(url)
    f = open(file_name, 'wb')
    meta = u.info()
    file_size = int(meta.get("Content-Length"))
    print(("Downloading: {0} Bytes: {1} to {2}".format(url, file_size, file_name)))

    file_size_dl = 0
    block_sz = 8192
    while True:
        buffer = u.read(block_sz)
        if not buffer:
            break

        file_size_dl += len(buffer)
        f.write(buffer)
        p = float(file_size_dl) / file_size
        status = r"{0}  [{1:.2%}]".format(file_size_dl, p)
        status = status + chr(8)*(len(status)+1)
        sys.stdout.write(status)

    f.close()
    return file_name

class Project(tmt.EclipseProject):
    def __init__(self):
        tmt.EclipseProject.__init__(
            self,
            tmt.projectName(),
            description=DESCRIPTION)

    def configure(self):
        tmt.EclipseProject.configure(self)
        tmt.WinstoneServer.addPlugin(self)
        self.scramblesProject = tmt.TmtProject.projects['scrambles']
        self.postProcessedDir = join(self.scramblesProject.name, 'postprocessed')

    def innerCompile(self, src, tempBin, bin):
        if src != self.src:
            return

        skipGwt = os.environ.get(NO_GWT_ENV_VAR)
        if skipGwt:
            # We don't want to skip gwt-ing when we're releasing
            assert not tmt.releasing
            assert not os.environ.get(INSTALL_GWT_ENV_VAR)
            print("%s set, so not compiling with GWT" % NO_GWT_ENV_VAR)
            return

        # I hope people see this and don't just hate working on tnoodle.
        print("*" * 64)
        print("\n".join(textwrap.wrap("Compiling java -> javascript using GWT. This is important to test, as it can break easily, but it's also very slow, and annoying for scrambler development. Set the %s environment variable to skip this." % NO_GWT_ENV_VAR, width=64)))
        print("*" * 64)
        gwtDir = abspath(join(self.name, 'gwt-2.5.1'))
        if not exists(gwtDir):
            print("Could not find GWT at %s" % gwtDir)
            gwtUrl = "https://developers.google.com/web-toolkit/download"
            print("You could visit %s and install GWT yourself (be sure to set up a symlink from %s to wherever you installed gwt." % ( gwtUrl, gwtDir ))
            if os.environ.get(INSTALL_GWT_ENV_VAR) or yesNoPrompt("Would you like me to download GWT and extract it to %s for you?" % gwtDir):
                gwtZipUrl = "http://google-web-toolkit.googlecode.com/files/gwt-2.5.1.zip"
                dledZipFile = dl(gwtZipUrl)
                gwtZip = zipfile.ZipFile(dledZipFile)
                gwtZip.extractall(path=dirname(gwtDir))
                assert isdir(gwtDir)
            else:
                print("Please set up GWT and try again")
                sys.exit(1)


        entities = self.getClasspathEntities(includeCompileTimeOnlyDependencies=True, includeSrc=True)
        entities.add(join(gwtDir, "*"))
        # convert to a list, because order matters
        entities = list(entities)
        entities.insert(0, self.postProcessedDir)
        classpath = self.toClasspath(entities)

        resources = {}
        scramblesNonJavaSrcDeps = self.scramblesProject.nonJavaSrcDeps
        for filename in scramblesNonJavaSrcDeps:
            with open(join(self.scramblesProject.src, filename), 'rb') as f:
                data = f.read()
                data64 = base64.b64encode(data).decode()
                resources[filename] = data64
        javaResources = ""
        for filename, data64 in resources.items():
            javaResources += 'resources.put("%s", "%s");\n' % ( filename, data64 )
        puzzles = open(join(self.scramblesProject.src, 'puzzle', 'puzzles')).read()
        puzzles = puzzles.replace("\n", "\\n")
        defines = {
            '%%PUZZLES%%': puzzles,
            '%%VERSION%%': tmt.VERSION,
            '//%%RESOURCES%%': javaResources
        }
        javaFiles = tmt.glob(self.scramblesProject.src, r'.*\.java$')
        for f in javaFiles:
            with open(f) as opened:
                contents = opened.read()
            dirty = False
            for define, value in defines.items():
                if define in contents:
                    dirty = True
                    contents = contents.replace(define, value)
            if dirty:
                f = f.replace("/src/", "/postprocessed/", 1)
                if not isdir(dirname(f)):
                    os.makedirs(dirname(f))
                with open(f, 'w') as opened:
                    opened.write(contents)

        # TODO - add documentation target
        # # This seems to blow up with jdk7
        # javadoc -public -verbose -sourcepath src -classpath "$(CLASSPATH)" -d doc -docletpath $(GWT_EXPORTER_JAR) -doclet org.timepedia.exporter.doclet.JsDoclet $(GWT_PACKAGES_DOCUMENT)

        args = []
        args.append('-strict')
        war = join(self.name, 'war')
        if not isdir(war):
            os.mkdir(war)
        args += [ '-war', war ]

        # "-style PRETTY" makes the gwt code almost readable, but also more
        # than doubles the size of the resulting code.
        args += [ '-style', 'PRETTY' ]

        args.append(GWT_MODULE)

        retVal = tmt.java("com.google.gwt.dev.Compiler", classpath=classpath, args=args, maxMemory='512m')
        assert retVal == 0

        scramblejs = open(join(self.src, 'tnoodle.js')).read()
        tnoodlejs_nocache_js = open(join(war, 'tnoodlejs/tnoodlejs.nocache.js')).read()
        tnoodlejs_nocache_js = """function TNOODLEJS_GWT() {
%s
}
TNOODLEJS_GWT();""" % tnoodlejs_nocache_js
        scramblejs = scramblejs.replace('//%%tnoodlejs.nocache.js%%', tnoodlejs_nocache_js)
        with open(join(war, 'tnoodlejs/tnoodle.js'), 'w') as out:
            out.write(scramblejs)

    def clean(self):
        tmt.EclipseProject.clean(self)

        dirsToCleanup = []
        for d in [ 'war', 'doc' ]:
            dirsToCleanup.append(join(self.name, d))
        dirsToCleanup.append(self.postProcessedDir)

        dirsToCleanup.append('gwt-unitCache')

        for d in dirsToCleanup:
            if exists(d):
                assert isdir(d)
                tmt.rmtree(d)

Project()
