#!/usr/bin/env node

/**
 * Social Media Card Generator
 * Creates HTML templates for Open Graph images
 * Can be screenshot using browser dev tools or Playwright
 */

const fs = require('fs');
const path = require('path');

const cards = [
  {
    filename: 'og-home.html',
    title: 'Iñaki Fuentes',
    subtitle: 'Site Reliability Engineer',
    description: 'Building reliable systems, one commit at a time.',
    color: '#2563eb'
  },
  {
    filename: 'og-resume.html',
    title: 'Iñaki Fuentes',
    subtitle: 'Resume',
    description: 'Site Reliability Engineer · Cloud Infrastructure · DevOps',
    color: '#7c3aed'
  },
  {
    filename: 'og-now.html',
    title: 'What I\'m Doing Now',
    subtitle: 'Iñaki Fuentes',
    description: 'Current projects, focus areas, and updates.',
    color: '#059669'
  }
];

const template = (card) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1200, initial-scale=1">
  <title>${card.title} - Social Card</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1200px;
      height: 630px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, ${card.color} 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: white;
      overflow: hidden;
    }
    
    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }
    
    .title {
      font-size: 72px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.1;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .subtitle {
      font-size: 42px;
      font-weight: 400;
      margin-bottom: 30px;
      opacity: 0.9;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }
    
    .description {
      font-size: 32px;
      font-weight: 300;
      line-height: 1.5;
      opacity: 0.85;
      max-width: 900px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.05;
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.1) 10px,
        rgba(255, 255, 255, 0.1) 20px
      );
      pointer-events: none;
    }
    
    .logo {
      position: absolute;
      bottom: 40px;
      right: 40px;
      font-size: 28px;
      font-weight: 600;
      opacity: 0.6;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="pattern"></div>
    <h1 class="title">${card.title}</h1>
    <h2 class="subtitle">${card.subtitle}</h2>
    <p class="description">${card.description}</p>
    <div class="logo">IFUENTES.NET</div>
  </div>
</body>
</html>`;

// Create cards directory
const cardsDir = path.join(__dirname, '..', 'cards');
if (!fs.existsSync(cardsDir)) {
  fs.mkdirSync(cardsDir, { recursive: true });
}

// Generate card templates
cards.forEach(card => {
  const filepath = path.join(cardsDir, card.filename);
  fs.writeFileSync(filepath, template(card), 'utf8');
  console.log(`✓ Generated ${card.filename}`);
});

console.log('\n📸 To create PNG images from these cards:');
console.log('1. Open each HTML file in a browser (1200x630 viewport)');
console.log('2. Take a screenshot or use browser dev tools');
console.log('3. Save as og-home.png, og-resume.png, og-now.png');
console.log('\nAlternatively, install Playwright for automated screenshots:\n');
console.log('  npm install --save-dev playwright');
console.log('  npx playwright screenshot cards/og-home.html og-home.png --viewport-size=1200,630\n');
