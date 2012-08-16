import tmt
import subprocess
from os.path import join, exists

class Project(tmt.EclipseProject):

	def configure(self):
		tmt.EclipseProject.configure(self)
		self.main = "cs.threephase.Main"
		self.threephase_tables = 'tpr_tables'
		self.CACHED_THREEPHASE_TABLES = join(self.name, 'CACHED_THREEPHASE_TABLES_DELETE_TO_RECREATE')

Project(tmt.projectName(), description="A copy of Chen Shuang's 4x4 scrambler.")
