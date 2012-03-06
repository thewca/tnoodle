import tmt

import sys
import os.path

class Project(tmt.EclipseProject):
	def configure(self):
		tmt.EclipseProject.configure(self)
		tmt.Server.addPlugin(self)
		self.nonJavaSrcDeps += [ 'tnoodleServerHandler/stackmat-flash/' ]

		try:
			retVal, stdOut, stdErr = tmt.runCmd([ 'mxmlc', '--version' ])
		except OSError:
			retVal = 1

		self.mxmlcInstalled = (retVal == 0)

	def _compile(self, src, bin):
		if src == self.src:
			if not self.mxmlcInstalled:
				# Couldn't find mxmlc with which to compile,
				# Note that there's a symlink from the src_tnoodle_resources
				# directory to the generated stackmat-flash/bin/StackApplet.swf.
				# This allows people without the flex sdk installed to work on tnoodle.
				# Fortunately, we don't follow symlinks when evaluating whether
				# a project needs to be rebuilt, so this symlink hack doesn't
				# force infinite rebuilds if mxmlc is installed.
				if tmt.args.skip_noflex_warning:
					return
				realOutSwf = join(bin, 'StackApplet.swf')
				print """\n\nIt appears you do not have the flex sdk installed (specifically the mxmlc binary), which is needed to build stackmat-flash. Perhaps a git checkout stackmat-flash/bin would get you running again. If you're well aware of this, and don't want to be bothered about this again, try passing --skip-noflex-warning to tmt make."""
				if not os.path.exists(realOutSwf):
					print "Since %s doesn't exist, we cannot proceed." % realOutSwf
					sys.exit(1)
				print "%s exists, but appears to be stale. I'm going to go ahead and use it anyways." % realOutSwf
				print "Press any key to continue...",
				sys.stdin.readline()
				return
		
		tmt.EclipseProject._compile(self, src, bin)

	def innerCompile(self, src, tempBin, bin):
		# Wowow, you've gotta love it when you have such great tools
		asFile = join(src, 'StackApplet.as')
		if os.path.exists(asFile):
			assert self.mxmlcInstalled
			outSwf = join(tempBin, 'StackApplet.swf')
			retVal, stdout, stderr = tmt.runCmd([ 'mxmlc', '-benchmark=True', '-creator=tnoodle', '-static-link-runtime-shared-libraries=true', '-output=%s' % outSwf, asFile ], showStatus=True)
			assert retVal == 0

			# Yikes. mxmlc doesn't seem to have any command line args to treat
			# warnings as erros. Look what they've made me do!
			assert len(stderr) == 0

	def clean(self):
		if self.mxmlcInstalled:
			# If mxmlc is installed, then we are fine with deleting the bin directory,
			# because we can recreate it.
			tmt.EclipseProject.clean(self)
			return

		# Gah, this is copied from tmt.EclipseProject. Kill me now
		print 'Cleaning: %s' % self.name
		if exists(self.distDir):
			assert os.path.isdir(self.distDir)
			tmt.rmtree(self.distDir)
		tempBin = join(self.name, '.bin')
		if os.path.isdir(tempBin):
			tmt.rmtree(tempBin)

Project(tmt.projectName(), description="A flash applet that can interpret the sound of a stackmat plugged into your computer.")
