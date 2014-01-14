# Terribly useful debugging tweaks
import os
import sys
import pdb
import cgitb
import traceback

if sys.executable is None:
    # If sys.executable is None, it will cause an exception inside of
    # cgitb at this line:
    #  pyver = 'Python ' + sys.version.split()[0] + ': ' + sys.executable
    sys.executable = "Jython?"

try:
    from java.lang import Throwable
    from net.gnehzr.tnoodle.utils import TNoodleLogging
    TNoodleLogging.initializeLogging()
except ImportError:
    Throwable = None
    # Do nothing, we're just running in pure python
    pass

def excepthook(etype, value, tb):
    # Added this line for debugging why https://travis-ci.org/cubing/tnoodle/builds/15966902
    # hit pdb instead of just printing a traceback and exiting.
    # Once that problem is solved, we can delete this code.
    print("Hit excepthook! stderr.isatty: %s stdin.isatty: %s stdout.isatty: %s" % (sys.stderr.isatty(), sys.stdin.isatty(), sys.stdout.isatty()))

    # Workaround for isatty weirdness mentioned above.
    isTravisCiBuild = os.environ.get('TRAVIS_BRANCH', None)
    if not sys.stdout.isatty() or not sys.stderr.isatty() or not sys.stdin.isatty() or isTravisCiBuild:
        # stdin, stdout, or stderr is redirected, so don't enter pdb
        sys.stderr.write(cgitb.text((etype, value, tb)))
    else:
        if tb:
            traceback.print_exception(etype, value, tb)
        if Throwable and issubclass(etype, Throwable):
            value.printStackTrace()
        pdb.post_mortem(tb)
sys.excepthook = excepthook
