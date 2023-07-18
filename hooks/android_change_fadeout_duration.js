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

module.exports = function(context) {
      var projectName = getProjectName();
      var fadeInXML = path.join(context.opts.projectRoot, "platforms", "android", "app", "src", "main", "res", "anim", "fade_in.xml");
    console.log("✅ fadeInXML: " + fadeInXML);    
    if (fs.existsSync(fadeInXML)) {
     
      fs.readFile(fadeInXML, 'utf8', function (err,data) {
        
        if (err) {
          throw new Error('🚨 Unable to read fade_in.xml: ' + err);
        }
        
        const args = process.argv
        var fadeDuration;
        for (const arg of args) {  
          if (arg.includes('FADE_DURATION')){
            var stringArray = arg.split("=");
            fadeDuration = stringArray.slice(-1).pop();
          }
        }
        
        var result = data;
        result = data.replace(/FADE_DURATION_PLACEHOLDER/g, fadeDuration);
        
        fs.writeFile(fadeInXML, result, 'utf8', function (err) {
          if (err) 
            {throw new Error('🚨 Unable to write into fade_in.xml: ' + err);}
          else 
            {console.log("✅ fade_in.xml edited successfuly");}
        });
      });
    } else {
        throw new Error("🚨 WARNING: fade_in.xml was not found. The build phase may not finish successfuly");
    }
  }
