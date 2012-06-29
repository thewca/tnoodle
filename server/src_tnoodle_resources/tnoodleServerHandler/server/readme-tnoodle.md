# TNoodleServer #

An http server built to generate scrambles and images for twisty puzzles. Supports json, png, svg, pdf, and zip formats.  It is currently being used by the following programs.

* [TNT](/tnt/) - A new timer aiming to replace CCT.
* [WCA Scrambler](/scramble) - A WCA-style scrambler. See [its readme](/readme/scramble).
* [bld.js](/tnt/bld.html) - A bld cycle generator for Pochmann-style combine orient+permute methods.

Looking for something that's missing? Want to contribute? Check out the latest version of the code on [github](http://github.com/cubing/tnoodle)!

## API ##

Note: All pages that serve up JSON also support JSONP via a callback parameter. For simplicity of the documentation, that optional callback parameter has been omitted.

### puzzles/ ###

Simply returns a list of available puzzles in JSON format.

* [puzzles/](/puzzles/)

### scramble/[TITLE].[txt|json|pdf|zip]?[PARAMS] ###

PARAMS include "seed", "showIndices" and most importantly, an arbitrary number of PUZZLE_REQUEST's. Note that this means you can't have a round titled "seed" or "showIndices"!

PUZZLE_REQUEST's look like this:

	TITLE=PUZZLE*COUNT*COPIES*SCHEME

PUZZLE can be any scrambler from [puzzles/](/puzzles/).

COUNT can be an integer, or "fmc". "fmc" means generate one scramble, and is specially handled by the PDF generator. See [scramble/Big Competition.pdf?FMC Round 1=333*fmc](/scramble/Big Competition.pdf?FMC Round 1=333*fmc) for an example.

If SCHEME contains a comma, then it is assumed to be a comma separated list of COLORs. If it does not contain a comma, then each character is treated as a COLOR. COLORs must be specified in alphabetical order of the names of the puzzle's faces. To see the faces for a puzzle, visit [view/PUZZLE.json](/view/PUZZLE.json)

A COLOR either an HTML style hexadecimal color definition starting with #, such as #FFFFFF for white. If COLOR does not begin with #, then is must be one of the following color definitions:

* y, yellow
* b, blue
* r, red
* g, green
* o, orange
* p, purple
* 0, gray, grey

If SCHEME does not conform to the above definition, then the puzzle's default color scheme will be used.

Puzzle request titles must be unique.

* [scramble/.txt?=333](/scramble/.txt?=333) - A text file containing 1 3x3 scramble. Revisiting this url will generate different scrambles.
* [scramble/.txt?=333*12&seed=cubing](/scramble/.txt?=333*12&seed=cubing) - A text file with 12 3x3 scrambles generated from the seed "cubing". Revisiting this url will always generate the same 12 scrambles.
* [scramble/My Comp.pdf?3x3 Round 1=333*5](/scramble/My Comp.pdf?3x3 Round 1=333*5) - A single 3x3 sheet of 5 scrambles.
* [scramble/My Comp.pdf?3x3 Round 1=333\*5\*2](/scramble/My Comp.pdf?3x3 Round 1=333*5*2) - 2 identical copies of a 3x3 sheet of 5 scrambles. This will produce a 2 page PDF.
* [scramble/My Comp.pdf?3x3 Round 1=333\*5\*2&3x3 Round 2=333\*5](/scramble/My Comp.pdf?3x3 Round 1=333*5*2&3x3 Round 2=333*5) - 2 identical copies of a 3x3 sheet of 5 scrambles (titled "3x3 Round 1") 
followed by 1 page of 5 3x3 scrambles (titled "3x3 Round 2"). This will produce a 3 page PDF.
* [scramble/My Comp.zip?3x3 Round 1=333\*5\*2&3x3 Round 2=333\*5](/scramble/My Comp.zip?3x3 Round 1=333*5*2&3x3 Round 2=333*5) - This will produce a zip file containing 2 pdfs, one named "3x3 Round 1.pdf" and the other named "3x3 Round 2.pdf". Note that when the file extension is zip, we ignore the COPIES option. I think this is a good decision.
* [scramble/.json?=333](/scramble/.json?=333) - One 3x3 scramble in JSON.


#### A fullfilled scramble request ####
Request: [scramble/.json?3x3 Round 1=333\*1\*2&3x3 Round 2=333\*1\*1](/scramble/.json?3x3 Round 1=333\*1\*2&3x3 Round 2=333\*1\*1) - TODO

Response:

	[{
	    "scrambles": ["D2 U2 L2 B R2 B' D2 L2 F2 L2 F2 R D2 U F2 R D' B L D' U2"],
	    "scrambler": "333",
	    "count": 1,
	    "copies": 2,
	    "title": "3x3 Round 1",
	    "fmc": false,
	    "colorScheme": {
	        "U": "ffffff",
	        "D": "ffff00",
	        "F": "00ff00",
	        "B": "0000ff",
	        "R": "ff0000",
	        "L": "ff8000"
	    }
	}, {
	    "scrambles": ["D F2 D' B2 D2 L2 U L2 U2 L2 U' R' D2 L2 B U2 R B2 U2 B'"],
	    "scrambler": "333",
	    "count": 1,
	    "copies": 1,
	    "title": "3x3 Round 2",
	    "fmc": false,
	    "colorScheme": {
	        "U": "ffffff",
	        "D": "ffff00",
	        "F": "00ff00",
	        "B": "0000ff",
	        "R": "ff0000",
	        "L": "ff8000"
	    }
	}]


### view/PUZZLE.[png|svg|json]?scramble=SCRAMBLE&width=WIDTH&height=HEIGHT ###

If JSON, then boundaries of the puzzles faces will be returned in json format. This is necessary information for creating a color scheme chooser.

width/height is the maximum allowed width/height for the resulting image. It will not screw up the image's aspect ratio. If 0, it will attempt to use the preferred width/height.

<a href="view/sq1.png?scramble=(3, 3) /"><img src="view/sq1.png?scramble=(3, 3) /" /></a>
<a href="view/sq1.svg?scramble=(3, 3) /"><img src="view/sq1.svg?scramble=(3, 3) /" /></a>

### POST to view/TITLE.[pdf|zip] ###

The body should be scrambles=SCRAMBLES, where SCRAMBLES is a JSON string that was retrieved from scramble/.json (see "A fullfilled scramble request").

### import/?url=URL ###
url is a url pointing to a text file with newline separated scrambles.
The scrambles will be returned through the callback (if specified).

This url also supports HTML form POST uploading of text files. The response is a Javascript script that calls parent.postMessage with all the scrambles as an argument.
