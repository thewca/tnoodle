#!/usr/bin/python

import os
from os.path import split, abspath, relpath, exists
import shutil
import setupWindowsCygwinSymlinking
from setupWindowsCygwinSymlinking import createSymlinkIfNotExistsOrStale, rmtree

def setupGitHooksIfNotSetup():
  # Check that the git hooks folder is all set up, and set it up if it isn't
  gitHooksFolder = '.git/hooks'

  customHooksFolder = 'git-tools/git-hooks'
  assert exists(customHooksFolder)
  target = relpath(abspath(customHooksFolder), split(gitHooksFolder)[0])
  createSymlinkIfNotExistsOrStale(target, gitHooksFolder)

if __name__ == "__main__":
  setupGitHooksIfNotSetup()
