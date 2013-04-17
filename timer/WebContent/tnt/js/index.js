// For some reason, alert, prompt, and confirm don't fire the
// blur and focus events on the window. This hack ensures that they
// do.
function wrapFunctionInBlur(func) {
        return function() {
                window.fireEvent('blur');
                retVal = func.apply(null, arguments);
                window.fireEvent('focus');
                return retVal;
        };
}
alert = wrapFunctionInBlur(alert);
prompt = wrapFunctionInBlur(prompt);
confirm = wrapFunctionInBlur(confirm);

window.addEvent('domready', function() {
        var server = new tnoodle.server();
        var configuration = server.configuration;
        
        function onPuzzlesLoaded(puzzles) {
                var puzzle = configuration.get('scramble.puzzle', '333');
                scrambleStuff.setSelectedPuzzle(puzzle);
        }
        var scrambleStuff = new ScrambleStuff(server, onPuzzlesLoaded);
        document.getElementById('puzzleChooser').appendChild(scrambleStuff.puzzleSelect);
        document.getElementById('scrambleArea').appendChild(scrambleStuff.scrambleArea);

        var session = null;
        
        var updatingSession = false;
        scrambleStuff.addPuzzleChangeListener(function(newPuzzle, updateSession) {
                updatingSession = true;
                if(updateSession) {
                        session.setPuzzle(newPuzzle);
                } else {
                        session = null;
                }
                configuration.set('scramble.puzzle', newPuzzle);
                eventSelect.refresh();
                updatingSession = false;
        });

        function getEvents() {
                return server.getEvents(scrambleStuff.getSelectedPuzzle());
        }
        var eventSelect = tnoodle.tnt.createSelect('Click to open last session with event', 'Click to change current session event');
        eventSelect.refresh = function() {
                var events = getEvents();
                var options = [];
                for(var i = 0; i < events.length; i++) {
                        var txt = events[i];
                        options.push({ value: events[i], text: txt });
                }
                options.push({ value: null, text: 'Edit' });
                eventSelect.setOptions(options);

                var event;
                if(session === null) {
                        event = configuration.get('scramble.puzzle.event', '');
                        if(events.indexOf(event) < 0) {
                                event = events[0];
                        }
                } else {
                        event = session.getEvent();
                }
                eventSelect.setSelected(event);
        };
        eventSelect.linebreak = new Element('br');
        $('puzzleChooser').adopt(eventSelect.linebreak);
        $('puzzleChooser').adopt(eventSelect);

        eventSelect.onchange = function(updateSession) {
                var event = eventSelect.getSelected();
                if(event === null) {
                        // We don't want to leave the "Edit" option selected
                        eventSelect.setSelected(session.getEvent() || '');
                        /*
                        var editEventsPopup = tnoodle.tnt.createPopup(null, eventSelect.refresh);
                        var onAdd = function(newItem) {
                                server.createEvent(session.getPuzzle(), newItem);
                        };
                        var onRename = function(oldItem, newItem) {
                                server.renameEvent(session.getPuzzle(), oldItem, newItem);
                        };
                        var onDelete = function(oldItem) {
                                server.deleteEvent(session.getPuzzle(), oldItem);
                        };
                        editEventsPopup.appendChild(tnoodle.tnt.createEditableList(getEvents(), onAdd, onRename, onDelete));
                        editEventsPopup.show();
                        */
                        var newEvent = prompt("Enter name of new event (this will become a pretty gui someday, I promise!)");
                        if(newEvent) {
                                server.createEvent(session.getPuzzle(), newEvent);
                                eventSelect.refresh();
                        }
                        return;
                }
                if(!updateSession && !updatingSession) {
                        session = null;
                } else if(session !== null) {
                        session.setEvent(event);
                }
                configuration.set('scramble.puzzle.event', event);
                sessionSelect.refresh();
        }; //for some reason, the change event doesn't fire until the select loses focus

        //TODO - actually delete this
        var sessionSelect = tnoodle.tnt.createSelect('Click to open session');
        sessionSelect.linebreak = new Element('br');
        sessionSelect.linebreak.setStyle('font-size', 22); // omg, this is disgusting
        $('puzzleChooser').adopt(sessionSelect.linebreak);
        $('puzzleChooser').adopt(sessionSelect);
        sessionSelect.refresh = function() {
                var puzzle = scrambleStuff.getSelectedPuzzle();
                var event = eventSelect.getSelected();

                var options = [];
                options.push({ value: null, text: 'New session' });

                var sessions = server.getSessions(puzzle, event);
                sessions.reverse(); // We want to list our sessions starting with the most recent
                if(sessions.length === 0) {
                        sessions.push(server.createSession(puzzle, event));
                }
                for(var i = 0; i < sessions.length; i++) {
                        var date = sessions[i].getDate().format('%b %d, %Y %H:%M');
                        options.push({ value: sessions[i], text: date });
                }
                sessionSelect.setOptions(options);
                if(session === null || sessions.indexOf(session) < 0) {
                        // If the current session was just deleted,
                        // select the newest one
                        session = sessions[0];
                }
                sessionSelect.setSelected(session);
        };
        sessionSelect.onchange = function(e) {
                session = sessionSelect.getSelected();
                if(session === null) {
                        // New session will create & select a new session
                        newSession();
                        return;
                }
                timesTable.setSession(session);
                $('sessionComment').refresh();
        };
        $('sessionComment').refresh = function() {
                var comment = session.getComment();
                if(comment === null) {
                        $('sessionComment').value = 'Enter comment here';
                        $('sessionComment').setStyle('color', 'gray');
                } else {
                        $('sessionComment').value = comment;
                        $('sessionComment').setStyle('color', 'black');
                }
        };
        $('sessionComment').addEvent('focus', function() {
                if(this.getStyle('color') == 'gray') {
                        this.value = '';
                        this.setStyle('color', 'black');
                }
                setTimeout(this.select.bind(this), 0);
        });
        $('sessionComment').addEvent('keyup', function(e) {
                // Note that we wait for the keyup event, rather than the keydown event.
                // If we waited for keydown, then the subsequent keyup could reset
                // or start the timer.
                if(e.key == "enter" || e.key == "esc") {
                        this.blur();
                }
        });
        $('sessionComment').addEvent('blur', function() {
                session.setComment($('sessionComment').value);
                $('sessionComment').refresh();
        });

        //we try to be clever and change the href only after the anchor has been clicked
        //this should save us the bother of generating the csv over and over again
        //TODO - this is probably getting called twice when clicking, due to the mousedown event, and then the click event
        function downloadCSV() {
                var keys = tnoodle.Time.timeKeys;
                var data = tnoodle.Time.timeKeyNames.join(',')+"\n";
                
                var times = session.times;
                for(var i = 0; i < session.times.length; i++) {
                        var time = session.times[i];
                        for(var j = 0; j < keys.length; j++) {
                                var key = keys[j];
                                var val = time.format(key);
                                //we surround each value with double quotes and escape each double quote, just to be safe
                                val = val === null ?
                                                '' :
                                                '"' + val.replace(/"/g, '""') + '"';
                                data += val + ',';
                        }
                        data += "\n";
                }
                var uri = 'data:text/csv;charset=utf8,' + encodeURIComponent(data);
                this.href = uri;
        }
        function resetSession() {
                timesTable.reset();
        }
        function deleteSession() {
                if(confirm("Are you sure you want to delete the session?")) {
                        server.disposeSession(session);
                        sessionSelect.refresh(); // This will cause the latest session to be selected
                }
        }
        function newSession() {
                var puzzle = scrambleStuff.getSelectedPuzzle();
                var event = eventSelect.getSelected();
                // We create a new session, and then refresh our list
                // Refreshing will cause session to be selected
                session = server.createSession(puzzle, event);
                sessionSelect.refresh();
        }

        function resizeScrambleArea(delta) {
                var scrambleSpace = configuration.get('layout.sizerHeight');
                scrambleSpace += delta;
                configuration.set('layout.sizerHeight', scrambleSpace);
                triLayout.resize();
        }
        function scrollTable(delta) {
                var pos;
                if(delta == Infinity) {
                        pos = timesTable.tbody.scrollHeight;
                } else if(delta == -Infinity) {
                        pos = 0;
                } else {
                        pos = timesTable.tbody.scrollTop + delta;
                }
                timesTable.tbody.scrollTo(0, pos);
        }

        $('helpLink').doClick = function() {
                shortcutManager.helpPopup.refresh();
                shortcutManager.helpPopup.show();
        };
        $('helpLink').addEvent('click', $('helpLink').doClick);
        
        var timesTable = new TimesTable($('timesTable'), server, scrambleStuff);

        tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT = 'Start timer (try "a+;" or nothing)';
        var shortcuts = new Hash({
                'Times': [
                        {
                                description: tnoodle.tnt.KEYBOARD_TIMER_SHORTCUT,
                                'default': '',
                                handler: null
                        },
                        {
                                description: 'Reset timer',
                                'default': 'esc',
                                handler: null,
                                unikey: true
                        },
                        {
                                description: 'Comment on last solve',
                                'default': 'c',
                                handler: timesTable.comment.bind(timesTable)
                        },
                        {
                                description: 'Add time',
                                'default': 'alt+a',
                                handler: timesTable.promptTime.bind(timesTable)
                        },
                        {
                                description: 'No penalty',
                                'default': 'i',
                                handler: timesTable.penalize.bind(timesTable, null)
                        },
                        {
                                description: '+2',
                                'default': 'o',
                                handler: timesTable.penalize.bind(timesTable, '+2')
                        },
                        {
                                description: 'DNF',
                                'default': 'p',
                                handler: timesTable.penalize.bind(timesTable, 'DNF')
                        },
                        {
                                description: 'Undo',
                                'default': 'control+z',
                                handler: timesTable.undo.bind(timesTable)
                        },
                        {
                                description: 'Redo',
                                'default': 'control+y',
                                handler: timesTable.redo.bind(timesTable)
                        }
                ],
                'Sessions': [
                        {
                                description: 'Reset session',
                                'default': 'r',
                                handler: function() {
                                        if(confirm("Are you sure you want to reset the session?")) {
                                                resetSession();
                                        }
                                }
                        },
                        {
                                description: 'Delete session',
                                'default': 'd',
                                handler: deleteSession
                        },
                        {
                                description: 'New session',
                                'default': 'n',
                                handler: function() {
                                        if(confirm("Are you sure you wish to create a new session?")) {
                                                newSession();
                                        }
                                }
                        },
                        {
                                description: 'Comment on session',
                                'default': 'shift+c',
                                handler: $('sessionComment').focus.bind($('sessionComment'))
                        }
                ],
                'Gui stuff': [
                        {
                                description: '+10px scramble area',
                                'default': '=',
                                handler: resizeScrambleArea.bind(null, 10)
                        },
                        {
                                description: '-10px scramble area',
                                'default': '-',
                                handler: resizeScrambleArea.bind(null, -10)
                        },
                        {
                                description: '+50px scramble area',
                                'default': 'shift+=',
                                handler: resizeScrambleArea.bind(null, 50)
                        },
                        {
                                description: '-50px scramble area',
                                'default': 'shift+-',
                                handler: resizeScrambleArea.bind(null, -50)
                        },
                        {
                                description: 'Toggle scramble view',
                                'default': 's',
                                handler: scrambleStuff.toggleScrambleView
                        },
                        {
                                description: 'Scroll up times table',
                                'default': 'pageup',
                                handler: scrollTable.bind(null, -100)
                        },
                        {
                                description: 'Scroll down times table',
                                'default': 'pagedown',
                                handler: scrollTable.bind(null, 100)
                        },
                        {
                                description: 'Scroll to top of times table',
                                'default': 'home',
                                handler: scrollTable.bind(null, -Infinity)
                        },
                        {
                                description: 'Scroll to bottom of times table',
                                'default': 'end',
                                handler: scrollTable.bind(null, Infinity)
                        }
                ],
                'Miscellaneous': [
                        {
                                description: 'Help',
                                'default': 'shift+/',
                                handler: $('helpLink').doClick
                        },
                        {
                                description: 'Select puzzle',
                                'default': 'q',
                                handler: scrambleStuff.puzzleSelect.show
                        },
                        {
                                description: 'Select event',
                                'default': 'w',
                                handler: eventSelect.show
                        },
                        {
                                description: 'Select session',
                                'default': 'e',
                                handler: sessionSelect.show
                        }
                ]
        });
        var shortcutManager = new ShortcutManager(shortcuts, configuration);

        var timer = new TimerDisplay($('timer'), server, scrambleStuff, shortcutManager);
        timer.addEvent('newTime', function(time) {
                //TODO - this may need to wait for the sessions to load...
                timesTable.addTime(time);
        });
        timesTable.addEvent('tableChanged', function() {
                //timer.setStringy(timesTable.lastAddedRow.time.format());
                timer.redraw();
        });
        
        $('newSession').addEvent('click', newSession);
        $('resetSession').addEvent('click', resetSession);
        $('deleteSession').addEvent('click', deleteSession);
        $('downloadCSV').addEvent('click', downloadCSV);
        $('downloadCSV').addEvent('mousedown', downloadCSV);

        $('timer').resize = function() {
                timer.redraw();
        };
        $('timer').getMinimumSize = function() {
                return 50;
        };
        $('scrambles').resize = scrambleStuff.resize;
        $('scrambles').getMinimumSize = scrambleStuff.getMinimumSize;
        function getMaxWidth(el) {
                // Returns the maximum size the element can take up without falling
                // off the right side of the screen.
                return document.body.getSize().x - el.getPosition().x - 20;
        }
        $('times').resize = function() {
                var available = $('times').getSize();
                var remainingHeight = available.y - $('timesArea').getStyle('border-top').toInt() - $('timesArea').getStyle('border-bottom').toInt();
                $('timesArea').setStyle('height', remainingHeight);
                var seshCommentWidth = available.x - 30;
                $('sessionComment').setStyle('width', Math.max(50, seshCommentWidth));

                var selects = [ scrambleStuff.puzzleSelect, eventSelect, sessionSelect ];
                selects.each(function(select) {
                        if(select.linebreak) {
                                select.linebreak.setStyle('display', 'none');
                        }
                        select.setMaxWidth(null);
                });
                selects.each(function(select) {
                        var maxWidth = getMaxWidth(select);
                        if(select.linebreak && select.getSize().x > maxWidth) {
                                select.linebreak.setStyle('display', '');
                                // Adding a newline gives us more space
                                maxWidth = getMaxWidth(select);
                        }
                        select.setMaxWidth(maxWidth);
                });
                
                timesTable.resize();
        };
        $('times').getPreferredWidth = function() {
                return timesTable.getPreferredWidth();
        };

        
        var triLayout = new TriLayout($('timer'), $('scrambles'), $('times'), configuration);
        timesTable.manager = triLayout;
        scrambleStuff.manager = triLayout;
        
        var aboutPopup = tnoodle.tnt.createPopup();
        var aboutPopupDiv = document.createElement('div');
        var aboutPopupH2 = document.createElement('h2');
        aboutPopupH2.appendText('TNoodle Timer (TNT) v' + tnoodle.tnt.version);
        aboutPopupH2.setStyle('margin', '0');
        aboutPopupDiv.appendChild(aboutPopupH2);
        aboutPopupDiv.appendText('Created by Jeremy Fleischman from the ashes of CCT.');
        aboutPopupDiv.appendChild(document.createElement('br'));
        aboutPopupDiv.appendText('Thanks to Leyan Lo for ideas/couch');
        aboutPopup.appendChild(aboutPopupDiv);
        $('aboutLink').addEvent('click', function() {
                aboutPopup.show();
        });
        

        $('bgLink').reset = function() {
                $('bgLink').empty();
                $('bgLink').appendText('Set background');
        };
        var bgImg = $$('.background')[0];
        var bgImgSize = null;
        function setBgUrl(url) {
                if(url === undefined || url === null) {
                        url = "";
                }
                configuration.set('gui.backgroundImage', url);
                if(url === "") {
                        $('bgLink').reset();
                        bgImg.setStyle('display', 'none');
                        window.removeEvent('resize', resizeBgImg);
                } else {
                        if(bgImg.src == url) {
                                // This is more efficient + the load event won't
                                // fire if we don't change the src
                                return;
                        }
                        $('bgLink').empty();
                        $('bgLink').appendText('Loading...');
                        bgImgSize = null;
                        bgImg.src = url;
                        bgImg.setStyle('display', 'inline');
                        bgImg.setStyle('width', '');
                        bgImg.setStyle('height', '');
                        // neat little trick to keep the image from showing up until it has loaded
                        bgImg.setStyle('opacity', '0');
                        bgImg.addEvent('load', function() {
                                $('bgLink').reset();
                                bgImgSize = bgImg.getSize();
                                resizeBgImg();
                                bgImg.setStyle('opacity', '1');
                        });
                        bgImg.addEvent('error', function() {
                                $('bgLink').reset();
                                $('bgLink').appendText(' (failed to load: ' + url + ')');
                        });
                        window.addEvent('resize', resizeBgImg);
                }
        }
        function resizeBgImg() {
                if(bgImgSize === null) {
                        // image hasn't loaded yet, so there's nothing we can do
                        return;
                }
                var available = document.body.getSize();
                var height = available.y;
                var width = Math.max(available.x, available.y * (bgImgSize.x/bgImgSize.y));
                height = width * bgImgSize.y/bgImgSize.x;
                bgImg.setStyle('width', width);
                bgImg.setStyle('height', height);

                bgImg.setStyle('left', (available.x - width) / 2);
                bgImg.setStyle('top', (available.y - height) / 2);
        }
        
        var bgPopup = tnoodle.tnt.createPopup();
        var bgPopupDiv = document.createElement('div');
        var bgPopupUrl = document.createElement('input');
        bgPopupUrl.type = 'text';
        var bgPopupSet = document.createElement('input');
        bgPopupSet.type = 'submit';
        bgPopupSet.value = 'set';
        var bgPopupCancel = document.createElement('input');
        bgPopupCancel.type = 'submit';
        bgPopupCancel.value = 'cancel';
        bgPopupDiv.appendText("URL:");
        bgPopupDiv.appendChild(bgPopupUrl);
        bgPopupDiv.appendChild(bgPopupSet);
        bgPopupDiv.appendChild(bgPopupCancel);
        bgPopup.appendChild(bgPopupDiv);

        bgPopupSet.addEvent('click', function() {
                var url = bgPopupUrl.value;
                if(url !== '') { setBgUrl(url); }
                bgPopup.hide();
        });

        bgPopupCancel.addEvent('click', function() {
                bgPopup.hide();
        });

        $('bgLink').addEvent('click', function() {
                bgPopupUrl.value = configuration.get('gui.backgroundImage');
                bgPopup.show();
        });
        setBgUrl(configuration.get('gui.backgroundImage', ''));
});
