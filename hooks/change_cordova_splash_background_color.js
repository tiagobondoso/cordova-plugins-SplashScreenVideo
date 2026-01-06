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

        // Try to read from process.argv first
        for (const arg of args) {
          if (arg.includes('SPLASH_BACKGROUND_COLOR')){
            var stringArray = arg.split("=");
            hexColor = stringArray.slice(-1).pop();
          }
        }

        // Fallback: Read from config.xml if not in command-line args
        if (!hexColor || hexColor === "undefined" || hexColor === "null") {
          console.log("⚠️  SPLASH_BACKGROUND_COLOR not found in command-line args, reading from config.xml");
          try {
            const configXmlPath = path.join(context.opts.projectRoot, "config.xml");
            const configXml = fs.readFileSync(configXmlPath, "utf8");

            // Find the plugin section and extract SPLASH_BACKGROUND_COLOR variable
            // Note: config.xml uses package name (CDVSplashScreenVideo), not plugin ID
            const pluginMatch = configXml.match(/<plugin[^>]*name="CDVSplashScreenVideo"[^>]*>[\s\S]*?<\/plugin>/i);
            if (pluginMatch) {
              const pluginSection = pluginMatch[0];
              const colorMatch = pluginSection.match(/<variable\s+name="SPLASH_BACKGROUND_COLOR"\s+value="([^"]+)"/i);
              if (colorMatch) {
                hexColor = colorMatch[1];
                // Decode HTML entities
                hexColor = hexColor.replace(/&quot;/g, '"')
                                   .replace(/&amp;/g, '&')
                                   .replace(/&lt;/g, '<')
                                   .replace(/&gt;/g, '>');
                console.log("✅ SPLASH_BACKGROUND_COLOR loaded from config.xml:", hexColor);
              } else {
                console.error("🚨 SPLASH_BACKGROUND_COLOR variable not found in plugin section");
              }
            } else {
              console.error("🚨 Plugin section not found in config.xml");
            }
          } catch (e) {
            console.error("🚨 Failed to read SPLASH_BACKGROUND_COLOR from config.xml:", e.message);
          }
        }

        // Validate that we have a color value
        if (!hexColor || hexColor === "undefined" || hexColor === "null") {
          throw new Error("🚨 SPLASH_BACKGROUND_COLOR is required but not provided. Please configure it in the plugin settings.");
        }

        console.log("→ Using splash background color:", hexColor);
        let rgbColor = hexToDecimalRGB(hexColor);

        var result;
        result = data.replace(/<color key=\"backgroundColor\" name=\"BackgroundColor\"\/>/g, '<color key="backgroundColor" red="' + rgbColor.red + '" green="' + rgbColor.green + '" blue="' + rgbColor.blue + '" alpha="1" colorSpace="custom" customColorSpace="displayP3"/>');
        result = result.replace(/<imageView/g, '<imageView alpha="0"');

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
