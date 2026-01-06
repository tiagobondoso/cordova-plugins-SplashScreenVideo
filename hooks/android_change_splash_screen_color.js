const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const colorsXmlPath = path.join('platforms', 'android', 'app', 'src', 'main', 'res', 'values', 'colors.xml');

// Função para converter o arquivo XML em objeto JavaScript
function parseXmlFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      console.error('Error reading colors.xml:', err);
      return;
    }
    const parser = new xml2js.Parser();
    parser.parseString(data, callback);
  });
}

// Função para converter o objeto JavaScript em arquivo XML
function buildXmlFile(filePath, data, callback) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject(data);
  fs.writeFile(filePath, xml, callback);
}

// Função para modificar a cor da chave cdv_splashscreen_background no objeto JavaScript
function changeSplashScreenColor(data, newColor) {
  if (data.resources && data.resources.color) {
    const splashScreenColor = data.resources.color.find(color => color.$.name === 'cdv_splashscreen_background');
    if (splashScreenColor) {
      splashScreenColor._ = newColor;
    } else {
      data.resources.color.push({ _: newColor, $: { name: 'cdv_splashscreen_background' } });
    }
  }
}

module.exports = function(context) {
    var hexColor;

    // Try to read from command-line first
    if (context.cmdLine) {
        const args = context.cmdLine.split(' ');
        for (const arg of args) {
            if (arg.includes('SPLASH_BACKGROUND_COLOR')){
                var stringArray = arg.split("=");
                hexColor = stringArray.slice(-1).pop();
            }
        }
    }

    // Fallback: Read from config.xml if not in command-line
    if (!hexColor || hexColor === "undefined" || hexColor === "null") {
        console.log("⚠️  SPLASH_BACKGROUND_COLOR not found in command-line, reading from config.xml");
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
                }
            }
        } catch (e) {
            console.error("🚨 Failed to read SPLASH_BACKGROUND_COLOR from config.xml:", e.message);
        }
    }

    if (!hexColor || hexColor === "undefined" || hexColor === "null") {
        console.error('🚨 SPLASH_BACKGROUND_COLOR is required but not provided');
        return;
    }

    console.log(`→ Using splash background color: '${hexColor}' in 'colors.xml'.`);

    parseXmlFile(colorsXmlPath, function (err, data) {
        if (err) {
            console.error('Error parsing colors.xml:', err);
            return;
        }

        changeSplashScreenColor(data, hexColor);

        buildXmlFile(colorsXmlPath, data, function (err) {
            if (err) {
                console.error('Error writing colors.xml:', err);
                return;
            }
            console.log(`Splash screen background color has been changed to '${hexColor}' in 'colors.xml'.`);
            console.log(data);
        });
    });
};
