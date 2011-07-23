# twisty.js

A javascript library for puzzles.

Started by Lucas Garron, July 2011.


## Inspiration
- [Ryan Heise](http://www.ryanheise.com/)'s revolutionary [Rubik's Cube Simulator](http://www.ryanheise.com/cube/speed.html) with keyboard input.
- [Werner Randelshofer](http://randelshofer.ch/)'s highly configurable [virtual cubes](http://randelshofer.ch/rubik/index.html)
- [Josef Jelinek](http://rubikscube.info/)'s simple and configurable [AnimCube](http://software.rubikscube.info/AnimCube/) (with some credit to [Karl Hornell](http://www.javaonthebrain.com/java/rubik/) and [Lars Petrus](http://lar5.com/cube/)).


## Notes


## Bugs and Features
- Resize canvas on div resize.
- Always fit twisty fully inside canvas
- LxMxN cube dimensions


## WSOH Schedule

- 22:30 - Twisty abstraction & delegation
- 23:30 - Cube structure
- 0:30 - Basic Animation Support
- 3:00 - Animation Code
- 4:30 - Keybindings


## Puzzle/State representation

- Current state (array of (piece + matrix))
- tempo function for each possible ongoing move
- Queueing moves
- Move pause
- Speed up if queue grows (inc. current move straight into next)
- Simultaneous moves
- Metric support?
- Algorithm objects?


## Puzzle description contract

- parameters per puzzle
- key handlers
  - variable states? (level of slice for big cubes [visual indicator of those?])
- initmove/revmove stuff?
- visual options (stickers + cubies, stickers only, etc.)


##Features / Settings (dynamicable?)

- full color/sticker settings (color lists for faces?), image maps
- custom coloring for e.g. different cube steps (OLL, 6x6x6 centers)
- transparency (param)
- bgcolor (transparent default) - is this really necessary?
- BLD mode
- Each puzzle: Interface for random scramble?
- animation/transition curve
- Config file (thus, standard specs)
- Callback interface
- notations?
- See [CubeTwister](http://randelshofer.ch/cubetwister/doc/cubetwister-complete-guide.html)
- Playback interface (one level abstracted, but still on same div?)
- camera settings (location, scale?, orthoQ, etc.)
- rear view
- Mouse support
- Cube panning/rotation
- static rendering support (for [WCA scramblers](http://www.worldcubeassociation.org/regulations/#scrambling), etc.)
- debug mode
- bandaging?


## Puzzles

- Investigate [UMC](http://www.ultimatemagiccube.com/)
- NxNxN
- KxLxM
- 15 Puzzle
- Pyraminx (any order + edge twisting?)
- Megaminx (any order)
- Square-1 (any number of layers?)
- Clock (NxNxN?)
- Octahedron?
- Magic?
- Sticker-sliding cube
- pyra crystal
- Skewb (any order)
- Square-2
- UFO
- Heli cube
- Anything on gelatinbrain / Jaap's page?