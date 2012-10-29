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

def git(cmds, options=None, showStatus=True,assertSuccess=True):
    args = ['git'] + cmds
    if options:
        args += [ ( '--%s=%s' % (key, val) if val else '--%s' % key ) for key, val in options.iteritems() ]
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

def findModifiedSubtrees():
    assertNoUntrackedFiles()
    for prefix, remote in PREFIX_REMOTE.iteritems():
        assert remote.endswith('.git')
        splitName = remote.split('/')
        assert len(splitName) == 2
        remoteName = splitName[1][:-len('.git')]

        options = { 'prefix': prefix, 'annotate': '(tnoodle)', 'branch': remoteName }
        git(['subtree', 'split'], options)

        git(['checkout', remoteName])
        git(['clean', '-dfx'])
        git(['remote', 'add', remoteName, remote])
        remoteBranch = '%s/master' % (remoteName)
        git(['fetch', remoteBranch])
        git(['branch', remoteName], { 'set-upstream-to': remoteBranch })
        git(['log', '..@{u}'])
        git(['checkout', 'master'])
    """
    git subtree split --prefix=twisty.js/twisty.js --annotate="(tnoodle)" --branch=twisty.js
    git checkout twisty.js
    git clean -dfx # maybe not needed, or only needed once?
    git remote add twisty.js git@github.com:cubing/twisty.js.git
    git fetch twisty.js/master
    git branch --set-upstream-to=twisty.js/master twisty.js
    git log ..@{u}

git push twisty.js twisty.js:master
    """

def assertNoUntrackedFiles():
    retVal, stdout, stderr = git(['ls-files', '--other', '--exclude-standard'])
    assert retVal == 0
    if stdout != '':
        sys.stderr.write("Untracked files found, please commit them:\n")
        sys.stderr.write(stdout)
        sys.exit(1)


def assertNoModifiedFiles():
    retVal, stdout, stderr = git(['diff', '--name-only'])
    if out != '':
        sys.stderr.write("Edited files found, please commit them:\n")
        sys.stderr.write(out)
        sys.exit(1)

if __name__ == "__main__":
    findModifiedSubtrees()
