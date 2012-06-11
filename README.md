TNoodle is just a collection of cube related projects.

tmt (TnoodleMakeTools) is a python script that built to help develop TNoodle.

* I highly recommend first getting a high level view of all the projects that comprise tnoodle by running `./tmt make graph --descriptions`.

* When you're ready to develop, run `./tmt make run -p timer` and then try visiting http://localhost:8080/tnt.

* `./tmt make dist -p timer` should make a runnable jar under the "timer/dist" directory.

I prefer to do Java development in Eclipse, so I made sure that each project is a full fledged Eclipse project (they each have a .classpath and .project file). Furthermore, the whole tnoodle directory can be opened as an Eclipse workspace. Simply go to File > Import > Existing Projects into Workspace, and enter your tnoodle directory under "Select root directory". Eclipse should automagically detect all the tnoodle projects.
