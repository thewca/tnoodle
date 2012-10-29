#!/usr/bin/python

import os
import sys
import subprocess

JSLINT_ENABLED = True
CHECK_ILLEGAL_CHAR = True

JSLINT_IGNORED_ERRORS = {
  # html/css errors
  'type is unnecessary.',
  "Unexpected token 'ew-resize'.",
  "Unrecognized style attribute 'border-bottom-right-radius'.",
  "Unrecognized style attribute 'border-bottom-left-radius'.",
  "Unrecognized style attribute 'border-radius'.",
  "Unrecognized style attribute 'box-shadow'.",
  "Bad input type.",

  # javascript errors
  "is better written in dot notation",
  "A constructor name should start with an uppercase letter.",
  "All 'debugger' statements should be removed.",
  'Unnecessary "use strict".',
  "Empty block.",
}

NO_JSLINT_KEYWORD = 'BLW-DUCPHAM'

UNCOMMITABLE_PHRASES = {
    '<'+'<'+'<'
}

# Stolen from http://stackoverflow.com/questions/898669/how-can-i-detect-if-a-file-is-binary-non-text-in-python
# This should jive with git's definition of binary.
def is_binary(filename):
    """Return true if the given filename is binary.
    @raise EnvironmentError: if the file does not exist or cannot be accessed.
    @attention: found @ http://bytes.com/topic/python/answers/21222-determine-file-type-binary-text on 6/08/2010
    @author: Trent Mick <TrentM@ActiveState.com>
    @author: Jorge Orpinel <jorge@orpinel.com>"""
    if os.path.islink(filename):
        return False
    fin = open(filename, 'rb')
    try:
        CHUNKSIZE = 1024
        while 1:
            chunk = fin.read(CHUNKSIZE)
            if '\0' in chunk: # found null byte
                return True
            if len(chunk) < CHUNKSIZE:
                break # done
    # A-wooo! Mira, python no necesita el "except:". Achis... Que listo es.
    finally:
        fin.close()

    return False

def gitFilesList(allFiles=False):
  lsFilesCmd = None
  if allFiles:
    # Check every file under version control.
    lsFilesCmd = "git ls-files"
  else:
    # Check the files that git believes have been edited.
    lsFilesCmd = "git diff --cached --name-only"
  files = os.popen(lsFilesCmd).read().split('\n')
  return files

def lint(files):
	failures = []
	for f in files:
		if not os.path.exists(f):
			# This file must have been deleted as part of this commit.
			continue
		if os.path.isdir(f):
			continue
		fileName, ext = os.path.splitext(f)

		if JSLINT_ENABLED:
			if ext == '.js' or ext == '.html':
				if NO_JSLINT_KEYWORD in file(f).readline():
					print "Not jslinting %s (because we found %s)" % (f, NO_JSLINT_KEYWORD)
				else:
					if os.path.isdir(f):
						continue
					print "jslinting %s" % f
					jsLintJar = 'git-tools/lib/jslint4java-1.4.6.jar'
					assert os.path.exists(jsLintJar)
					subprocess.check_call(['java', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
					argv = [ 'java', '-jar', jsLintJar, f ]
					p = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
					fileLines = file(f).read().split("\n")
					stdout, stderr = p.communicate()    
					# Note that we don't check the returncode of p, because jslint returns a nonzero
					# error code when jslinting fails, and we want to ignore whatever errors are in
					# JSLINT_IGNORED_ERRORS.
					failedJsLint = False
					for line in stdout.split('\n'):
						parsedError = line.split(":")
						if len(parsedError) != 5:
							if line != '':
								assert False, line + " doesn't contain expected number of :'s"
							continue
						_, fileName, lineNumber, col, error = parsedError
						lineNumber = int(lineNumber)
						if any(ignored in error for ignored in JSLINT_IGNORED_ERRORS):
							print "Ignoring error %s" % line
						else:
							error = "%s:%s:%s:%s" % ( f, lineNumber, error, fileLines[lineNumber-1] )
							failures.append(error)
					for lineNumber, line in enumerate(fileLines):
						if "console.log" in line:
							failures.append("%s:%s:Call to console.log.:%s" % (
								f, lineNumber+1, line ))
		
		if CHECK_ILLEGAL_CHAR:
			if is_binary(f):
				#print "Skipping binary file %s" % f
				pass
			elif os.path.islink(f):
				pass
			else:
				lines = file(f).read().split("\n")
				for lineNumber, line in enumerate(lines):
					for uncommitablePhrase in UNCOMMITABLE_PHRASES:
						if uncommitablePhrase in line:
							error = "%s:%s:Illegal character.:%s" % ( f, lineNumber+1, line )
							failures.append(error)
	return failures

def setupArgparser(parser):
  parser.add_argument(
    '--all', '-a',
    default=False,
    action='store_true',
    help='Lint all files, rather than just the ones git believes have been modified')
  parser.add_argument('files', nargs="*")

def desc():
    return "Run JSLint on some (or all) js and html files. Also checks " +\
            "for appearances of characters we don't allow in the repository"

def main(args):
  if args.files:
    files = args.files
    failed = False
    for f in files:
      if not os.path.exists(f):
        sys.stderr.write("Cannot find %s\n" % f)
        failed = True
    if failed:
        sys.exit(1)
  else:
    files = gitFilesList(args.all)
  failures = lint(files)
  if failures:
    print
    print "*********%s errors found**********" % len(failures)
    print
    sys.exit('\n'.join(failures))

if __name__ == "__main__":
  from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter
  parser = ArgumentParser(
      description=desc(),
      formatter_class=ArgumentDefaultsHelpFormatter)
  setupArgparser(parser)
  args = parser.parse_args()
  main(args)
