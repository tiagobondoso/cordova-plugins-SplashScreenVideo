#!/usr/bin/env node

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

// Alterar o arquivo colors.xml com a nova cor de fundo
parseXmlFile(colorsXmlPath, function (err, data) {
  if (err) {
    console.error('Error parsing colors.xml:', err);
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

  changeSplashScreenColor(data, hexColor);

  buildXmlFile(colorsXmlPath, data, function (err) {
    if (err) {
      console.error('Error writing colors.xml:', err);
      return;
    }
    console.log(`Splash screen background color has been changed to '${hexColor}' in 'colors.xml'.`);
  });
});
