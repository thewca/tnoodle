#!/bin/bash

while true; do
	PULL=`git pull`
	echo 'Checking for update...'
	if [ "$PULL" != "Already up-to-date." ]
	then
		echo '******Killing old server*******'
		# Upon dying, the server will rebuild
		# and start back up.
		wget localhost:8080/kill/now; rm now
	else
		echo 'No update found'
	fi
	sleep 10
done
