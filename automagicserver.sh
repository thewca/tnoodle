#!/usr/bin/bash

# From http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"/..
echo "Changing to $DIR"
cd $DIR

if [ ! -f "projectname" ];
then
	echo "File projectname must exist, quitting"
	exit 1
fi

if [ ! -f "startserver.sh" ];
then
	echo "File startserver.sh must exist, quitting"
	exit 1
fi

NAME=$(cat projectname)

if [ "`screen -ls | grep $NAME`" != "" ]; then
        echo "Screen session $NAME already running, killing it"
        # TODO if there's more than one session named $NAME, this doesn't work
        screen -S $NAME -X quit
fi
echo "Starting screen named $NAME"
screen -d -m -S $NAME -c git-tools/serverscreenrc
