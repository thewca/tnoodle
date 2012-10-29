#!/usr/bin/env python

import subprocess
import sys

PREFIX_REMOTE = {
	'twisty.js/twisty.js': 'git@github.com:jfly/twisty.js.git',
	'git-tools': 'git@github.com:jfly/git-tools.git',
	'sq12phase/src/cs/sq12phase': 'git@github.com:cubing/sq12phase.git',
	'scrambler-interface/WebContent/scrambler-interface': 'git@github.com:cubing/scrambler-interface.git',
	'min2phase/src/cs/min2phase': 'git@github.com:cubing/min2phase.git',
	'threephase/src/cs/threephase': 'git@github.com:cubing/TPR-4x4x4-Solver.git',
	'cubecomps/WebContent/cubecomps': 'git@github.com:cubing/cubecomps.com.git',
}

def git(cmds, options=None, showStatus=True, assertSuccess=True):
    args = ['git'] + cmds
    if options:
        args += [ ( '--%s=%s' % (key, val) if val else '--%s' % key ) for key, val in options.iteritems() ]
    print "Running: %s" % " ".join(args)
    p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout = ''
    stderr = ''
    while p.poll() is None:
            newStdout = p.stdout.read()
            if newStdout:
                    stdout += newStdout
                    if showStatus:
                            print newStdout
            # TODO - i've noticed that the call to stderr.read() hangs, swapping the order seems to help...
            newStderr = p.stderr.read()
            if newStderr:
                    stderr += newStderr
                    if showStatus:
                            print newStderr
    if assertSuccess:
        assert p.returncode == 0
    return p.returncode, stdout, stderr

def setupSubtreeBranches():
    for prefix, remote in PREFIX_REMOTE.iteritems():
        assert remote.endswith('.git')
        splitName = remote.split('/')
        assert len(splitName) == 2
        remoteName = splitName[1][:-len('.git')]

        git(['stash'])
        git(['branch', '-D', remoteName], assertSuccess=False)
        options = { 'prefix': prefix, 'annotate': '(tnoodle)', 'branch': remoteName }
        git(['subtree', 'split'], options)

        git(['checkout', remoteName])
        git(['remote', 'add', remoteName, remote], assertSuccess=False)
        git(['fetch', remoteName])
        git(['branch', remoteName], { 'set-upstream-to': '%s/master' % (remoteName) })
        git(['log', '..@{u}'])
        git(['checkout', 'master'])

        git(['stash', 'pop'])

if __name__ == "__main__":
    setupSubtreeBranches()
