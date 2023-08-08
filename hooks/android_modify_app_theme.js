#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function modifyManifest() {
    // Path to AndroidManifest.xml
    const manifestPath = path.join('platforms', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

    // Read the file
    fs.readFile(manifestPath, 'utf8', function(err, data) {
        if (err) {
            console.error('Failed to read AndroidManifest.xml:', err);
            return;
        }

        // Replace the desired string
        const updatedData = data.replace('@style/Theme.App.SplashScreen', '@style/AppTheme');

        // Write the updated content back to the file
        fs.writeFile(manifestPath, updatedData, 'utf8', function(err) {
            if (err) {
                console.error('Failed to write to AndroidManifest.xml:', err);
                return;
            }
            console.log('Modified AndroidManifest.xml successfully');
        });
    });
}

// If the script is run directly, execute the function
if (require.main === module) {
    modifyManifest();
}

// Export the function for external use
module.exports = modifyManifest;
