#!/usr/bin/env python

gittools = __import__("git-tools")
gittools.cdIntoScriptDir()
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--inject')
args = parser.parse_args()

startWcaCommand = 'java -jar wca/dist/TNoodle.jar -n -p 8080'
if args.inject:
   startWcaCommand += ' --inject %s' % args.inject
projects = [
   gittools.GitSensitiveProject(name='wca',
      compileCommand='./tmt make dist -p wca',
      runCommand=startWcaCommand),
   gittools.GitSensitiveProject(name='noderacer',
      compileCommand='./tmt make -p noderacer',
      runCommand='./tmt make run -p noderacer')
]
gittools.startGitSensitiveScreen("tnoodle", projects)
