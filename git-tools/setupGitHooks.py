#!/usr/bin/env python3

import os
import subprocess
from os.path import split, abspath, relpath, exists
import shutil
import setupWindowsCygwinSymlinking
from setupWindowsCygwinSymlinking import createSymlinkIfNotExistsOrStale, rmtree

def setupGitHooksIfNotSetup():
  # Check that the git hooks folder is all set up, and set it up if it isn't

  git_dir = subprocess.check_output(["git", "rev-parse", "--git-dir"]).decode("UTF-8").strip()
  gitHooksFolder = git_dir + '/hooks'

  customHooksFolder = 'git-tools/git-hooks'
  assert exists(customHooksFolder)
  target = relpath(abspath(customHooksFolder), split(gitHooksFolder)[0])
  createSymlinkIfNotExistsOrStale(target, gitHooksFolder)

if __name__ == "__main__":
  setupGitHooksIfNotSetup()
