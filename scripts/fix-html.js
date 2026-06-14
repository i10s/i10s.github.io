#!/usr/bin/env node
/**
 * Fix common HTML validation issues across all primary pages:
 * - Remove self-closing slashes from void elements
 * - Remove trailing whitespace
 * - Ensure trailing newline
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const files = [
  'index.html',
  'resume.html',
  'now.html',
  '404.html',
  'offline.html',
  'privacy.html',
  'stats.html',
  'security-policy.html',
  'security-acknowledgments.html'
];

const voidElements = [
  'meta', 'link', 'br', 'hr', 'img', 'input',
  'area', 'base', 'col', 'embed', 'param',
  'source', 'track', 'wbr'
];

let touched = 0;

files.forEach(file => {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) return;

  const original = fs.readFileSync(filePath, 'utf8');
  let html = original;

  voidElements.forEach(element => {
    const regex = new RegExp(`<${element}([^>]*?)\\s*/>`, 'g');
    html = html.replace(regex, `<${element}$1>`);
  });

  html = html.split('\n').map(line => line.trimEnd()).join('\n');
  if (!html.endsWith('\n')) html += '\n';

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    touched++;
    console.log(`Fixed ${file}`);
  }
});

console.log(touched ? `Done. ${touched} file(s) updated.` : 'Nothing to fix.');
