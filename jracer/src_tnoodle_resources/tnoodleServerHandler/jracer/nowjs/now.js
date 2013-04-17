var now = {};

(function() {

        now.core = {};
        now.core.clientId = 4242;
        now.core.user = null;

        var loaded = false;
        window.addEventListener('load', function() {
                loaded = true;
                for(var i = 0; i < readyCallbacks.length; i++) {
                        readyCallbacks[i]();
                }
        }, false);

        var readyCallbacks = [];
        now.ready = function(readyCallback_) {
                readyCallbacks.push(readyCallback_);
                if(loaded) {
                        readyCallback_();
                }
        };

        now.ping = function(callback) {
                callback();
        };

        now.joinChannel = function(desiredNick, desiredChannelName, callback) {
                var error = null;

                var clientId_user = {};
                now.core.user = {
                        nick: desiredNick,
                        clientId: now.core.clientId,
                        joinTime: new Date().getTime(),
                        channel: { channelName: desiredChannelName },
                        admin: true
                };
                clientId_user[now.core.user.clientId] = now.core.user;
                now.handleChannelMembers(clientId_user);
                callback(error, desiredNick, desiredChannelName);
        };

        // The following is copied straight from noderacer.js
        function authenticate_authorize(func, authorize) {
                return function() {
                        // The last argument to each function must be a callback
                        var args = [];
                        for(var i = 0; i < arguments.length; i++) {
                                args[i] = arguments[i];
                        }
                        var callback = args[args.length-1];
                        /*
                           var user = users.getUserByClientId(this.user.clientId);
                           if(!user) {
                           callback("User for clientId " + this.user.clientId + " not found");
                           return;
                           }
                           if(authorize && !user.admin) {
                           callback("User " + user.nick + " not admin");
                           return;
                           }
                           */
                        var user = now.core.user;

                        args.unshift(user);
                        func.apply(this, args);
                };
        }
        function auth(func) {
                return authenticate_authorize(func, false);
        }
        function auth_admin(func) {
                return authenticate_authorize(func, true);
        }

        now.sendGameInfo = auth_admin(function(user, gameInfo, callback) {
                now.handleGameInfo(gameInfo);
        });

        now.sendRandomState = auth_admin(function(user, randomState, callback) {
                now.handleRandomState(randomState);
        });

        now.sendMoveState = auth(function(user, moveState, callback) {
                now.handleMoveState(user, moveState);
        });

        now.sendMessage = auth(function(user, msg) {
                // We don't simulate the node server here, because this gives the user
                // a visual indicator that they're not connected to the server.
        });
})();
