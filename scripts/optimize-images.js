#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts PNG/JPG images to WebP format for better compression
 * Maintains original images as fallbacks
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Images to optimize (relative to project root)
const imagesToOptimize = [
  'if.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'ifuentes.jpg',
  'bg.jpg',
  'images/avatar.jpg'
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

async function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch {
    return 0;
  }
}

async function convertToWebP(imagePath) {
  const fullPath = path.join(__dirname, '..', imagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}⚠ Skipping ${imagePath} (not found)${colors.reset}`);
    return;
  }
  
  const ext = path.extname(imagePath);
  const webpPath = fullPath.replace(ext, '.webp');
  
  const originalSize = await getFileSize(fullPath);
  
  try {
    // Use ImageMagick to convert with quality 85
    await execAsync(`convert "${fullPath}" -quality 85 "${webpPath}"`);
    
    const webpSize = await getFileSize(webpPath);
    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);
    
    console.log(`${colors.green}✓${colors.reset} ${imagePath}`);
    console.log(`  ${originalSize}KB → ${webpSize}KB (${savings}% smaller)`);
  } catch (error) {
    console.log(`${colors.yellow}✗ Failed to convert ${imagePath}: ${error.message}${colors.reset}`);
  }
}

async function generatePictureSnippets() {
  console.log(`\n${colors.bold}${colors.blue}HTML <picture> snippets:${colors.reset}\n`);
  
  imagesToOptimize.forEach(imagePath => {
    const ext = path.extname(imagePath);
    const webpPath = imagePath.replace(ext, '.webp');
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    
    console.log(`<!-- ${imagePath} -->`);
    console.log(`<picture>`);
    console.log(`  <source srcset="${webpPath}" type="image/webp">`);
    console.log(`  <source srcset="${imagePath}" type="${mimeType}">`);
    console.log(`  <img src="${imagePath}" alt="..." loading="lazy">`);
    console.log(`</picture>\n`);
  });
}

async function main() {
  console.log(`\n${colors.bold}${colors.blue}Image Optimization${colors.reset}\n`);
  console.log(`Converting ${imagesToOptimize.length} images to WebP format...\n`);
  
  for (const imagePath of imagesToOptimize) {
    await convertToWebP(imagePath);
  }
  
  await generatePictureSnippets();
  
  console.log(`${colors.green}${colors.bold}✓ Optimization complete!${colors.reset}\n`);
  console.log(`${colors.blue}Benefits:${colors.reset}`);
  console.log(`  • 25-35% smaller file sizes`);
  console.log(`  • Faster page loads`);
  console.log(`  • Better Core Web Vitals`);
  console.log(`  • Automatic fallback to PNG/JPG\n`);
}

main().catch(console.error);
