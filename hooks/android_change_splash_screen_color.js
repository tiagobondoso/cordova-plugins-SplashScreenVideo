const fs = require('fs');
const xml2js = require('xml2js');
const js2xmlparser = require("js2xmlparser");
const path = require('path');

module.exports = function(context) {
    const xmlPath = path.join('platforms', 'android', 'app', 'src', 'main', 'res', 'values', 'colors.xml');
    const newColor = '#4296f5'; // replace with the color you want

    fs.readFile(xmlPath, 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }

        xml2js.parseString(data, function(err, result) {
            if (err) {
                return console.log(err);
            }

            // Assuming the color tag is always in the same place
            result.resources.color[0]._ = newColor;

            const xml = js2xmlparser.parse("resources", result.resources);
            fs.writeFile(xmlPath, xml, function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log('The color has been updated successfully!');
            });
        });
    });
};
