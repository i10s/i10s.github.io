#!/usr/bin/env node
/**
 * Fix HTML validation issues
 * - Remove self-closing slashes from void elements
 * - Remove trailing whitespace
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Remove self-closing slashes from void elements
const voidElements = [
  'meta', 'link', 'br', 'hr', 'img', 'input', 
  'area', 'base', 'col', 'embed', 'param', 
  'source', 'track', 'wbr'
];

voidElements.forEach(element => {
  // Match opening tag with self-closing slash
  const regex = new RegExp(`<${element}([^>]*?)\\s*/>`, 'g');
  html = html.replace(regex, `<${element}$1>`);
});

// Remove trailing whitespace
html = html.split('\n').map(line => line.trimEnd()).join('\n');

// Ensure file ends with newline
if (!html.endsWith('\n')) {
  html += '\n';
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ HTML validation issues fixed in index.html');
