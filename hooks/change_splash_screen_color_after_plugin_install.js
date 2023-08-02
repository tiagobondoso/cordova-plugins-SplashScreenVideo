#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const themesXmlPath = path.join('platforms', 'android', 'app', 'src', 'main', 'res', 'values', 'themes.xml');

// Função para buscar e substituir a cor no arquivo themes.xml
module.exports = function(context) {
    fs.readFile(themesXmlPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading themes.xml:', err);
          return;
        }
    
        const args = process.argv
        var hexColor;
    
        for (const arg of args) {  
            if (arg.includes('SPLASH_BACKGROUND_COLOR')){
                var stringArray = arg.split("=");
                hexColor = stringArray.slice(-1).pop();
            }
        }
    
       console.log(`✅ New hex color :: '${hexColor}' in 'colors.xml'.`);
    
        const regex = /<item name="windowSplashScreenBackground">@color\/cdv_splashscreen_background<\/item>/g;
        const newContent = data.replace(regex, `<item name="windowSplashScreenBackground">${hexColor}</item>`);
    
        fs.writeFile(themesXmlPath, newContent, 'utf8', (err) => {
          if (err) {
            console.error('Error writing to themes.xml:', err);
            return;
          }
    
          console.log(`Splash screen background color has been changed to '${hexColor}' in 'themes.xml'.`);
        });
      });
}