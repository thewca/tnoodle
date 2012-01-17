TNoodle is just a collection of cube related projects.

tmt (TnoodleMakeTools) is a python script that built to help develop TNoodle.

Some useful commands tmt commands are:

* I highly recommending getting a high level view of all the projects that comprise tnoodle. To get a feel for them, run:

	./tmt make graph --descriptions

* What I use for development. After running this command, try visiting http://localhost:8080/tnt.

	./tmt make run -p timer

* Should make a runnable jar under the "timer/dist" directory:

	./tmt make dist -p timer

I prefer to do Java development in Eclipse, so I made sure that each project is a full fledged Eclipse project (they each have a .classpath and .project file). Furthermore, the whole tnoodle directory can be opened as an Eclipse workspace. Simply go to File > Import > Existing Projects into Workspace, and enter your tnoodle directory under "Select root directory". Eclipse should automagically detect all the tnoodle projects.
