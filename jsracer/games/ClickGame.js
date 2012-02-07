(function() {

	// This is a really stupid game where a button is filled with
	// a random number. Each click decrements the number by 1.
	// You are supposed to click the button until its value is 0.
	//
	// The point of this game is to demonstrate the basic api for creating
	// a game.

	// Neat trick for loading game specific css
	/*
	var css = $('<link/>');
	css.attr({
		rel: "stylesheet",
		type: "text/css",
		href: "YOUR CSS FILENAME HERE"
	});
	$('head').append(css);
	*/

	var MAX_SCRAMBLE = 100;

	var ClickGame = function(moveCallback) {
		var buttonValue = null;
		this.setState = function(scramble) {
			buttonValue = scramble;
			gameButton.val(buttonValue);
		};
		var inspecting = false;
		this.startInspection = function() {
			inspecting = true;
		};
		this.endInspection = function() {
			inspecting = false;
		};
		var playable = false;
		this.setPlayable = function(playable_) {
			playable = playable_;
		};
		this.applyMove = function(move) {
			// Note that we don't call moveCallback from inside of applyMove.
			assert(that.isLegalMove(move));
			buttonValue = move - 1;
			gameButton.val(buttonValue);
		};
		this.getState = function() {
			return buttonValue;
		};
		this.isFinished = function() {
			return buttonValue === 0;
		};

		var size = null;
		this.setSize = function(size_) {
			size = size_;
			gameDiv.width(size.width);
			gameDiv.height(size.height);
			// TODO - this doesn't take the horizontal width of the text into account
			gameButton.css('font-size', 0.75*size.height);
		};
		this.generateRandomState = function() {
			return Math.floor(Math.random()*MAX_SCRAMBLE);
		};

		function resize() {}
		this.isLegalMove = function(move) {
			// This isn't really necessary for such a simple game, but
			// it does give us some confidence that stuff is working.
			return move == buttonValue;
		};
		this.getDiv = function() {
			return gameDiv[0];
		};

		var gameDiv = $(document.createElement('div'));
		var gameButton = $("<input type='button' />");
		gameButton.css('width', '100%');
		gameButton.css('height', '100%');
		gameDiv.append(gameButton);
		gameButton.click(function() {
			if(!playable || inspecting) {
				return;
			}
			var move = buttonValue;
			var oldState = that.getState();
			assert(that.isLegalMove(move));
			that.applyMove(move);
			if(moveCallback) {
				moveCallback(that, move, oldState);
			}
		});
		var that = this;

		this.setState(null);
	};

	// The following is a hack that gives us static methods on the game constructor.
	ClickGame.getPreferredSize = function() {
		return ClickGame.getMinimumSize();
	};
	ClickGame.getMinimumSize = function() {
		return { width: 20, height: 20 };
	};
	ClickGame.getGameName = function() { return "ClickGame"; };

	GameMaster.addGame(ClickGame);

})();
