// This script ensures the extension has the correct manifest and icon files
const fs = require('fs');
const path = require('path');

// Check if dist directory exists
if (!fs.existsSync('./dist')) {
  console.error('Error: dist directory does not exist. Please run npm run build first.');
  process.exit(1);
}

// Ensure the icons directory exists in dist
if (!fs.existsSync('./dist/icons')) {
  fs.mkdirSync('./dist/icons', { recursive: true });
  console.log('Created icons directory in dist');
}

// Copy manifest.json if it exists
if (fs.existsSync('./public/manifest.json')) {
  fs.copyFileSync('./public/manifest.json', './dist/manifest.json');
  console.log('Copied manifest.json to dist');
} else {
  console.error('Warning: manifest.json not found in public directory');
}

// Copy icon files if they exist
const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  const iconPath = `./public/icons/icon${size}.png`;
  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, `./dist/icons/icon${size}.png`);
    console.log(`Copied icon${size}.png to dist/icons`);
  } else {
    console.warn(`Warning: icon${size}.png not found`);
  }
});

console.log('Extension packaging complete. Load the dist directory in Chrome extensions page.'); 