<img src="./winstone/src/main/resources/tnoodle_resources/icons/tnoodle_logo_1024.png" alt="TNoodle Logo" height="128px"/>

# TNoodle

TNoodle is a software suite that contains the official WCA scramble program. It consists of the core scrambling code (primarily written in Java) as well as a UI and server to generate a fully autonomous JAR file

[![Build Status](https://travis-ci.org/thewca/tnoodle.svg?branch=master)](https://travis-ci.org/thewca/tnoodle)


## WCA Scramble Program

The official scramble program for the [World Cube Association](https://www.worldcubeassociation.org/) has been part of the TNoodle project since January 1, 2013. It will contain the sole official scramble program for the foreseeable future.

All WCA official competitions must always use the current version of the official scramble program. This is available from <https://www.worldcubeassociation.org/regulations/scrambles/>

Note that only the scramble program part of TNoodle is "official". Other TNoodle projects may be convenient for certain uses (including at official competitions), but do not have any official status.


### "Scramble Program" vs. "Scrambler"

Officially, `TNoodle-WCA` is a [scramble program](https://www.worldcubeassociation.org/regulations/#4f), while a [scrambler](https://www.worldcubeassociation.org/regulations/#A2b) is a human. It is fine to refer to TNoodle as a "scrambler" colloquially, but please try to use the official convention wherever possible.


## Project Details

TNoodle is organised as a multi-project [Gradle](https://gradle.com) build. The build files are written in the type-safe `Kotlin` dialect.

Every sub-project has its individual artifact configuration and `build.gradle` file. Furthermore, there is a central `buildSrc` folder,
which is automatically sourced by Gradle. It contains common code and shared configuration setups.


### Overview

Gradle is served through the use of a `Gradle wrapper` available as `gradlew` (UNIX systems) or `gradlew.bat` (DOS systems)
It is recommended to set up an alias to simplify task generation, along the lines of `alias gw='./gradlew --parallel'`.

Get an overview of the core project tasks by executing

    ./gradlew tasks

    
### Setup

The installation of TNoodle currently requires an Android SDK to be set up as per [the official instructions](https://developer.android.com/studio).
Scroll all the way to the bottom of the page and opt for "Command Line Tools only" if you want to avoid several GB of IDE overhead in downloads.


### WCA Scramble Program

When you're ready to develop, run the following and then visit <http://localhost:2014/scramble/>

    ./gradlew :webscrambles:runShadow

To build a distributable/executable `.jar` file, run:

    ./gradlew :webscrambles:shadowJar

You can run the `.jar` from the commandline using: (replace the `$VERSION` tag accordingly)

    java -jar TNoodle-WCA-$VERSION.jar

*Important note: You must never use a custom build for any official competitions.* [Contact the WCA Board and the WRC](https://www.worldcubeassociation.org/contact) if you have any questions about this.

### Releasing

First make sure that `./gradlew build` works. This will involve installing the
android sdk and setting up an ANDROID_HOME environment variable.

- Bump the version number in the root project `build.gradle.kts`.
- Verify that all tests succeed by invoking `./gradlew check`.
- Build a release JAR with `./gradlew generateOfficialRelease`.

Be aware that this command will invoke all build tests! Especially for the `:scrambles` project, this can take some ~15 minutes to finish.

### Notes

- Each project is a fully fledged Gradle project (they each have a `build.gradle.kts` file). Your IDE should be able to import Gradle build structures nowadays. if not, this is a good indicator that your IDE is outdated and should be replaced.
