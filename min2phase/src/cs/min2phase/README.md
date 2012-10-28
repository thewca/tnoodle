# min2phase
- Rubik's Cube solver or scrambler.

# two-phase algorithm
- See Kociemba's [page](http://kociemba.org/cube.htm)

# Feature
- Memory: ~1M with twist-flip-pruning table, ~0.5M without twist-flip-pruning table. See [Tools.java line 13](https://github.com/ChenShuang/min2phase/blob/master/Tools.java#L13)
- Average Solving Time @21 moves: ~10ms without T-F-P table, ~7ms with T-F-P table.
- Initialization Time: ~160ms without T-F-P table, ~240ms with T-F-P table.

# File Description
- Tools.java Many  useful functions
- Util.java  Definitions and some math tools.
- CubieCube.java  CubieCube, see kociemba's [page](http://kociemba.org/math/cubielevel.htm).
- CoordCube.java  Only for generating tables.
- Search.java  Main.
- MainProgram.java  GUI version.
- pruningValue.txt  For checking whether the pruning table is generated correctly.

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
