#!/usr/bin/python

import os
import re
import sys
import subprocess
import xml.etree.ElementTree as ET

jsLintJar = 'git-tools/lib/jslint4java-1.4.6.jar'
checkstyleJar = 'git-tools/lib/checkstyle-5.6-all.jar'
checkstyleStyle = 'git-tools/lib/tnoodle-java.xml'

# These third party directories are just littered with crap that I don't want to deal with
lintIgnoredDirectories = [
   'git-tools/requests/',
   'winstone/src/winstone/',
   'winstone/src/javax/',
   'min2phase/src/cs/min2phase/',
   'threephase/src/cs/threephase/',
]

JSLINT_IGNORED_ERRORS = {
  # html/css errors
  'type is unnecessary.',
  "Unexpected token 'ew-resize'.",
  "Unrecognized style attribute 'border-bottom-right-radius'.",
  "Unrecognized style attribute 'border-bottom-left-radius'.",
  "Unrecognized style attribute 'border-radius'.",
  "Unrecognized style attribute 'box-shadow'.",
  "Unrecognized style attribute 'pointer-events'.",
  "Unexpected '-'.",
  "Expected ':' and instead saw ','.",
  "Expected ':' and instead saw 'px'.",
  "Expected a non-standard style attribute and instead saw '1'.",
  "Expected ';' and instead saw ','.",
  "Bad input type.",

  # javascript errors
  "is better written in dot notation",
  "A constructor name should start with an uppercase letter.",
  "All 'debugger' statements should be removed.",
  'Unnecessary "use strict".',
  "Empty block.",
}

NO_LINT_KEYWORD = 'BLW-DUCPHAM'

UNCOMMITABLE_PHRASES = {
    '<'+'<'+'<',
    '\t'
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
    for i, f in enumerate(files):
        print "\r%s/%s %.2f%%" % ( i+1, len(files), 100.0*(i+1)/len(files) ),
        sys.stdout.flush()
        if not os.path.exists(f):
            # This file must have been deleted as part of this commit.
            continue
        if os.path.isdir(f):
            continue
        if is_binary(f):
            continue
        elif os.path.islink(f):
            continue
        fileName, ext = os.path.splitext(f)
        if ext == ".sfd":
            continue

        lines = file(f).readlines()
        for lineNumber, line in enumerate(lines):
            for uncommitablePhrase in UNCOMMITABLE_PHRASES:
                error = None
                if uncommitablePhrase in line:
                    error = "Illegal characters"
                    error = "%s:%s:%s:%s" % ( f, lineNumber+1, error, line )
                    failures.append(error)
        noLint = False if ( len(lines) == 0 ) else ( NO_LINT_KEYWORD in lines[0] )
        if any(f.startswith(prefix) for prefix in lintIgnoredDirectories):
            noLint = True
        if noLint:
            continue

        for lineNumber, line in enumerate(lines):
            if re.match(r"^.*\S[ \t]+$", line):
                error = "Trailing whitespace"
                error = "%s:%s:%s:%s" % ( f, lineNumber+1, error, line )
                failures.append(error)

        if ext == '.js' or ext == '.html':
            subprocess.check_call(['java', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            argv = [ 'java', '-jar', jsLintJar, f ]
            p = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = p.communicate()
            # Note that we don't check the returncode of p, because jslint returns a nonzero
            # error code when jslinting fails, and we want to ignore whatever errors are in
            # JSLINT_IGNORED_ERRORS.
            failedJsLint = False
            for line in stdout.split('\n'):
                parsedError = line.split(":", 4)
                if len(parsedError) != 5:
                    if line != '':
                        assert False, line + " doesn't contain expected number of :'s"
                    continue
                _, fileName, lineNumber, col, error = parsedError
                lineNumber = int(lineNumber)
                if any(ignored in error for ignored in JSLINT_IGNORED_ERRORS):
                    pass
                else:
                    error = "%s:%s:%s:%s" % ( f, lineNumber, error, lines[lineNumber-1] )
                    failures.append(error)
            for lineNumber, line in enumerate(lines):
                if "console.log" in line:
                    failures.append("%s:%s:Call to console.log.:%s" % (
                        f, lineNumber+1, line ))
        elif ext == '.java':
            try:
                subprocess.check_output(['java', '-jar', checkstyleJar, '-f', 'xml', '-c', checkstyleStyle, f ], stderr=None)
            except subprocess.CalledProcessError as err:
                tree = ET.XML(err.output)
                errors = tree.find('file').findall('error')
                for error in errors:
                    lineNumber = int(error.get('line'))
                    message = error.get('message')
                    # TODO - figure out how to configure label indentation rules in checkstyle
                    if 'label child at indentation level' not in message:
                        error = "%s:%s:%s:%s" % ( f, lineNumber, error.get('message'), lines[lineNumber-1])
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
        print "*********%s error(s) found**********" % len(failures)
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
