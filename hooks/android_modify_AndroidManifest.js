var fs = require('fs');
var xml2js = require('xml2js');
var builder = new xml2js.Builder();
var parser = new xml2js.Parser();

module.exports = function(context) {
    fs.readFile('./platforms/android/app/src/main/AndroidManifest.xml', function(err, data) {
        parser.parseString(data, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }

            var application = result['manifest']['application'][0];
            for (var activity of application['activity']) {
                if (activity['$']['android:name'] === "MainActivity" && activity['intent-filter']) {
                    var intentFilters = activity['intent-filter'];
                    var toRemoveIndex = -1;
                    for (var i = 0; i < intentFilters.length; i++) {
                        var intentFilter = intentFilters[i];
                        var hasMainAction = intentFilter['action'] && intentFilter['action'].some(a => a['$']['android:name'] === "android.intent.action.MAIN");
                        var hasLauncherCategory = intentFilter['category'] && intentFilter['category'].some(c => c['$']['android:name'] === "android.intent.category.LAUNCHER");
                        if (hasMainAction && hasLauncherCategory) {
                            toRemoveIndex = i;
                            break;
                        }
                    }
                    if (toRemoveIndex !== -1) {
                        intentFilters.splice(toRemoveIndex, 1);
                    }
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
