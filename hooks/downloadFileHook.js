#!/usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');
const path = require("path");

module.exports = function(context) {
    return new Promise((resolve, reject) => {
        // Get the command-line arguments passed to the plugin
        const args = process.argv;

        // Find the URL parameter from the arguments
        var url = null;
        for (const arg of args) {
          if (arg.includes('VIDEO_URL')){
            var stringArray = arg.split("=");
            url = stringArray.slice(-1).pop();
          }
        }

        // Fallback: Read from config.xml if not in command-line args
        if (!url || url === "undefined" || url === "null") {
            console.log("⚠️  VIDEO_URL not found in command-line args, reading from config.xml");
            try {
                const configXmlPath = path.join(context.opts.projectRoot, "config.xml");
                const configXml = fs.readFileSync(configXmlPath, "utf8");

                // Find the plugin section and extract VIDEO_URL variable
                // Note: config.xml uses package name (CDVSplashScreenVideo), not plugin ID
                const pluginMatch = configXml.match(/<plugin[^>]*name="CDVSplashScreenVideo"[^>]*>[\s\S]*?<\/plugin>/i);
                if (pluginMatch) {
                    const pluginSection = pluginMatch[0];
                    const urlMatch = pluginSection.match(/<variable\s+name="VIDEO_URL"\s+value="([^"]+)"/i);
                    if (urlMatch) {
                        url = urlMatch[1];
                        // Decode HTML entities
                        url = url.replace(/&quot;/g, '"')
                                 .replace(/&amp;/g, '&')
                                 .replace(/&lt;/g, '<')
                                 .replace(/&gt;/g, '>');
                        console.log("✅ VIDEO_URL loaded from config.xml:", url);
                    }
                }
            } catch (e) {
                console.error("🚨 Failed to read VIDEO_URL from config.xml:", e.message);
            }
        }

        // If the URL parameter is found, download the file
        if (url && url !== "undefined" && url !== "null") {
            console.log("⬇️ Downloading file from: ", url);

            var dest = path.join(context.opts.projectRoot,"plugins" ,"com.cordova.plugin.splashscreenvideo" ,"src" , "SplashScreen.mp4".toLowerCase());

            fetch(url)
                .then(response => {
                    const fileStream = fs.createWriteStream(dest);
                    response.body.pipe(fileStream);
                    response.body.on("error", (err) => {
                        console.error("🚨 Error writing to file:", err);
                        reject(err);
                    });
                    fileStream.on("finish", function() {
                        console.log('✅ File downloaded and saved to', dest);
                        resolve();
                    });
                })
                .catch(error => {
                    console.error("🚨 Error downloading the file:", error);
                    reject(error);
                });
        } else {
            console.error("🚨 URL parameter not found in arguments.");
            reject(new Error("URL parameter not found"));
        }
    });
};
