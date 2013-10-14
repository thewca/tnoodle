<img src="./winstone/src_tnoodle_resources/icons/tnoodle_logo_1024.png" alt="Tnoodle Logo" height="128px"/>

# TNoodle

TNoodle is a collection of speedcubing-related projects, primarily written in Java. In particular, it contains the official WCA scramble program.

[![Build Status](https://travis-ci.org/cubing/tnoodle.png?branch=master)](https://travis-ci.org/cubing/tnoodle)


## WCA Scramble Program

The official scramble program for the [World Cube Association](https://www.worldcubeassociation.org/) has been part of the TNoodle project since January 1, 2013. It will contain the sole official scramble program for the foreseeable future.

All WCA official competitions must always use the current version of the official scramble program. This is available from <https://www.worldcubeassociation.org/regulations/scrambles/>

Note that only the scramble program part of TNoodle is "official". Other TNoodle projects may be convenient for certain uses (including at official competitions), but do not have any official status.


### "Scramble Program" vs. "Scrambler"

Officially, `Tnoodle-WCA` is a [scramble program](https://www.worldcubeassociation.org/regulations/#4f), while a [scrambler](https://www.worldcubeassociation.org/regulations/#A2b) is a human. It is fine to refer to TNoodle as a "scrambler" colloquially, but please try to use the official convention wherever possible.


## Project Details

`tmt` (TNoodleMakeTools) is a python script used to develop TNoodle.


### Overview

Get a high level view of all the projects that comprise tnoodle by running:

    ./tmt graph --descriptions


### WCA Scramble Program

When you're ready to develop, run the following and then visit <http://localhost:8080/scramble/>

    ./tmt make run -p wca

To build a distributable/executable `.jar` file, run:

    ./tmt make dist -p wca

You can run the `.jar` from the commandline using:

    java -jar timer/dist/TNoodle-WCA.jar

*Important note: You must never use a custom build for any official competitions.* [Contact the WCA Board and the WRC](https://www.worldcubeassociation.org/contact) if you have any questions about this.


### TNoodle Timer (TNT) and Other Projects

TNoodle contains other distributions, like TNoodle Timer (TNT) as `timer`.

You can build the `timer` distribution similarly to `wca`:

    # Build and run directly.
    ./tmt make run -p timer

    # Build to .jar file.
    ./tmt make dist -p timer

    # Run .jar file from commandline
    java -jar timer/dist/TNoodleTimer.jar

When TNoodle is running, TNT will be available at <http://localhost:8080/tnt>.

Other projects can be run similarly, too. Run `./tmt graph --descriptions` to see the current list.

### Notes

- Each project is a full fledged Eclipse project (they each have a `.classpath` and `.project` file). Furthermore, the whole tnoodle directory can be opened as an Eclipse workspace. Simply go to File > Import > Existing Projects into Workspace, and enter your tnoodle directory under "Select root directory". Eclipse should automagically detect all the tnoodle projects.
- `tmt` is designed to be efficient about recompiling subprojects. It relies upon timestamps of files to only recompile something when it's strictly necessary. If you use an editor like Vim that writes to .swp files at potentially anytime alongside your source code, this will trick tmt into thinking something needs to be recompiled when it really doesn't. My recommendation is to configure your editor to store all these files in a unified directory that is *not* part of your tnoodle source tree.
