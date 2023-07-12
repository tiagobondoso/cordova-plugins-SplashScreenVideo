var exec = require('cordova/exec');

exports.setCallback = function (success, error) {
    exec(success, error, 'CDVSplashScreenVideo', 'setCallback', []);
};

