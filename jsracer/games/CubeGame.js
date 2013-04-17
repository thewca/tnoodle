(function() {

        function CubeGameCreator(DIMENSION) {

        var CubeGame = function(moveCallback) {
                var scrambling = false;
                var state = null;
                this.setState = function(state) {
                        state = state;
                        scrambling = true;
                        twistyScene.setState(state);
                        scrambling = false;
                };
                function keydown(e) {
                        assert(playable);

                        // We don't want to turn the cube if we're in a textarea or input field.
                        var focusedEl = document.activeElement.nodeName.toLowerCase();
                        var isEditing = focusedEl == 'textarea' || focusedEl == 'input';
                        if(isEditing) {
                                return;
                        }
                        
                        // TODO - get actual move
                        var twisty = twistyScene.getTwisty();
                        var move = twisty.moveForKey(twisty, e);
                        if(!move) {
                                return;
                        }
                        if(inspecting && !twisty.isInspectionLegalMove(twisty, move)) {
                                // Don't allow inspection illegal moves during inspection!
                                return;
                        }

                        assert(that.isLegalMove(move));
                        that.applyMove(move);
                }
                this.keydown = keydown; //debugging
                var playable = false;
                // TODO - add to basic game!
                this.setPlayable = function(playable_) {
                        if(playable != playable_) {
                                playable = playable_;
                                if(playable) {
                                        window.addEvent('keydown', keydown);
                                } else {
                                        window.removeEvent('keydown', keydown);
                                }
                        }
                };
                var inspecting = false;
                // TODO - add to basic game!
                this.startInspection = function() {
                        assert(playable);
                        inspecting = true;
                };
                this.endInspection = function() {
                        assert(playable);
                        inspecting = false;
                };
                this.applyMove = function(move) {
                        // Note that we don't call moveCallback from inside of applyMove.
                        // This is because the game framework uses this method to animate
                        // other people's games. TODO - move comment to basic game
                        assert(that.isLegalMove(move));
                        twistyScene.addMoves(move);
                        state = twistyScene.getFinalState();
                };
                this.getState = function() {
                        return state;
                };
                this.isFinished = function() {
                        var twisty = twistyScene.getTwisty();
                        return twisty.isSolved(twisty);
                };
                this.generateRandomState = function() {
                        var twisty = twistyScene.getTwisty();
                        return twisty.generateRandomState(twisty);
                };

                var size = null;
                this.setSize = function(size_) {
                        size = size_;
                        gameDiv.setStyle('width', size.width);
                        gameDiv.setStyle('height', size.height);
                        twistyScene.resize();
                };

                function resize() {}
                this.isLegalMove = function(move) {
                        return true;
                };
                this.getDiv = function() {
                        return gameDiv;
                };
                this.dispose = function() {
                   gameDiv.dispose();
                   window.removeEvent('keydown', keydown);
                };

                var gameDiv = document.createElement('div');
                gameDiv.setStyle('position', 'relative');
                // TODO - actually wait for twistyjs to load?
                var twistyScene = new twistyjs.TwistyScene();
                twistyScene.initializeTwisty({
                        type: "cube",
                        dimension: DIMENSION,
                        stickerWidth: 1.7
                });
                state = twistyScene.getState();
                var oldStates = [];
                twistyScene.addMoveListener(function(move, moveStarted) {
                        if(scrambling) {
                                return;
                        }
                        if(moveStarted) {
                                // Note that this assumes that turns finish animating
                                // in the order they were started. This seems like a reasonable
                                // assumption.
                                oldStates.push(twistyScene.getState());
                        } else {
                                var oldState = oldStates.shift();
                                if(moveCallback) {
                                        moveCallback(that, move, oldState);
                                }
                        }
                });

                gameDiv.appendChild(twistyScene.getDomElement());
                var that = this;

                this.setState(null);
        };

        // The following is a hack that gives us static methods on the game constructor.
        CubeGame.getPreferredSize = function() {
                return CubeGame.getMinimumSize();
        };
        CubeGame.getMinimumSize = function() {
                return { width: 200, height: 200 };
        };
        CubeGame.getGameName = function() { return DIMENSION + "x" + DIMENSION + "x" + DIMENSION; };

        return CubeGame;
        }

        for(var i = 2; i <= 5; i++) {
           GameMaster.addGame(CubeGameCreator(i));
        }

})();
