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
		if(keycode == 27) { //escape
			that.element.parent.setRightElementVisible(false);
		} else if(keycode == 33) {
			messageArea.scrollTop(messageArea.scrollTop() - SCROLL_AMOUNT);
			e.preventDefault();
		} else if(keycode == 34) {
			messageArea.scrollTop(messageArea.scrollTop() + SCROLL_AMOUNT);
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
	
	chatArea.appendChild(messageArea);
	chatArea.appendChild(chatBox);
	var messageId = 0;
	chatBox.addEvent('keypress', function(e) {
		var keycode = e.code;
		if(keycode == 13 && !e.shiftKey) {
			e.preventDefault();
			var text = chatBox.value;
			if(text.match(/^\s*$/)) {
				return;
			}
			var message = {
				text: text,
				timestamp: new Date().getTime(),
				id: messageId++,
				nick: gameMaster.getMyNick()
			};
			gameMaster.sendMessage(message);
			addUnconfirmedMessage(message);
			chatBox.value = "";
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
		isFullyScrolled = ( 2 + messageArea.scrollTop() + messageArea.outerHeight() >= messageArea[0].scrollHeight );
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
			// To keep the ordering of the messages correct, we must remove and then re-add this messageDiv
			// We could also move all other unconfirmedMessages to the bottom, I'm not sure what makes
			// the most sense.
			messageDiv.remove();
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

		var controlMessage = true;
		if(message.nick) {
			var nick = message.nick;
			if(message.nick == gameMaster.getMyNick()) {
				nick = 'me';
			}
			controlMessage = false;
			nickSpan.empty();
			nickSpan.appendText(nick + ": ");
		}
		if(controlMessage) {
			newlinedMessageDiv.addClass('controlMessage');
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

	this.clear = function() {
		lastConfirmedMessage = null;
		messageArea.empty();
		unconfirmedMessages = {};
	};

	document.body.addEvent('keydown', function(e) {
		if(e.which == 192 || e.which == 9) { // twiddle (~) or tab key
			e.preventDefault();
			if(chatBox.is(":focus")) {
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
