const fs = require('fs');
const path = require('path');
const source = path.join(__dirname, '../node_modules/spessasynth_lib/dist/spessasynth_processor.min.js');
const destination = path.join(__dirname, '../js/spessasynth_processor.min.js');
try {
    const destDir = path.dirname(destination);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(source, destination);
    console.log('SpessaSynth processor copied successfully (Native FS)');
} catch (err) {
    console.error('Error copying processor:', err.message);
    process.exit(1);
}