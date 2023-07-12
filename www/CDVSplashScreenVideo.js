var exec = require('cordova/exec');

exports.setCallback = function (arg0, success, error) {
    exec(success, error, 'CDVSplashScreenVideo', 'setCallback', [arg0]);
};
