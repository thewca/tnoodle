var GameMasterGui = {};

(function() {

	var DEFAULT_INSPECTION = 15;
	var NO_READY_SET_GO_IF_INSPECTION = false;
	var DEFAULT_GAME = null;

	
	// These following are just for development!
	//var DEFAULT_GAME = '3x3x3';
	//var NO_READY_SET_GO_IF_INSPECTION = true;
	//var DEFAULT_INSPECTION = 2;

	// TODO - loading with a scrollbar looks weird

	GameMasterGui.GameMasterGui = function(gameMaster) {
		var gamesDiv;

		var infoDiv;
		var gameDropdown;
		var scrambleButton;
		var inspectionSecondsField;
		gamesDiv = document.createElement('div');
		gamesDiv.setStyle('position', 'relative');
		gamesDiv.addClass('gamesDiv');
		infoDiv = document.createElement('div');
		infoDiv.addClass('info');

		var nickField = document.createElement('input');
		infoDiv.appendChild(nickField);
		infoDiv.appendChild(document.createTextNode('#'));
		var channelField = document.createElement('input');
		infoDiv.appendChild(channelField);
		infoDiv.appendChild(document.createElement('br'));

		function joinChannel() {
			var nick = nickField.value;
			var channel = channelField.value;
			gameMaster.joinChannel(nick, channel);
		}
		nickField.addEvent('change', joinChannel);
		channelField.addEvent('change', joinChannel);

		gameDropdown = document.createElement('select');
		var games = GameMaster.getGames();
		for(var gameName in games) {
			if(games.hasOwnProperty(gameName)) {
				var option = document.createElement('option');
				option.value = gameName;
				option.appendChild(document.createTextNode(gameName));
				gameDropdown.appendChild(option);
			}
		}
		if(DEFAULT_GAME) {
			// TODO - this is really just a hack for development
			gameDropdown.value = DEFAULT_GAME;
		}

		gameDropdown.addEvent('change', function(e) {
			gameMaster.sendGameInfo();
		});
		infoDiv.appendChild(gameDropdown);

		inspectionSecondsField = document.createElement('input');
		inspectionSecondsField.type = 'number';
		inspectionSecondsField.min = 0;
		inspectionSecondsField.value = '' + DEFAULT_INSPECTION;
		inspectionSecondsField.addEvent('change', function() {
			gameMaster.sendGameInfo();
		});
		infoDiv.appendChild(inspectionSecondsField);

		scrambleButton = document.createElement('input');
		scrambleButton.value = 'Scramble!';
		scrambleButton.type = 'button';
		scrambleButton.addEvent('click', function(e) {
			// TODO - what if they click scramble before we've generated boards?
			var myClientId = gameMaster.getMyself().clientId;
			var myBoard = gameBoards[myClientId];
			assert(myBoard);
			var randomState = myBoard.gameInstance.generateRandomState();
			gameMaster.sendRandomState(randomState);
		});
		infoDiv.appendChild(scrambleButton);

		var disabledDiv = document.createElement('div');
		disabledDiv.addClass("grayOut");
		disabledDiv.hide();

		var gameBoards = {};
		this.gameBoards = gameBoards; // This is just for debugging
		function pruneOldBoards() {
			// cleaning up old games
			gameInfo = gameMaster.getGameInfo();
			var game = gameMaster.getGame();
			var clientId_user = gameMaster.getChannelMembers();
			for(var clientId in gameBoards) {
				if(gameBoards.hasOwnProperty(clientId)) {
					var gameBoard = gameBoards[clientId];
					if(!(clientId in clientId_user)) {
						// This game board is for a user
						// who has left, so we can delete it.
						gamesDiv.removeChild(gameBoard.div);
						delete gameBoards[clientId];
					} else if(gameBoard.gameInstance.constructor.getGameName() != gameInfo.gameName) {
						// This game instance is the wrong type of game
						gameBoards[clientId].gameDiv.dispose();

						// TODO - this is worthy of a big comment
						gameBoards[clientId].gameInstance.setPlayable(false);
						delete gameBoards[clientId].gameInstance;
					}
				}
			}
		}
		function createNewBoards() {
			// creating new games
			var myMoveCallback = function(game, move, oldState) {
				var moveState = {
					move: move,
					oldState: oldState,
					finished: game.isFinished(),
					timestamp: new Date().getTime(),
					startstamp: startstamp
				};
				gameMaster.sendMoveState(moveState);
				that.moveApplied(moveState, myClientId);
			};
			var game = gameMaster.getGame();
			var clientId_user = gameMaster.getChannelMembers();
			for(var clientId in clientId_user) {
				if(clientId_user.hasOwnProperty(clientId)) {
					var user = clientId_user[clientId];
					var gameBoard = null;
					var nameDiv;
					if(clientId in gameBoards) {
						gameBoard = gameBoards[clientId];
						if(gameBoards[clientId].gameInstance) {
							assert(gameBoards[clientId].gameInstance.constructor.getGameName() == gameInfo.gameName);
						}
					} else {
						var containerDiv = document.createElement('span');
						containerDiv.setStyle('position', 'absolute');
						nameDiv = document.createElement('span');
						var timeDiv = document.createElement('span');
						timeDiv.setStyle('margin-left', 5);
						containerDiv.appendChild(nameDiv);
						containerDiv.appendChild(timeDiv);
						gameBoard = { div: containerDiv, nameDiv: nameDiv, timeDiv: timeDiv };
						gameBoards[clientId] = gameBoard;
						gamesDiv.appendChild(containerDiv);
					}
					if(!gameBoard.gameInstance) {
						var myClientId = gameMaster.getMyself().clientId;
						var gameInstance = null;
						if(clientId == myClientId) {
							gameInstance = new game(myMoveCallback);
						} else {
							gameInstance = new game();
						}
						if(clientId == myClientId) {
							// TODO - it should be possible to set a moveCallback
							// *after* the game has been constructed
							gameInstance.setPlayable(true);
						}

						gameBoard.gameInstance = gameInstance;
						gameBoard.gameDiv = gameInstance.getDiv();
						gameBoard.div.appendChild(gameBoard.gameDiv);
					}
					nameDiv = gameBoards[clientId].nameDiv;
					nameDiv.empty();
					nameDiv.appendText(user.nick);
					if(clientId_user[clientId].admin) {
						nameDiv.removeClass('nonAdminname');
						nameDiv.addClass('adminName');
					} else {
						nameDiv.addClass('nonAdminname');
						nameDiv.removeClass('adminName');
					}
				}
			}
		}
		function refresh() {
			var myself = gameMaster.getMyself();
			if(!gameMaster.isConnected()) {
				disabledDiv.show();
				return;
			}
			disabledDiv.hide();

			nickField.value = myself.nick;
			channelField.value = myself.channel.channelName;
			document.location.hash = myself.channel.channelName;
			if(myself.admin) {
				gameDropdown.disabled = false;	
				inspectionSecondsField.disabled = false;	
				scrambleButton.show();
			} else {
				gameDropdown.disabled = true;	
				inspectionSecondsField.disabled = true;	
				scrambleButton.hide();
			}
			var gameInfo = gameMaster.getGameInfo();
			gameDropdown.value = gameInfo.gameName;
			inspectionSecondsField.value = gameInfo.inspectionSeconds;

			pruneOldBoards();
			createNewBoards();
			pageResized();
		}
		function pageResized() {
			var game = gameMaster.getGame();
			if(!game) {
				return;
			}
			var myClientId = gameMaster.getMyself().clientId;
			var myBoard = gameBoards[myClientId];
			assert(myBoard);
			var nickHeight = myBoard.nameDiv.getSize().y;

			var THEM_ME_SCALE = 0.75;

			var clientIds = [];
			for(var clientId in gameBoards) {
				if(clientId != myClientId) {
					clientIds.push(clientId);
				}
			}


			// TODO - don't let nicks/times overflow? turn into marquee? lolol
			// TODO - To layout stuff optimally, I think we need to take the
			// aspect ratio of our available area into account.
			var preferredSize = game.getPreferredSize();
			var minSize = game.getMinimumSize();
			function toAtLeastMinimumSize(size, padding) {
				if('width' in size) {
					assert(!('height' in size));
					size.width = Math.min(availableSpace.width-padding.width, size.width);
					size.height = Math.min(availableSpace.height-padding.height, boardHeightToWidth*size.width);
					size.width = size.height/boardHeightToWidth;
				} else {
					assert('height' in size);
					assert(!('width' in size));
					size.height = Math.min(availableSpace.height-padding.height, size.height);
					size.width = Math.min(availableSpace.width-padding.width, size.height/boardHeightToWidth);
					size.height = boardHeightToWidth*size.width;
				}
				if(THEM_ME_SCALE*size.width < minSize.width) {
					size.width = minSize.width/THEM_ME_SCALE;
					size.height = minSize.height/THEM_ME_SCALE;
				}
				assert(THEM_ME_SCALE*size.width >= minSize.width);
				assert(THEM_ME_SCALE*size.height >= minSize.height);
				return size;
			}
			function scaleSize(scale, size) {
				return { width: scale*size.width, height: scale*size.height };
			}
			function copySize(size) {
				return scaleSize(1, size);
			}
			function addSizes(size1, size2) {
				var sum = {};
				sum.width = size1.width + size2.width;
				sum.height = size1.height + size2.height;
				return sum;
			}
			function diffSizes(size1, size2) {
				return addSizes(size1, scaleSize(-1, size2));
			}
			var boardHeightToWidth = preferredSize.height / preferredSize.width;

			var availableSpace = { 'width': gamesDiv.getSize().x, 'height': gamesDiv.getSize().y };
			var howManyBoards = { 'width': -1, 'height': -1 };
			var growDimension = (boardHeightToWidth >= 1) ? 'width' : 'height';
			var otherDimension = (growDimension == 'width') ? 'height' : 'width';

			if(growDimension == 'width') {
				gamesDiv.setStyle('overflow-x', 'auto');
				gamesDiv.setStyle('overflow-y', 'hidden');
			} else {
				gamesDiv.setStyle('overflow-x', 'hidden');
				gamesDiv.setStyle('overflow-y', 'auto');
			}

			var myBoardSize = null;
			var myActualBoardSize = null;
			var theirBoardSize = null;
			var theirActualBoardSize = null;
			var padding = { 'width': 0, 'height': nickHeight };
			while(myBoardSize === null || howManyBoards.width*howManyBoards.height < clientIds.length) {
				howManyBoards[growDimension]++;
				myBoardSize = {};
				myBoardSize[growDimension] = (availableSpace[growDimension]-(1+howManyBoards[growDimension])*padding[growDimension])/(1+THEM_ME_SCALE*howManyBoards[growDimension]);
				myBoardSize = toAtLeastMinimumSize(myBoardSize, padding);
				myActualBoardSize = copySize(myBoardSize);
				myActualBoardSize = addSizes(myActualBoardSize, padding);

				theirBoardSize = scaleSize(THEM_ME_SCALE, myBoardSize);
				theirActualBoardSize = copySize(theirBoardSize);
				theirActualBoardSize = addSizes(theirActualBoardSize, padding);
				// How many boards can we fit in the other dimension?
				howManyBoards[otherDimension] = Math.floor(availableSpace[otherDimension] / theirActualBoardSize[otherDimension]);
				if(howManyBoards[otherDimension] === 0) {
					// We must ensure that at least one board is allowed in the other
					// dimension, otherwise we'll never be able to fit any boards.
					howManyBoards[otherDimension] = 1;
				} else if(howManyBoards.width*howManyBoards.height < clientIds.length) {
					// Before we grow another unit, lets see if we could simply
					// tighten up inside of our allocated growDimension and make stuff
					// fit.
					howManyBoards[otherDimension]++;
					theirActualBoardSize[otherDimension] = availableSpace[otherDimension]/howManyBoards[otherDimension];
					theirBoardSize = copySize(theirActualBoardSize);
					theirBoardSize = diffSizes(theirBoardSize, padding);
					//TODO - comment!
					delete theirBoardSize[growDimension];
					theirBoardSize = toAtLeastMinimumSize(theirBoardSize, padding);
					theirActualBoardSize = copySize(theirBoardSize);
					theirActualBoardSize = addSizes(theirActualBoardSize, padding);
					if(theirActualBoardSize[otherDimension]*howManyBoards[otherDimension] > availableSpace[otherDimension]) {
						//TODO - comment!
						howManyBoards[otherDimension]--;
						continue;
					}
					var newGrowBoards = Math.floor((availableSpace[growDimension] - myActualBoardSize[growDimension]) / theirActualBoardSize[growDimension]);
					if(newGrowBoards != howManyBoards[growDimension]) {
						//TODO - comment!
						howManyBoards[otherDimension]--;
						continue;
					}
				}
			}
			howManyBoards[otherDimension] = Math.ceil(clientIds.length/howManyBoards[growDimension]);

			myBoard.gameInstance.setSize(myBoardSize);
			var toCss = { width: 'left', height: 'top' };
			var centerMyBoard = {};
			centerMyBoard[toCss[otherDimension]] = (availableSpace[otherDimension]-myActualBoardSize[otherDimension])/2;
			centerMyBoard[toCss[growDimension]] = Math.max(0, availableSpace[growDimension]-(myActualBoardSize[growDimension]+howManyBoards[growDimension]*theirActualBoardSize[growDimension]))/2;
			myBoard.div.setStyle('top', centerMyBoard.top);
			myBoard.div.setStyle('left', centerMyBoard.left);
			var offset = {};
			offset[growDimension] = myActualBoardSize[growDimension] + centerMyBoard[toCss[growDimension]];
			offset[otherDimension] = 0;
			var centerTheirBoard = {};
			centerTheirBoard[toCss[otherDimension]] = (availableSpace[otherDimension]-howManyBoards[otherDimension]*theirActualBoardSize[otherDimension])/2;
			centerTheirBoard[toCss[growDimension]] = 0;
			var boardIndex = 0;
			for(var i = 0; i < howManyBoards[otherDimension]; i++) {
				if(boardIndex >= clientIds.length) {
					break;
				}
				for(var j = 0; j < howManyBoards[growDimension]; j++) {
					clientId = clientIds[boardIndex];
					var gameBoard = gameBoards[clientId];
					gameBoard.gameInstance.setSize(theirBoardSize);
					var heightIndex = (otherDimension == 'height') ? i : j;
					gameBoard.div.setStyle('top', offset.height + heightIndex*theirActualBoardSize.height + centerTheirBoard.top);
					var widthIndex = (otherDimension == 'width') ? i : j;
					gameBoard.div.setStyle('left', offset.width + widthIndex*theirActualBoardSize.width + centerTheirBoard.left);
					boardIndex++;
					if(boardIndex >= clientIds.length) {
						// Gah, why doesn't every language have labelled breaks?
						break;
					}
				}
			}
			assert(boardIndex == clientIds.length);
		}

		var readySetGoDiv = document.createElement('div');
		readySetGoDiv.addClass("readySetGo");
		readySetGoDiv.hide();
		gamesDiv.appendChild(readySetGoDiv);

		var readySetGoStart = null;
		function startReadySetGo() {
			if(NO_READY_SET_GO_IF_INSPECTION) {
				var gameInfo = gameMaster.getGameInfo();
				if(gameInfo.inspectionSeconds > 0) {
					startInspection();
					return;
				}
			}
			readySetGoStart = new Date().getTime();
			refreshReadySetGo();
		}
		var readySetGo = [ '', '???', 'Set', 'Ready' ];
		function refreshReadySetGo() {
			var halfSecondsUsed = Math.floor((new Date().getTime() - readySetGoStart)/500);
			var timeRemaining = (readySetGo.length - 1) - halfSecondsUsed;
			if(timeRemaining <= 0) {
				readySetGoDiv.hide();
				startInspection();
				return;
			}
			var gameInfo = gameMaster.getGameInfo();
			if(gameInfo.inspectionSeconds === 0) {
				readySetGo[1] = 'Go!';
			} else {
				readySetGo[1] = 'Inspect';
			}
			var phrase = readySetGo[timeRemaining];
			var phraseHeightToWidth = 1.5 / phrase.length;
			var fontSizeContrainedByWidth = readySetGoDiv.getSize().x * phraseHeightToWidth;
			var fontSize = Math.min(fontSizeContrainedByWidth, readySetGoDiv.getSize().y);
			readySetGoDiv.empty();
			readySetGoDiv.appendText(phrase);
			readySetGoDiv.setStyle('font-size', fontSize);
			readySetGoDiv.setStyle('padding-top', (gamesDiv.getSize().y - fontSize)/2);
			readySetGoDiv.show();
			
			setTimeout(refreshReadySetGo, 100);
		}

		var inspectionStart = null;
		function startInspection() {
			startstamp = null;
			inspectionStart = new Date().getTime();
			for(var clientId in gameBoards) {
				if(gameBoards.hasOwnProperty(clientId)) {
					var gameBoard = gameBoards[clientId];
					gameBoard.solveTime = null;
				}
			}
			// TODO - is this actually the right place to call startInspection(),
			// we don't want them to do any moves while we're saying "ready, set, go".
			var myBoard = gameBoards[gameMaster.getMyClientId()];
			myBoard.gameInstance.startInspection();
			refreshTimers();
		}
		function getMyBoard() {
			return gameBoards[gameMaster.getMyself().clientId].gameInstance;
		}
		var startstamp = null;
		function refreshTimers() {
			if(!inspectionStart && !startstamp) {
				return;
			}
			var secondsUsed = Math.floor((new Date().getTime() - inspectionStart)/1000);
			var gameInfo = gameMaster.getGameInfo();
			var timeRemaining = gameInfo.inspectionSeconds - secondsUsed;

			var timerText = null;
			var delayUntilNextRefresh = null;
			var inspecting = (timeRemaining > 0);
			if(inspecting) {
				timerText = timeRemaining;
				delayUntilNextRefresh = 100;
			} else {
				var now = new Date().getTime();
				if(!startstamp) {
					startstamp = now;
					getMyBoard().endInspection();
					inspectionStart = null;
				}
				timerText = ((now-startstamp)/1000).toFixed(2);
			}

			for(var clientId in gameBoards) {
				if(gameBoards.hasOwnProperty(clientId)) {
					var gameBoard = gameBoards[clientId];
					if(!gameBoard.solveTime && !delayUntilNextRefresh) {
						delayUntilNextRefresh = 10;
					}
					var text = gameBoard.solveTime ? gameBoard.solveTime.toFixed(2) + " seconds" : timerText;
					gameBoard.timeDiv.empty();
					gameBoard.timeDiv.appendText(text);
					if(inspecting) {
						gameBoard.timeDiv.setStyle('color', 'red');
					} else {
						gameBoard.timeDiv.setStyle('color', '');
					}
				}
			}
			if(delayUntilNextRefresh) {
				setTimeout(refreshTimers, delayUntilNextRefresh);
			}
		}

		this.handleGameInfo = function() {
			// We reset the timers if the game changes.
			inspectionStart = null;
			startstamp = null;
			for(var clientId in gameBoards) {
				if(gameBoards.hasOwnProperty(clientId)) {
					var gameBoard = gameBoards[clientId];
					gameBoard.solveTime = null;
					gameBoard.timeDiv.empty();
				}
			}

			refresh();
		};
		this.connectionChanged = function() {
			refresh();
		};
		this.getGameInfo = function() {
			var gameName = gameDropdown.value;
			var inspectionSeconds = parseInt(inspectionSecondsField.value, 10);
			return { gameName: gameName, inspectionSeconds: inspectionSeconds };
		};

		this.handleChannelMembers = function() {
			refresh();
		};

		this.handleRandomState = function() {
			var randomState = gameMaster.getRandomState();
			for(var clientId in gameBoards) {
				if(gameBoards.hasOwnProperty(clientId)) {
					gameBoards[clientId].gameInstance.setState(randomState);
				}
			}
			startReadySetGo();
		};

		// TODO - is this provided somewhere by javascript or jquery?
		function deepEquals(ar1, ar2) {
			if(typeof(ar1) != typeof(ar2)) {
				return false;
			}
			if(typeof(ar1) != "object") {
				return ar1 == ar2;
			}
			// TODO typeof(null) == "object", but Object.keys(null) blows up
			if(ar1 === null || ar2 === null) {
				return ar1 == ar2;
			}
			var k1 = Object.keys(ar1);
			var k2 = Object.keys(ar2);
			if(k1.length != k2.length) {
				return false;
			}
			for(var key in k1) {
				if(!deepEquals(ar1[key], ar2[key])) {
					return false;
				}
			}
			return true;
		}
		this.handleMoveState = function(user, moveState) {
			var gameBoard = gameBoards[user.clientId];
			assert(gameBoard, user.clientId + " doesn't appear in " + Object.keys(gameBoards));
			var gameInstance = gameBoard.gameInstance;
			assert(gameInstance);
			if(user.clientId != gameMaster.getMyself().clientId) {
				if(!deepEquals(gameInstance.getState(), moveState.oldState)) {
					// This is a tricky assertion here. Assuming no turns are 
					// dropped by nowjs, we should have a perfect image
					// of what all our fellow cubers are doing. However, Patricia
					// says she has witnessed this happening, so I'm commenting
					// it out. This decision should be revisted by someone with a
					// PHD in node and nowjs.
					//assert(gameInstance.getState().length == 0);
					gameInstance.setState(moveState.oldState);
				}
				assert(gameInstance.isLegalMove(moveState.move));
				gameInstance.applyMove(moveState.move);
				that.moveApplied(moveState, user.clientId);
			}
		};
		this.moveApplied = function(moveState, clientId) {
			// TODO - deal with games that start out finished?

			var gameBoard = gameBoards[clientId];
			assert(gameBoard, clientId + " doesn't appear in " + Object.keys(gameBoards));
			var gameInstance = gameBoard.gameInstance;
			if(moveState.finished && !gameBoard.solveTime) {
				var totalTime = (moveState.timestamp - moveState.startstamp)/1000;
				gameBoard.solveTime = totalTime;
			}
		};

		var boardAndInfoDiv = document.createElement('div');
		boardAndInfoDiv.appendChild(infoDiv);
		boardAndInfoDiv.appendChild(gamesDiv);
		boardAndInfoDiv.appendChild(disabledDiv);
		boardAndInfoDiv.setSize = function(width, height) {
			infoDiv.setStyle('width', width);
			var infoDivHeight = infoDiv.getSize().y;

			gamesDiv.setStyle('width', width);
			gamesDiv.setStyle('height', height - infoDivHeight);
			pageResized();
		};

		this.element = boardAndInfoDiv;
		var that = this;
	};

})();
