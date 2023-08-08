#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

module.exports = function(context) {
    
    const configPath = path.join(context.opts.projectRoot, 'config.xml');

    fs.readFile(configPath, 'utf8', function(err, data) {
        if (err) {
            throw new Error('Unable to find config.xml: ' + err);
        }

        parser.parseString(data, function (err, result) {
            if (err) {
                throw new Error('Unable to parse config.xml: ' + err);
            }

            const widgetId = result.widget.$.id;
            const javaPath = widgetId.replace(/\./g, path.sep);

            const platformRoot = path.join(context.opts.projectRoot, 'platforms/android');
            const mainActivityPath = path.join(platformRoot, 'app/src/main/java', javaPath, 'MainActivity.java');
            console.log("⭐️ mainActivityPath: " + mainActivityPath);

            fs.readFile(mainActivityPath, 'utf8', function(err, data) {
                if (err) {
                    throw new Error('Unable to find MainActivity.java: ' + err);
                }

                var result = data;
                result = data.replace(/import org.apache.cordova.*;/g, "import org.apache.cordova.*;\nimport com.cordova.plugin.splashscreenvideo.VideoDialogFragment;");
                result = result.replace(/in config.xml/g, "in config.xml\n\t\tVideoDialogFragment videoDialogFragment = new VideoDialogFragment();\n\t\tvideoDialogFragment.show(getSupportFragmentManager(), \"VideoDialogFragment\");");

                fs.writeFile(mainActivityPath, result, 'utf8', function(err) {
                    if (err) throw new Error('Unable to write into MainActivity.java: ' + err);
                });
            });
        });
    });
};
