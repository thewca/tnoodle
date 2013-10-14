# TNoodle

[![Build Status](https://travis-ci.org/cubing/tnoodle.png?branch=master)](https://travis-ci.org/cubing/tnoodle)

TNoodle is a collection of speedcubing-related projects, primarily written in Java. In particular, it is the official WCA scramble program


## WCA Scramble Program

TNoodle has been the sole official scramble program for the [World Cube Association](https://www.worldcubeassociation.org/) since January 1, 2013. It will remain the only official scramble program for the foreseeable future.

All WCA official competitions must always use the current version of the official scramble program. This is available from <https://www.worldcubeassociation.org/regulations/scrambles/>

Note that only the scramble program part of TNoodle is "official". TNoodle Timer is part of TNoodle, but it is not an official timer and is not considered to generate official scrambles. Other embedded projects may be convenient for certain uses (including at official competitions), but also do not have any official status.


### "Scramble Program" vs. "Scrambler"

Officially, TNoodle is a [scramble program](https://www.worldcubeassociation.org/regulations/#4f), while a [scrambler](https://www.worldcubeassociation.org/regulations/#A2b) is a human. It is fine to refer to TNoodle as a "scrambler" colloquially, but please try to use the official convention wherever possible.


## Project Details

`tmt` (TNoodleMakeTools) is a python script used to develop TNoodle.


### Overview

Get a high level view of all the projects that comprise tnoodle by running

    ./tmt graph --descriptions


### WCA Scramble Program

When you're ready to develop, run the following and then visit <http://localhost:8080>

    ./tmt make run -p wca

To build a distributable/executable `.jar` file, run:

    ./tmt make dist -p wca

You can run the `.jar` from the commandline using `java -jar timer/dist/TNoodle.jar`.

*Note that you must never use a custom build for any official competitions.*

[Contact the WCA Board and the WRC](https://www.worldcubeassociation.org/contact) if you have any questions about this.


### TNoodle Timer (TNT)

TNoodle Timer is currently built as part of the `wca` distribution. Run `./tmt graph --descriptions` to check the current relationship between the `wca` and `timer` distributions.

When TNoodle is running, TNT will be available at <http://localhost:8080/tnt>

### Notes

- Each project is a full fledged Eclipse project (they each have a `.classpath` and `.project` file). Furthermore, the whole tnoodle directory can be opened as an Eclipse workspace. Simply go to File > Import > Existing Projects into Workspace, and enter your tnoodle directory under "Select root directory". Eclipse should automagically detect all the tnoodle projects.
- `tmt` is designed to be efficient about recompiling subprojects. It relies upon timestamps of files to only recompile something when it's strictly necessary. If you use an editor like Vim that writes to .swp files at potentially anytime alongside your source code, this will trick tmt into thinking something needs to be recompiled when it really doesn't. My recommendation is to configure your editor to store all these files in a unified directory that is *not* part of your tnoodle source tree.
