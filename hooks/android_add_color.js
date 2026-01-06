#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function addColorToXml(context) {
    // Parse input arguments to get the color value
    const args = process.argv;
    let hexColor = null;

    // Try to read from process.argv first
    for (const arg of args) {
        if (arg.includes('SPLASH_BACKGROUND_COLOR')) {
            var stringArray = arg.split("=");
            hexColor = stringArray.slice(-1).pop();
        }
    }

    // Fallback: Read from config.xml if not in command-line args
    if (!hexColor || hexColor === "undefined" || hexColor === "null") {
        console.log("⚠️  SPLASH_BACKGROUND_COLOR not found in command-line args, reading from config.xml");
        try {
            const projectRoot = context ? context.opts.projectRoot : process.cwd();
            const configXmlPath = path.join(projectRoot, "config.xml");
            const configXml = fs.readFileSync(configXmlPath, "utf8");

            // Find the plugin section and extract SPLASH_BACKGROUND_COLOR variable
            const pluginMatch = configXml.match(/<plugin[^>]*name="com\.cordova\.plugin\.splashscreenvideo"[^>]*>[\s\S]*?<\/plugin>/i);
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

    console.log("→ Using splash background color:", hexColor);

    // Path to colors.xml
    const colorsXmlPath = path.join('platforms', 'android', 'app', 'src', 'main', 'res', 'values', 'colors.xml');

    // Read and modify colors.xml
    fs.readFile(colorsXmlPath, 'utf8', function(err, data) {
        if (err) {
            console.error('Failed to read colors.xml:', err);
            return;
        }

        // Add the new color
        const newColorEntry = `<color name="splash_background_color">${hexColor}</color>`;
        const updatedData = data.replace('</resources>', `    ${newColorEntry}\n</resources>`);

        // Write the updated content back to the file
        fs.writeFile(colorsXmlPath, updatedData, 'utf8', function(err) {
            if (err) {
                console.error('Failed to write to colors.xml:', err);
                return;
            }
            console.log('Added new color to colors.xml');
        });
    });

    // Path to themes.xml
    const themesXmlPath = path.join('platforms', 'android', 'app', 'src', 'main', 'res', 'values', 'themes.xml');

    // Read and modify themes.xml
    fs.readFile(themesXmlPath, 'utf8', function(err, data) {
        if (err) {
            console.error('Failed to read themes.xml:', err);
            return;
        }

        // Substitute the desired line
        const updatedData = data.replace('<item name="windowSplashScreenBackground">@color/cdv_splashscreen_background</item>', '<item name="windowSplashScreenBackground">@color/splash_background_color</item>');

        // Write the updated content back to the file
        fs.writeFile(themesXmlPath, updatedData, 'utf8', function(err) {
            if (err) {
                console.error('Failed to write to themes.xml:', err);
                return;
            }
            console.log('Modified themes.xml successfully');
        });
    });
}

// If the script is run directly, execute the function
if (require.main === module) {
    addColorToXml();
}

// Export the function for external use
module.exports = addColorToXml;
