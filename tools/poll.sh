#!/bin/bash

while true; do
	PULL=`git pull`
	echo 'Checking for update...'
	if [ "$PULL" != "Already up-to-date." ]
	then
		git submodule update
		# We've just pulled in some changes from our remote repo,
		# so we evaluate the command line args given to us
		eval "$@"
	else
		echo 'No update found'
	fi
	sleep 10
done
