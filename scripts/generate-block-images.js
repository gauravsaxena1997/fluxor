/**
 * Script to download sample block page images
 * 
 * This is a temporary script to set up sample placeholder images
 * for the block page. In a production environment, you would
 * create custom images tailored to your application.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get current file directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../src/assets/block-images');

// Sample placeholder image URLs (these are just examples)
// In a real implementation, you'd use your own custom images
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // workspace with laptop closed
  'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // person climbing mountain
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // productive workspace
  'https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // notebook with goals
  'https://images.unsplash.com/photo-1565843708714-52ecf69ab81f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // stop sign
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // productive workspace
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // person on mountain
  'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // alarm clock focus
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // closed sign
  'https://images.unsplash.com/photo-1522198734915-76c764a8454d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80', // do not enter sign
];

// Ensure the directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`Created directory: ${IMAGES_DIR}`);
}

// Download images
PLACEHOLDER_IMAGES.forEach((url, index) => {
  const fileName = `block${index + 1}.jpg`;
  const filePath = path.join(IMAGES_DIR, fileName);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`${fileName} already exists, skipping...`);
    return;
  }
  
  console.log(`Downloading ${fileName}...`);
  
  const file = fs.createWriteStream(filePath);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${fileName}`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {}); // Delete the file if there's an error
    console.error(`Error downloading ${fileName}: ${err.message}`);
  });
});

console.log('Image download script initiated. Please wait for all downloads to complete...');
console.log('Note: These are placeholder images. For production, replace with your own custom images.'); 