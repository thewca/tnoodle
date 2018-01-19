Note: This is the documentation for USING tnoodle in JavaScript. This is NOT on EDITING tnoodle
in JavaScript.
If you want a working example of tnoodle, then you can open demo.html (in the current directory) 
in your browser, and you should see a couple of cube icons. When you click one of them, it 
generates a scramble for that cube.

The tnoodle.js file in the root directory (1 level above this) is what you need. So, the function
for generating scrambles can be called like this:

function puzzlesLoaded(puzzles) {
  puzzles[333].generateScramble()
          ^  This is where you should put the cube type.
}

Cube Types
333     => 3x3x3
333ni   => I think its 3x3x3 blindfolded, because it is generating wide moves. But I'm not sure!
333fm   => 3x3x3 Fewest Moves Challenge
444     => 4x4x4
444fast => 4x4x4 The other one gets a proper scramble, and takes some time to do so, so this one 
           is like a fast one which generates it quickly.
444ni   => I think its 4x4x4 blindfolded, but I really don't know!
555     => 5x5x5
666     => 6x6x6
777     => 7x7x7
clock   => Rubik's clock
minx    => Megaminx (I think)
pyram   => Pyraminx
skewb   => Skewb
sq1     => Square 1
sq1fast => Square 1 The other one gets a proper scramble, and takes some time to do so, so this one 
           is like a fast one which generates it quickly.
