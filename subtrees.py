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
    retVal = subprocess.call(args)
    if assertSuccess:
       assert retVal == 0

def setupSubtreeBranches():
    for prefix, remote in PREFIX_REMOTE.iteritems():
        assert remote.endswith('.git')
        splitName = remote.split('/')
        assert len(splitName) == 2
        remoteName = splitName[1][:-len('.git')]

        git(['stash'])
        git(['branch', '-D', remoteName], assertSuccess=False)
        options = { 'prefix': prefix, 'annotate': '(tnoodle) ', 'branch': remoteName }
        git(['subtree', 'split'], options)

        git(['checkout', remoteName])
        git(['remote', 'add', remoteName, remote], assertSuccess=False)
        git(['fetch', remoteName])
        git(['branch', remoteName], { 'set-upstream-to': '%s/master' % (remoteName) })
        git(['log', '..@{u}'])
        git(['checkout', 'master'])

        git(['stash', 'pop'], assertSuccess=False)

def pullAllSubtrees():
    for prefix, remote in PREFIX_REMOTE.iteritems():
        options = { 'prefix': prefix }
        git(['subtree', 'pull', remote], options)

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Dealing with subtrees')
    parser.add_argument('cmd', choices=('split', 'pull'))

    args = parser.parse_args()
    if args.cmd == 'split':
        setupSubtreeBranches()
    elif args.cmd == 'pull':
        pullAllSubtrees()
    else:
        assert False

if __name__ == "__main__":
    main()
