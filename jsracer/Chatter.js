var Chatter = {};

(function() {

var SHOW_TIMESTAMP_DELAY_SECONDS = 60;
var SCROLL_AMOUNT = 40;

Chatter.Chatter = function(gameMaster) {
	var messageArea = $('<div/>');
	messageArea.addClass('messageArea');
	var chatBox = $('<textarea/>');
	chatBox.addClass('chatBox');
	chatBox.keydown(function(e) {
		if(e.which == 27) { //escape
			that.element.parent.setRightElementVisible(false);
		} else if(e.which == 33) {
			messageArea.scrollTop(messageArea.scrollTop() - SCROLL_AMOUNT);
			e.preventDefault();
		} else if(e.which == 34) {
			messageArea.scrollTop(messageArea.scrollTop() + SCROLL_AMOUNT);
			e.preventDefault();
		}
	});
	chatBox.focus(function(e) {
		if(!visible) {
			e.preventDefault();
			that.element.parent.setRightElementVisible(true);
		}
	});
	var chatArea = $('<div/>');
	chatArea.addClass('chatArea');

	chatArea.click(function(e) {
		that.element.parent.setRightElementVisible(true);
	});
	
	chatArea.append(messageArea);
	chatArea.append(chatBox);
	var messageId = 0;
	chatBox.keypress(function(e) {
		if(e.which == 13 && !e.shiftKey) {
			e.preventDefault();
			var text = chatBox.val();
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
			chatBox.val("");
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
		messageArea.append(messageDiv);
		maybeFullyScroll();
	}
	var isFullyScrolled = true;
	messageArea.scroll(function(e) {
		isFullyScrolled = ( 2 + messageArea.scrollTop() + messageArea.outerHeight() >= messageArea[0].scrollHeight );
	});
	function maybeFullyScroll() {
		if(isFullyScrolled) {
			messageArea.scrollTop(messageArea[0].scrollHeight);
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
			// To keep the ordering of the messages correct, we must remove and then re-add this messageDiv;
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
		var messageDiv = $('<div/>');
		var newlinedMessageDiv = $('<div/>');
		var nickSpan = $('<span/>').addClass('nick');
		newlinedMessageDiv.append(nickSpan);
		var dateDiv = $('<div/>').addClass('messageTimestamp');

		messageDiv.append(newlinedMessageDiv);
		messageDiv.append(dateDiv);

		var controlMessage = true;
		if(message.nick) {
			var nick = message.nick;
			if(message.nick == gameMaster.getMyNick()) {
				nick = 'me';
			}
			controlMessage = false;
			nickSpan.text(nick + ": ");
		}
		if(controlMessage) {
			newlinedMessageDiv.addClass('controlMessage');
		}
		var messageByLine = message.text.split('\n');
		for(var i = 0; i < messageByLine.length; i++) {
			newlinedMessageDiv.append(messageByLine[i]);
			newlinedMessageDiv.append($('<br>'));
		}

		messageDiv.setNickVisible = function(visible) {
			if(visible) {
				newlinedMessageDiv.css('text-indent', '');
				nickSpan.show();
			} else {
				newlinedMessageDiv.css('text-indent', '0px');
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
				dateDiv.text('Sent at ' + $.format.date(new Date(message.timestamp).toString(), 'hh:mm a on ddd'));
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

	$('body').keydown(function(e) {
		if(e.which == 192 || e.which == 9) { // twiddle (~) or tab key
			e.preventDefault();
			if(chatBox.is(":focus")) {
				return;
			}
			chatBox.focus();
		}
	});

	chatArea.setSize = function(width, height) {
		chatArea.width(width);
		chatArea.height(height);
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
