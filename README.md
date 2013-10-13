TNoodle is just a collection of cube related projects.

[![Build Status](https://travis-ci.org/cubing/tnoodle.png?branch=master)](https://travis-ci.org/cubing/tnoodle)

tmt (TNoodleMakeTools) is a python script used to develop TNoodle.

* I highly recommend first getting a high level view of all the projects that comprise tnoodle by running `./tmt graph --descriptions`.

* When you're ready to develop, run `./tmt make run -p timer` and then try visiting http://localhost:8080/tnt.

* `./tmt make dist -p timer` should make a runnable jar under the "timer/dist" directory. You can run it using `java -jar timer/dist/TNoodle.jar`

* Note: tmt is designed to be lazy about recompiling stuff. It relies upon timestamps of files to only recompile something when it's strictly necessary. If you use an editor like Vim that writes to .swp files at potentially anytime alongside your source code, this will trick tmt into thinking something needs to be recompiled when it really doesn't. My recommendation is to configure your editor to store all these files in a unified directory that is *not* part of your tnoodle source tree.

I prefer to do Java development in Eclipse, so I made sure that each project is a full fledged Eclipse project (they each have a .classpath and .project file). Furthermore, the whole tnoodle directory can be opened as an Eclipse workspace. Simply go to File > Import > Existing Projects into Workspace, and enter your tnoodle directory under "Select root directory". Eclipse should automagically detect all the tnoodle projects.
