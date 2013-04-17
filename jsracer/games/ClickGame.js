(function() {

        // This is a really stupid game where a button is filled with
        // a random number. Each click decrements the number by 1.
        // You are supposed to click the button until its value is 0.
        //
        // The point of this game is to demonstrate the basic api for creating
        // a game.

        var MAX_SCRAMBLE = 100;

        var ClickGame = function(moveCallback) {
                var buttonValue = null;
                this.setState = function(scramble) {
                        buttonValue = scramble;
                        gameButton.value = buttonValue;
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
                        gameButton.value = buttonValue;
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
                        gameDiv.setStyle('width', size.width);
                        gameDiv.setStyle('height', size.height);
                        // TODO - this doesn't take the horizontal width of the text into account
                        gameButton.setStyle('font-size', 0.75*size.height);
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
                        return gameDiv;
                };

                this.dispose = function() {
                   gameDiv.dispose();
                };

                var gameDiv = document.createElement('div');
                var gameButton = document.createElement('input');
                gameButton.type= 'button';
                gameButton.setStyle('width', '100%');
                gameButton.setStyle('height', '100%');
                gameDiv.appendChild(gameButton);
                gameButton.addEvent('click', function() {
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
