import tmt
import sys
from os.path import join, exists, abspath, dirname, isdir
import zipfile
import base64

DESCRIPTION = "A Java scrambling suite. Java applications can use this project as a library. A perfect example of this is the webscrambles package. Using GWT, the java code compiles to javascript (tnoodlejs)."

GWT_MODULE= 'scrambles'


def yesNoPrompt(promptStr):
    inStr = None
    while inStr not in [ 'y', 'n' ]:
        inStr = raw_input("%s [y/n] " % promptStr)

    return inStr == 'y'

# Copied from http://blog.radevic.com/2012/07/python-download-url-to-file-with.html
def dl(url):
    import sys
    import urllib2
    import tempfile

    tempDir = tempfile.mkdtemp()
    file_name = join(tempDir, url.split('/')[-1])
    u = urllib2.urlopen(url)
    f = open(file_name, 'wb')
    meta = u.info()
    file_size = int(meta.getheaders("Content-Length")[0])
    print("Downloading: {0} Bytes: {1} to {2}".format(url, file_size, file_name))

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
            description=DESCRIPTION,
            main='net.gnehzr.tnoodle.scrambles.Main',
            tests=['net.gnehzr.tnoodle.test.ScrambleTest'])

    def configure(self):
        tmt.EclipseProject.configure(self)
        self.nonJavaSrcDeps |= tmt.glob(self.src, '.*png$', relativeTo=self.src)
        self.nonJavaSrcDeps.add('puzzle/puzzles')
        self.javaFilesToIgnore = tmt.glob(join(self.src, 'net/gnehzr/tnoodle/js/'), r'.*\.java')
        self.javaFilesToIgnore |= tmt.glob(join(self.src, 'net/gnehzr/tnoodle/jre/'), r'.*\.java')

    def innerCompile(self, src, tempBin, bin):
        if src == self.src:
            gwtDir = abspath(join(self.name, 'gwt-2.5.1'))
            if not exists(gwtDir):
                print "Could not find GWT at %s" % gwtDir
                gwtUrl = "https://developers.google.com/web-toolkit/download"
                print "You could visit %s and install GWT yourself (be sure to set up a symlink from %s to wherever you installed gwt." % ( gwtUrl, gwtDir )
                if yesNoPrompt("Would you like me to download GWT and extract it to %s for you?" % gwtDir):
                    gwtZipUrl = "http://google-web-toolkit.googlecode.com/files/gwt-2.5.1.zip"
                    dledZipFile = dl(gwtZipUrl)
                    gwtZip = zipfile.ZipFile(dledZipFile)
                    gwtZip.extractall(path=dirname(gwtDir))
                    assert isdir(gwtDir)
                else:
                    print "Please set up GWT and try again"
                    sys.exit(1)


            entities = self.getClasspathEntities(includeCompileTimeOnlyDependencies=True, includeSrc=True)
            entities.add(join(gwtDir, "*"))
            entities.add(join('lib', 'lib-gwt-svg-0.5.7.jar'))
            entities.add(join('lib', 'gwt-awt-0.0.3-SNAPSHOT.jar'))
            # convert to a list, because order matters
            entities = list(entities)
            entities.insert(0, join(self.name, 'postprocessed'))
            classpath = self.toClasspath(entities)

            resources = {}
            for filename in self.nonJavaSrcDeps:
                with open(join(self.src, filename)) as f:
                    data = f.read()
                    data64 = base64.b64encode(data)
                    resources[filename] = data64
            javaResources = ""
            for filename, data64 in resources.iteritems():
                javaResources += 'resources.put("%s", "%s");\n' % ( filename, data64 )
            puzzles = open(join(src, 'puzzle', 'puzzles')).read()
            puzzles = puzzles.replace("\n", "\\n")
            defines = {
                '%%PUZZLES%%': puzzles,
                '%%VERSION%%': tmt.VERSION,
                '//%%RESOURCES%%': javaResources
            }
            javaFiles = tmt.glob(src, r'.*\.java$')
            for f in javaFiles:
                with open(f) as opened:
                    contents = opened.read()
                dirty = False
                for define, value in defines.iteritems():
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
            args += [ '-war', join(self.name, 'war') ]
            args += [ '-style', 'PRETTY' ]
            args.append(GWT_MODULE)

            retVal = tmt.java("com.google.gwt.dev.Compiler", classpath=classpath, args=args)
            assert retVal == 0

    def clean(self):
        tmt.EclipseProject.clean(self)

        dirsToCleanup = []
        for d in [ 'war', 'doc', 'postprocessed' ]:
            dirsToCleanup.append(join(self.name, d))

        dirsToCleanup.append('gwt-unitCache')

        for d in dirsToCleanup:
            if exists(d):
                assert isdir(d)
                tmt.rmtree(d)

Project()
