# TNoodle WCA Scrambler

Visit [/scramble](/scramble) to use the scrambler, or go to [/readme](/readme) to see the TNoodle readme.

## Overview

TNoodle is a Java project started by Jeremy Fleischman. It provides a single program to generate official scrambles for WCA competitions. It should be relatively easy to use:

1. Run the .jar file on your computer. It will open the page <http://localhost:8080/scramble> in your browser.
2. Enter the details for your competition (competition name, number of rounds for each event, details for each round). If you would like to password protect the file, enter a password.
3. Wait for the loading bar to finish and click the "Scramble!" button that appears. A `.zip` file will download in your browser.

NOTE: 4x4x4 scrambles may take up to 10 minutes to initialize and generate. If you are generating 4x4x4 scrambles, be patient while the loading bar may appear to be stuck.

Also note that tnoodle creates a `tnoodle_resources` folder with about 75MB of files (mostly cached tables for the 4x4x4 solver) in the same folder it is run. Keep this folder if want to generate more 4x4x4 scrambles more quickly in the future, but feel free to delete it if you need to reclaim disk space.

## Details

TNoodle implements the highest-quality scramble generation available at this time. Except for 5x5x5-7x7x7 and Megaminx, every puzzle is scrambler by generating a random permutation/state using Java's SecureRandom class and computing a scrambling algorithm for it.

### Random-State Scrambles

- The notion of "random state" is straightforward for 2x2x2-4x4x4, Pyraminx, and Clock: every possible state has equal weight.
- For Square-1, it is possible to define a "most reasonable" random-state distribution as the limiting distribution of performing random moves ("Markov random-state" scrambles). Note that the middle slice is also randomized.
- For 5x5x5-7x7x7, random-state scramblers are impractical, so we generate 60/80/100 random moves.
- For Megaminx, it is important to have *practical* scramblers, so we use Stefan Pochmann's suggestion that has been used by the WCA since 2007.

### Scramble Length

- Every generated scramble algorithm for 2x2x2 and Pyraminx has a minimum number of 11 moves (God's number for both puzzles). This makes it harder to distinguish scrambles by scramble length (something that has been a historical issue).

### Scramble Filtering

- Scrambles are *not* filtered in any way by TNoodle. For example, random-state scramblers do not single out any states as "easier", "harder", or "more fair".

## Credits

TNoodle builds on the effort of many people.

- The TNoodle scrambler supersedes and builds on the previous WCA scramblers, written by Jaap Scherphuis, Syoji Takamatsu, Lucas Garron, Michael Gottlieb, Tom van der Zanden, Conrad Rider, Clément Gallet, and Herbert Kociemba.
- The design decisions are based on numerous discussions by cubers on the online forums.
- TNoodle uses code developed or adapted by Jeremy Fleischman, Clément Gallet, Shuang Chen, Bruce Norskog, and Lucas Garron.
