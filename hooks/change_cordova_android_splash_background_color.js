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
      var stylesXML = path.join(context.opts.projectRoot, "platforms", "android", "app", "src", "main", "res", "values", "styles.xml");
    console.log("✅ stylesXML: " + stylesXML);    
    if (fs.existsSync(stylesXML)) {
     
      fs.readFile(stylesXML, 'utf8', function (err,data) {
        
        if (err) {
          throw new Error('🚨 Unable to read styles.xml: ' + err);
        }
        
        const args = process.argv
        var hexColor;
        for (const arg of args) {  
          if (arg.includes('SPLASH_BACKGROUND_COLOR')){
            var stringArray = arg.split("=");
            hexColor = stringArray.slice(-1).pop();
          }
        }
        
        var result = data;
        result = data.replace(/SPLASH_BACKGROUND_COLOR_PLACEHOLDER/g, hexColor);
        
        fs.writeFile(stylesXML, result, 'utf8', function (err) {
          if (err) 
            {throw new Error('🚨 Unable to write into styles.xml: ' + err);}
          else 
            {console.log("✅ styles.xml edited successfuly");}
        });
      });
    } else {
        throw new Error("🚨 WARNING: styles.xml was not found. The build phase may not finish successfuly");
    }
  }
