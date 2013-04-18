(function() {

    var constants = {};
    constants.NICK_IN_USE = 1;

    // Magic to make this work on both client and server.
    if(typeof(exports) == 'undefined') {
        window.GM = constants;
    } else {
        exports.GM = constants;
    }

})();
