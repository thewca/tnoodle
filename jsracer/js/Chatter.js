var Chatter = {};

(function() {

var SHOW_TIMESTAMP_DELAY_SECONDS = 60;
var SCROLL_AMOUNT = 40;

Chatter.Chatter = function(gameMaster) {
	var messageArea = document.createElement('div');
	messageArea.addClass('messageArea');
	var chatBox = document.createElement('textarea');
	chatBox.addClass('chatBox');
	chatBox.addEvent('keydown', function(e) {
		var keycode = e.code;
		if(keycode == 27) { // escape
			that.element.parent.setRightElementVisible(false);
		} else if(keycode == 33) { // pgup
			messageArea.scrollTop = messageArea.scrollTop - SCROLL_AMOUNT;
			e.preventDefault();
		} else if(keycode == 34) { // pgdown
			messageArea.scrollTop = messageArea.scrollTop + SCROLL_AMOUNT;
			e.preventDefault();
		}
	});
	chatBox.addEvent('focus', function(e) {
		if(!visible) {
			e.preventDefault();
			that.element.parent.setRightElementVisible(true);
		}
	});
	var chatArea = document.createElement('div');
	chatArea.addClass('chatArea');

	chatArea.addEvent('click', function(e) {
		that.element.parent.setRightElementVisible(true);
	});
	
        var cliCommands = {};
        function addCliCommand(cmdKey, func, help) {
           func.help = help;
           cliCommands[cmdKey] = func;
        }
        addCliCommand('help', function(argv) {
              var text;
              if(argv.length === 0) {
                 text = "Available commands: " + Object.keys(cliCommands).join(", ");
              } else {
                 var command = argv[0];
                 if(cliCommands.hasOwnProperty(command)) {
                    var func = cliCommands[argv[0]];
                    text = "Usage: /" + command + " " + func.help;
                 } else {
                    text = "Unrecognized command: " + command;
                 }
              }
              that.addClientSideMessage({text: text});
              return true;
        }, '[command]');
        addCliCommand('nick', function(argv) {
           if(argv.length != 1) {
              return false;
           }

           gameMaster.changeNick(argv);
           return true;
        }, 'nick');
        addCliCommand('join', function(argv) {
           if(argv.length != 1) {
              return false;
           }
           var channel = argv[0];
           if(channel[0] == '#') {
              channel = channel.substring(1);
           }
           gameMaster.changeChannel(channel);
           return true;
        }, '[#]channel');

        var history = [];
        var historyIndex = 0;

	chatArea.appendChild(messageArea);
	chatArea.appendChild(chatBox);
	var messageId = 0;
	chatBox.addEvent('keydown', function(e) {
		var keycode = e.code;
		if(keycode == 13 && !e.shift) {
			e.preventDefault();
			var text = chatBox.value;
			if(text.match(/^\s*$/)) {
				return;
			}
                        if(text[0] == '/') {
                           var argv = text.substring(1).split(/ +/);
                           var command = argv[0];
                           if(!cliCommands.hasOwnProperty(command)) {
                              that.addClientSideMessage({text: "Unrecognized command: " + text + ". Try /help"});
                           } else {
                              commandFunc = cliCommands[command];
                              argv = argv.slice(1);
                              var parsedCommand = commandFunc(argv);
                              if(!parsedCommand) {
                                 // If we couldn't parse the command, we try to
                                 // give the user some help.
                                 that.addClientSideMessage({text: "Couldn't parse command: " + text});
                                 cliCommands.help([command]);
                              }
                           }
                        } else {
                           var message = {
                              text: text,
                              timestamp: new Date().getTime(),
                              id: messageId++,
                              nick: gameMaster.getMyNick()
                           };
                           gameMaster.sendMessage(message);
                           addUnconfirmedMessage(message);
                        }
                        history.push(text);
                        historyIndex = history.length;
                        chatBox.value = "";
                        return;
		} else if(keycode == 38) { // keyup
                   e.preventDefault();
                   historyIndex = Math.max(0, historyIndex-1);
                   if(historyIndex < history.length) {
                      chatBox.value = history[historyIndex];
                   }
                } else if(keycode == 40) { // keydown
                   e.preventDefault();
                   historyIndex = Math.min(history.length, historyIndex+1);
                   if(historyIndex < history.length) {
                      chatBox.value = history[historyIndex];
                   }
                }
	});

	var unconfirmedMessages = {};
	function addUnconfirmedMessage(message) {
		var key = [ message.nick, message.id ];
		message.div = createMessageDiv(message);
		appendMessageDiv(message.div);
		unconfirmedMessages[key] = message;
	}
	function appendMessageDiv(messageDiv) {
		messageArea.appendChild(messageDiv);
		maybeFullyScroll();
	}
	var isFullyScrolled = true;
	messageArea.addEvent('scroll', function(e) {
		isFullyScrolled = ( 2 + messageArea.scrollTop + messageArea.getSize().y >= messageArea.scrollHeight );
	});
	function maybeFullyScroll() {
		if(isFullyScrolled) {
			messageArea.scrollTop = messageArea.scrollHeight;
		}
	}

	var lastConfirmedMessage = null;
	function maybeShowTimestamp() {
		if(!lastConfirmedMessage) {
			return;
		}
		var secondsSinceLastMessage = (new Date().getTime() - lastConfirmedMessage.timestamp)/1000;
		if(secondsSinceLastMessage > SHOW_TIMESTAMP_DELAY_SECONDS) {
			lastConfirmedMessage.div.setTimestampVisible(true);
			lastConfirmedMessage = null;
			maybeFullyScroll();
		}
		setTimeout(maybeShowTimestamp, 1000);
	}
	function confirmMessage(message) {
		var key = [ message.nick, message.id ];
		var messageDiv = null;
		if(key in unconfirmedMessages) {
			message = unconfirmedMessages[key];
			messageDiv = message.div;
                        // To keep the ordering of the messages correct, we
                        // must remove and then re-add this messageDiv.
                        // We could also move all other unconfirmedMessages to
                        // the bottom, I'm not sure what makes the most sense.
			messageDiv.dispose();
		} else {
			message.div = createMessageDiv(message);
			messageDiv = message.div;
		}
		message.timestamp = new Date().getTime();

		messageDiv.setConfirmed(true);
		if(lastConfirmedMessage) {
			if(lastConfirmedMessage.nick == message.nick) {
				messageDiv.setNickVisible(false);
			}
		}
		appendMessageDiv(messageDiv);
		lastConfirmedMessage = message;
		maybeShowTimestamp();
		assert(lastConfirmedMessage.timestamp);
	}
	function createMessageDiv(message) {
		var messageDiv = document.createElement('div');
		var newlinedMessageDiv = document.createElement('div');
		var nickSpan = document.createElement('span').addClass('nick');
		newlinedMessageDiv.appendChild(nickSpan);
		var dateDiv = document.createElement('div').addClass('messageTimestamp');

		messageDiv.appendChild(newlinedMessageDiv);
		messageDiv.appendChild(dateDiv);

		if(message.nick) {
			var nick = message.nick;
			if(message.nick == gameMaster.getMyNick()) {
				nick = 'me';
			}
			nickSpan.empty();
			nickSpan.appendText(nick + ": ");
		} else {
                   assert(message['class']);
                   newlinedMessageDiv.addClass(message['class']);
                }
		var messageByLine = message.text.split('\n');
		for(var i = 0; i < messageByLine.length; i++) {
			newlinedMessageDiv.appendChild(document.createTextNode(messageByLine[i]));
			newlinedMessageDiv.appendChild(document.createElement('br'));
		}

		messageDiv.setNickVisible = function(visible) {
			if(visible) {
				newlinedMessageDiv.setStyle('text-indent', '');
				nickSpan.show();
			} else {
				newlinedMessageDiv.setStyle('text-indent', '0px');
				nickSpan.hide();
			}
		};
		messageDiv.setConfirmed = function(confirmed) {
			if(confirmed) {
				newlinedMessageDiv.removeClass('unconfirmedMessage');
				newlinedMessageDiv.addClass('confirmedMessage');
			} else {
				newlinedMessageDiv.addClass('unconfirmedMessage');
				newlinedMessageDiv.removeClass('confirmedMessage');
			}
		};
		messageDiv.setConfirmed(false);
		messageDiv.setTimestampVisible = function(visible) {
			if(visible) {
				//TODO - prettier date dateDiv.text('Sent at ' + $.format.date(new Date(message.timestamp).toString(), 'hh:mm a on ddd'));
				dateDiv.empty();
				dateDiv.appendText('Sent at ' + new Date(message.timestamp).toString());
				dateDiv.show();
			} else {
				dateDiv.hide();
			}
		};
		messageDiv.setTimestampVisible(false);
		return messageDiv;
	}

	this.addMessage = function(message) {
		confirmMessage(message);
	};
        this.addServerMessage = function(message) {
           message['class'] = 'serverSideMessage';
           confirmMessage(message);
        };
        this.addClientSideMessage = function(message) {
           message['class'] = 'clientSideMessage';
           confirmMessage(message);
        };

	this.clear = function() {
		lastConfirmedMessage = null;
		messageArea.empty();
		unconfirmedMessages = {};
	};

        window.addEvent('keydown', function(e) {
		if(e.code == 192 || e.code == 9) { // twiddle (~) or tab key
			e.preventDefault();
			if(document.activeElement == chatBox) {
				return;
			}
			chatBox.focus();
		}
	});

	chatArea.setSize = function(width, height) {
		chatArea.setStyle('width', width);
		chatArea.setStyle('height', height);
		maybeFullyScroll();
	};
	var visible = true;
	chatArea.setVisible = function(visible_) {
		visible = visible_;
		if(visible) {
			chatBox.focus();
		} else {
			chatBox.blur();
		}
	};
	this.element = chatArea;
	var that = this;
};

})();
