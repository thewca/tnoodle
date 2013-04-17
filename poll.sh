#!/bin/bash

while true; do
        PULL=`git pull`
        RETVAL=$?
        echo 'Checking for update...'
        # Note that this if statment returns true if we have local
        # changes.
        if [[ $RETVAL -eq 0 && "$PULL" != "Already up-to-date." ]]
        then
                git submodule update --init
                # We've just pulled in some changes from our remote repo,
                # so we evaluate the command line args given to us
                eval "$@"
        else
                echo 'No update found'
        fi
        sleep 10
done
