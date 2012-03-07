var GameMaster = {};

(function() {

var games = {};
GameMaster.games = games; // This is purely for debugging purposes

GameMaster.getGames = function() {
	return games;
};
GameMaster.addGame = function(game) {
	assert(!(game.getGameName() in games));
	games[game.getGameName()] = game;
};
GameMaster.GameMaster = function() {
	var gui = new GameMasterGui.GameMasterGui(this);
	this.gui = gui; // debugging
	var chatter = new Chatter.Chatter(this);
	var vertSplit = new Split.VerticalSplit(gui.element, chatter.element);
	document.body.appendChild(vertSplit.element);

	var gameInfo = null;
	this.getGameInfo = function() {
		return gameInfo;
	};
	this.getGame = function() {
		if(!games || !gameInfo) {
			return null;
		}
		return games[gameInfo.gameName];
	};
	now.handleGameInfo = function(gameInfo_) {
		StatusBar.setError('handleGameInfo', null);
		// gameInfo should have a gameName attribute and an inspectionSeconds attribute
                assert(gameInfo_.hasOwnProperty('inspectionSeconds'));
		assert(gameInfo_.gameName in games, gameInfo_.gameName + " not found in " + Object.keys(games));
                if(gameInfo !== null && gameInfo_.gameName == gameInfo.gameName && gameInfo_.inspectionSeconds == gameInfo.inspectionSeconds) {
                   return;
                }
		gameInfo = gameInfo_;
		gui.handleGameInfo();
	};

	var randomState = null;
	this.getRandomState = function() {
		return randomState;
	};
	now.handleRandomState = function(randomState_) {
		randomState = randomState_;
		gui.handleRandomState();
	};

	var clientId_user = null;
	this.getChannelMembers = function() {
		return clientId_user;
	};
	var myself = null;
	this.getMyself = function() {
		return myself;
	};
	this.getMyNick = function() {
		if(!myself) {
			return null;
		}
		return myself.nick;
	};
	this.getMyClientId = function() {
		if(!myself) {
			return null;
		}
		return myself.clientId;
	};
	this.getChannelName = function() {
		if(!myself) {
			return null;
		}
		return myself.channel.channelName;
	};
	this.isConnected = function() {
		return myself && that.getGame();
	};
	now.handleChannelMembers = function(clientId_user_) {
		clientId_user = clientId_user_;
		var clientId = now.core.clientId;
		if(clientId in clientId_user) {
			StatusBar.setError('handleChannelMembers', null);
			myself = clientId_user[clientId];
			gui.connectionChanged();
		} else {
			StatusBar.setError('handleChannelMembers', "Couldn't find " + clientId + " in " + Object.keys(clientId_user));
			myself = null;
			clientId_user = null;
			gui.connectionChanged();
			return;
		}

		if(myself.admin) {
			// Whenever someone joins the channel, we spam
			// everyone with the game info.
			that.sendGameInfo();
		}

		// we can't create the games until we know what game we're playing
		if(!that.getGame()) {
			return;
		}

		gui.handleChannelMembers();
	};
	now.handleMemberJoin = function(member, clientId_user_) {
		chatter.addMessage({text: member.nick + " in da house."});
		now.handleChannelMembers(clientId_user_);
	};
	now.handleMemberPart = function(member, clientId_user_) {
		chatter.addMessage({text: member.nick + " has left the building."});
		now.handleChannelMembers(clientId_user_);
	};
	now.handleMemberRename = function(member, clientId_user_) {
		var oldNick = clientId_user[member.clientId].nick;
		var newNick = member.nick;
		chatter.addMessage({text: oldNick + " renamed to " + newNick + "."});
		now.handleChannelMembers(clientId_user_);
	};
	now.handleAdmin = function(member, clientId_user_) {
		chatter.addMessage({text: member.nick + " is now admin, bow to your new overlord."});
		now.handleChannelMembers(clientId_user_);
	};

	now.handleMoveState = function(nick, moveState) {
		gui.handleMoveState(nick, moveState);
	};

	now.handleMessages = function(messages) {
		for(var i = 0; i < messages.length; i++) {
			chatter.addMessage(messages[i]);
		}
	};

	this.sendMessage = function(msg) {
		now.sendMessage(msg);
	};

	this.sendGameInfo = function() {
		assert(myself);
		assert(myself.admin);
		var gameInfo = gui.getGameInfo();
		now.sendGameInfo(gameInfo, errorHandler('sendGameInfo'));
	};

	this.sendRandomState = function(scramble) {
		assert(myself);
		assert(myself.admin);
		now.sendRandomState(scramble, errorHandler('sendRandomState'));
	};

	this.sendMoveState = function(moveState) {
		now.sendMoveState(moveState, errorHandler('sendMoveState'));
	};

	this.joinChannel = function(nick_, channelName_) {
		var desiredNick = nick_ || that.getMyNick() || "Player";
		var desiredChannelName = channelName_ || that.getChannelName() || "PimpsAtSea";
		if(desiredNick == that.getMyNick() && desiredChannelName == that.getChannelName()) {
			StatusBar.setError('joinChannel', null);
			StatusBar.setError('handleGameInfo', null);
			StatusBar.setError('handleChannelMembers', null);
			return;
		}

		var renameAttempt = desiredChannelName == that.getChannelName();

		var joinAttemptMessage = null;
		if(renameAttempt) {
			//joinAttemptMessage = 'Renaming to new nick ' + desiredNick + '.';
			var nop; // TODO - jslint!
		} else {
			chatter.clear();
			joinAttemptMessage = 'Joining channel #' + desiredChannelName + ' as ' + desiredNick + '.';
			chatter.addMessage({text: joinAttemptMessage});
		}
		StatusBar.setError('joinChannel', joinAttemptMessage);
		StatusBar.setError('handleGameInfo', 'Waiting...');
		StatusBar.setError('handleChannelMembers', 'Waiting...');
		now.joinChannel(desiredNick, desiredChannelName, function(error, nick_, channelName_) {
			gui.connectionChanged();
			if(!error) {
				if(!renameAttempt) {
					chatter.addMessage({text: 'Welcome to #' + channelName_ + "."});
				}
				StatusBar.setError('joinChannel', null);
			} else if(error == GM.NICK_IN_USE) {
				var prefix_intSuffix = desiredNick.match(/([^\d]*)(\d*)/);
				var prefix = prefix_intSuffix[1];
				var suffix = prefix_intSuffix[2];
				var newSuffix = null;
				if(suffix === '') {
					newSuffix = '1';
				} else {
					newSuffix = 1 + parseInt(suffix, 10);
				}
				var newDesiredNick = prefix + newSuffix;
				var retryMessage = 'Nick ' + desiredNick + ' in use, attempting ' + newDesiredNick + '.';
				chatter.addMessage({text: retryMessage});
				StatusBar.setError('joinChannel', retryMessage);
				that.joinChannel(newDesiredNick, desiredChannelName);
			} else {
				assert(false, "Unrecognized error " + error);
			}
		});
	};

	function errorHandler(errorType) {
		return function(error) {
			// TODO - retrieve nick from server & update gui?
			// TODO - disable gui?
			if(error) {
				StatusBar.setError(errorType, error);
			} else {
				StatusBar.setError(errorType, null);
			}
		};
	}

	var that = this;
};

})();
