import sys
import re
import shutil
import subprocess
import os
from os.path import exists, isdir, split

def windowsOrCygwin():
        return sys.platform == 'win32' or sys.platform == 'cygwin'

if windowsOrCygwin():
        def windowsSymlink(src, linkName):
                parentDir, fileName = split(linkName)
                assert isdir(parentDir)
                src = src.replace('/', '\\')
                assert 0 == os.system("cmd /C \"cd %s && mklink /D %s %s\"" % ( parentDir, fileName, src ) )
        def islink(path):
                return readlink(path) != None
        def readlink(path):
                parentDir, fileName = split(path)
                parentDir = parentDir.replace("/", "\\")
                # We have to exlicitly call window's dir, to avoid calling
                # cygwin's.
                p = subprocess.Popen([ 'cmd', '/C', 'dir', parentDir ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                stdout, stderr = p.communicate()
                assert p.returncode == 0
                files = stdout.split('\n')
                symlinkRe = re.compile(r'.*SYMLINKD.*%s.*\[(.*)\].*' % fileName) # lol, this is crazy fragile
                for file in files:
                        match = symlinkRe.match(file)
                        if match:
                                return match.group(1).replace('\\', '/')
                return None
        oldUnlink = os.unlink
        def unlink(path):
                if islink(path):
                        # For some reason, Windows refuses to delete a symlink when using
                        # the hacked version of islink I've create above.
                        assert 0 == os.system('rmdir %s' % path)
                else:
                        oldUnlink(path)

        os.unlink = unlink
        os.symlink = windowsSymlink
        os.path.islink = islink
        os.readlink = readlink

def rmtree(dir):
        if os.path.isfile(dir):
                os.unlink(dir)
        # This method recursively deletes a directory, but doesn't follow any symlinks
        if not os.path.exists(dir) and not os.path.islink(dir):
                # If this path doesn't exist and is not a broken symlink,
                # then we're done!
                return
        def onerror(func, path, excinfo):
                if func == os.path.islink:
                        os.unlink(path)
                else:
                        raise excinfo[1]
        shutil.rmtree(dir, onerror=onerror)

def createSymlinkIfNotExistsOrStale(target, name):
        if ( not os.path.exists(name) or
                 not os.path.islink(name) or
                 not os.readlink(name) == target ):
                print "Setting up symlink %s -> %s" % ( name, target )
                rmtree(name)
                os.symlink(target, name)

