#!/usr/bin/python

import os
from os.path import split, abspath, relpath, exists
import shutil

def rmtree(dir):
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

def setupGitHooksIfNotSetup():
  # Check that the git hooks folder is all set up, and set it up if it isn't
  gitHooksFolder = '.git/hooks'

  customHooksFolder = 'tools/git-hooks'
  assert exists(customHooksFolder)
  target = relpath(abspath(customHooksFolder), split(gitHooksFolder)[0])
  createSymlinkIfNotExistsOrStale(target, gitHooksFolder)

if __name__ == "__main__":
  setupGitHooksIfNotSetup()
