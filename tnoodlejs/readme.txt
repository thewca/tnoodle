Note: This is the documentation for USING tnoodle in JavaScript. This is NOT on EDITING tnoodle
in JavaScript.
If you want a working example of tnoodle, then you can open demo.html (in the current directory)
in your browser, and you should see a couple of puzzle icons. When you click one of them, it
generates a scramble for that puzzle.

The tnoodle.js file in the root directory (1 level above this) is what you need. So, the function
for generating scrambles can be called like this (you can just copy paste this if you want!):

function puzzlesLoaded(puzzles) {
  puzzles['333'].generateScramble()
  //        ^  This is where you should put the puzzle type.
}

Most used puzzle types
333     => 3x3x3
444     => 4x4x4
222     => 2x2x2
pyram   => Pyraminx

For all the available puzzles, and a more detailed explanation, please visit
https://github.com/thewca/tnoodle/blob/master/scrambles/src/puzzle/puzzles.
