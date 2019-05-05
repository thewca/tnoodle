TPR-4x4x4-Solver
================

4x4x4 Solver = Three-Phase-Reduction Solver + 3x3x3 Solver

# Usage:
 - sh make.sh -> threephase.jar
 - java -jar threephase.jar N -> solving N random cube with 40 random moves' scramble.

# Test (java -jar threephase.jar 100 / 2.2GHz):
 - Average solution length: 44.60 moves(face turn metric).
 - Average solving time: 300 ms.
 - Memory: 20M with generated tables and min2phase package, 100M without any table.
 - Length Distribution (2000 solves, average 44.626 moves):

 - 40	1
 - 41	19
 - 42	75
 - 43	232
 - 44	526
 - 45	672
 - 46	404
 - 47	69
 - 48	2

# Note:
 - At its first executing, about 10M's tables will be generated and written to disk. The generation spends several minutes and need at least 100M memory(4~5 times larger than execute it with generated tables), and it will speed up with multiple processors.

# Algorithm:
 - [Tsai's 8-step 4x4x4 algorithm](http://cubezzz.dyndns.org/drupal/?q=node/view/73#comment-2588)
 - The solver merges Tsai's step3 and step4 into one step and use [min2phase package](https://github.com/ChenShuang/min2phase) to replace Tsai's step5-8

# TODO:
 - Speeding up initialization.
 - Solution format.
 - Many bugs which might cause ArrayIndexOutOfBoundsException.

# License GPLv3

    Copyright (C) 2012  Shuang Chen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
