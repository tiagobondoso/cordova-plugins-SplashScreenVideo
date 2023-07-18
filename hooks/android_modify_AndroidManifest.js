var fs = require('fs');
var xml2js = require('xml2js');
var builder = new xml2js.Builder();
var parser = new xml2js.Parser();

module.exports = function(context) {
    console.log("⚠️  ELVIS IS IN THE BUILDING ⚠️");
    fs.readFile('./platforms/android/app/src/main/AndroidManifest.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }

            var application = result['manifest']['application'][0];

            for (var activity of application['activity']) {
                if (activity['$']['android:name'] === "com.cordova.plugin.splashscreenvideo.CDVSplashScreenVideo") {
                    // Check if the intent-filter already exists, if not, create it
                    if (!activity['intent-filter']) {
                        activity['intent-filter'] = [];
                    }

                    // Add the intent-filter to the activity
                    activity['intent-filter'].push({
                        '$': { 'android:label': "@string/launcher_name" },
                        'action': [{ '$': { 'android:name': "android.intent.action.MAIN" } }],
                        'category': [{ '$': { 'android:name': "android.intent.category.LAUNCHER" } }]
                    });
                }
            }

            var xml = builder.buildObject(result);
            console.log("⭐️⭐️⭐️⭐️ AndroidManifest ⭐️⭐️⭐️\n " + xml);
            fs.writeFile('./platforms/android/app/src/main/AndroidManifest.xml', xml, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
}
