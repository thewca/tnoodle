# TNoodleServer #

An http server built to generate scrambles and images for twisty puzzles. Supports json, png, pdf and zip formats.  It is currently being used by the following programs.

* [TNT](tnt/) - A new timer aiming to replace CCT.
* [WCA Scrambler](scramble/) - An (unofficial!) WCA-style scrambler. Hopefully someday soon it will be official.

Looking for something that's missing? Want to contribute? Check out the latest version of the code on [github](http://github.com/jfly/tnoodle)!

## API ##

Note: All pages that serve up JSON also support JSONP via a callback parameter. For simplicity of the documentation, that optional callback parameter has been omitted.

### puzzles/ ###

Simply returns a list of available puzzles in JSON format.

* [puzzles/](puzzles/)

### scramble/[TITLE].[txt|json|pdf|zip]?[PARAMS] ###

PARAMS include "seed", "showIndices" and most importantly, an arbitrary number of PUZZLE_REQUEST's.

PUZZLE_REQUEST's look like this:

	TITLE=3x3x3*COUNT*COPIES*SCHEME

COUNT can be an integer, or "fmc". "fmc" means generate one scramble, and is specially handled by the PDF generator. See [scramble/Big Competition.pdf?FMC Round 1=3x3x3*fmc](scramble/Big Competition.pdf?FMC Round 1=3x3x3*fmc) for an example.

Puzzle request titles must be unique.

* [scramble/.txt?=3x3x3](scramble/.txt?=3x3x3) - A text file containing 1 3x3 scramble. Revisiting this url will generate different scrambles.
* [scramble/.txt?=3x3x3*12&seed=cubing](scramble/.txt?=3x3x3*12&seed=cubing) - A text file with 12 3x3 scrambles generated from the seed "cubing". Revisiting this url will always generate the same 12 scrambles.
* [scramble/My Comp.pdf?3x3 Round 1=3x3x3*5](scramble/My Comp.pdf?3x3 Round 1=3x3x3*5) - A single 3x3 sheet of 5 scrambles.
* [scramble/My Comp.pdf?3x3 Round 1=3x3x3\*5\*2](scramble/My Comp.pdf?3x3 Round 1=3x3x3*5*2) - 2 identical copies of a 3x3 sheet of 5 scrambles. This will produce a 2 page PDF.
* [scramble/My Comp.pdf?3x3 Round 1=3x3x3\*5\*2&3x3 Round 2=3x3x3\*5](scramble/My Comp.pdf?3x3 Round 1=3x3x3*5*2&3x3 Round 2=3x3x3*5) - 2 identical copies of a 3x3 sheet of 5 scrambles (titled "3x3 Round 1") 
followed by 1 page of 5 3x3 scrambles (titled "3x3 Round 2"). This will produce a 3 page PDF.
* [scramble/My Comp.zip?3x3 Round 1=3x3x3\*5\*2&3x3 Round 2=3x3x3\*5](scramble/My Comp.zip?3x3 Round 1=3x3x3*5*2&3x3 Round 2=3x3x3*5) - This will produce a zip file containing 2 pdfs, one named "3x3 Round 1.pdf" and the other named "3x3 Round 2.pdf". Note that when the file extension is zip, we ignore the COPIES option. I think this is a good decision.
* [scramble/.json?=3x3x3](scramble/.json?=3x3x3) - One 3x3 scramble in JSON. See "A fullfilled scramble request" for details.

#### A fullfilled scramble request ####

	[
		{
			"scrambles": 
				["D\u0027 R\u0027 L B D2 F2 D2 L F2 D\u0027 L D\u0027 R2 F2 R2 L2 U\u0027 F2 B2 R2 B2"],
			"scrambler": "3x3x3",
			"count": 1,
			"copies": 2,
			"title": "3x3 Round 1",
			"fmc": false
		},
		{
			"scrambles":
				["U\u0027 R2 F2 U\u0027 F\u0027 U\u0027 R\u0027 F2 U\u0027 B R\u0027 F2 D\u0027 R2 U\u0027 R2 D2 L2 F2 U"],
			"scrambler": "3x3x3",
			"count": 1,
			"copies": 1,
			"title": "3x3 Round2",
			"fmc": false
		}
	]
### view/PUZZLE.[png|json]?scramble=SCRAMBLE&width=WIDTH&height=HEIGHT ###

If JSON, then boundaries of the puzzles faces will be returned in json format. This is necessary information for creating a color scheme chooser.

width/height is the maximum allowed width/height for the resulting image. It will not screw up the image's aspect ratio. If 0, it will attempt to use the preferred width/height.

<a href="view/sq1.png?scramble=(3, 3) /"><img src="view/sq1.png?scramble=(3, 3) /" /></a>

### view/TITLE.[pdf|zip]?scrambles=SCRAMBLES ###

SCRAMBLES should be a JSON string that was retrieved from scramble/.json (see "A fullfilled scramble request"). Since SCRAMBLES could potentially be very long, it is possible to do an HTML POST instead.

* [view/.pdf?scrambles=%5B%7B%22scrambles%22:%5B%22R2%20L2%20U2%20D2%20B2%20F2%22%5D,%22scrambler%22:%223x3x3%22,%22count%22:1,%22copies%22:1,%22title%22:%22%22,%22fmc%22:false%7D%5D](view/.pdf?scrambles=%5B%7B%22scrambles%22:%5B%22R2%20L2%20U2%20D2%20B2%20F2%22%5D,%22scrambler%22:%223x3x3%22,%22count%22:1,%22copies%22:1,%22title%22:%22%22,%22fmc%22:false%7D%5D)

### import/?url=URL ###
url is a url pointing to a text file with newline separated scrambles.
The scrambles will be returned through the callback (if specified).

This url also supports HTML form POST uploading of text files. The response is a Javascript script that calls parent.postMessage with all the scrambles as an argument.
