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

function hexToDecimalRGB(hex) {
    // Ensure the hex color begins with a hashtag.
    if (hex.charAt(0) !== '#') {
        hex = '#' + hex;
    }

    // Remove the hashtag if present.
    let cleanHex = hex.replace('#', '');

    // Convert the clean hex color to an RGB color.
    let r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    let g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    let b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    // Ensure the values are in the requested precision
    r = Number.parseFloat(r).toFixed(20);
    g = Number.parseFloat(g).toFixed(20);
    b = Number.parseFloat(b).toFixed(20);

    return {
        red: r,
        green: g,
        blue: b
    };
}


module.exports = function(context) {
      var projectName = getProjectName();
      var CDVLaunchScreen = path.join(context.opts.projectRoot, "platforms", "ios", projectName, "CDVLaunchScreen.storyboard");
    console.log("✅ CDVLaunchScreen: " + CDVLaunchScreen);    
    if (fs.existsSync(CDVLaunchScreen)) {
     
      fs.readFile(CDVLaunchScreen, 'utf8', function (err,data) {
        
        if (err) {
          throw new Error('🚨 Unable to read CDVLaunchScreen.storyboard: ' + err);
        }
        
        const args = process.argv
        var hexColor;
        for (const arg of args) {  
          if (arg.includes('SPLASH_BACKGROUND_COLOR')){
            var stringArray = arg.split("=");
            hexColor = stringArray.slice(-1).pop();
          }
        }
        let rgbColor = hexToDecimalRGB(hexColor);

        var result = data;
        result = data.replace(/<color key=\"backgroundColor\" name=\"BackgroundColor\"\/>/g, '<color key="backgroundColor" red="' + rgbColor.red + '" green="' + rgbColor.green + '" blue="' + rgbColor.blue + '" alpha="1" colorSpace="custom" customColorSpace="displayP3"/>');
        
        fs.writeFile(CDVLaunchScreen, result, 'utf8', function (err) {
          if (err) 
            {throw new Error('🚨 Unable to write into CDVLaunchScreen.storyboard: ' + err);}
          else 
            {console.log("✅ CDVLaunchScreen.storyboard edited successfuly");}
        });
      });
    } else {
        throw new Error("🚨 WARNING: CDVLaunchScreen.storyboard was not found. The build phase may not finish successfuly");
    }
  }
