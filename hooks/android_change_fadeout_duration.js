var fs = require('fs'), path = require('path');

function getProjectName() {
    var config = fs.readFileSync('config.xml').toString();
    var parseString = require('xml2js').parseString;
    var name;
    parseString(config, function (err, result) {
        name = result.widget.name.toString();
        const r = /\B\s+|\s+\B/g;  //Removes trailing and leading spaces
        name = name.replace(r, '');
    });
    return name || null;
}

function secondsToMilliseconds(seconds) {
  return Math.floor(seconds * 1000);
}

module.exports = function(context) {
      var projectName = getProjectName();
      var fadeOutXML = path.join(context.opts.projectRoot, "platforms", "android", "app", "src", "main", "res", "anim", "fade_out.xml");
    console.log("✅ fadeOutXML: " + fadeOutXML);    
    if (fs.existsSync(fadeOutXML)) {
     
      fs.readFile(fadeOutXML, 'utf8', function (err,data) {
        
        if (err) {
          throw new Error('🚨 Unable to read fade_out.xml: ' + err);
        }
        
        const args = process.argv
        var fadeDuration;
        for (const arg of args) {  
          if (arg.includes('FADE_DURATION')){
            var stringArray = arg.split("=");
            fadeDuration = stringArray.slice(-1).pop();
          }
        }
        
        fadeDuration = secondsToMilliseconds(fadeDuration);

        var result = data;
        result = data.replace(/FADE_DURATION_PLACEHOLDER/g, fadeDuration);
        
        fs.writeFile(fadeOutXML, result, 'utf8', function (err) {
          if (err) 
            {throw new Error('🚨 Unable to write into fade_out.xml: ' + err);}
          else 
            {console.log("✅ fade_out.xml edited successfuly");}
        });
      });
    } else {
        throw new Error("🚨 WARNING: fade_out.xml was not found. The build phase may not finish successfuly");
    }
  }
