#!/usr/bin/env node

/**
 * Performance Budget Monitor
 * Validates that HTML pages comply with budget.json constraints
 * Used in CI/CD to enforce performance standards
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Load budget.json configuration
 */
function loadBudget() {
  const budgetPath = path.join(__dirname, '..', 'budget.json');
  try {
    const budgetData = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
    return budgetData[0].resourceSizes.reduce((acc, item) => {
      acc[item.resourceType] = item.budget;
      return acc;
    }, {});
  } catch (error) {
    console.error(`${colors.red}Error loading budget.json:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch (error) {
    return 0;
  }
}

/**
 * Analyze a single HTML page
 */
function analyzePage(filePath, budget) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Calculate document size (HTML)
  const documentSize = getFileSize(filePath);
  
  // Count inline scripts (approximation)
  const scriptMatches = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  const scriptSize = scriptMatches.reduce((total, script) => {
    return total + (script.length / 1024);
  }, 0).toFixed(2);
  
  // Count inline styles (approximation)
  const styleMatches = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const styleSize = styleMatches.reduce((total, style) => {
    return total + (style.length / 1024);
  }, 0).toFixed(2);
  
  // Count images (external references only, not inline)
  const imageMatches = content.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
  const imageSize = imageMatches.reduce((total, img) => {
    const srcMatch = img.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith('data:')) {
      const imagePath = path.join(__dirname, '..', srcMatch[1]);
      return total + parseFloat(getFileSize(imagePath));
    }
    return total;
  }, 0).toFixed(2);
  
  const totalSize = (parseFloat(documentSize) + parseFloat(scriptSize) + parseFloat(styleSize) + parseFloat(imageSize)).toFixed(2);
  
  return {
    fileName,
    document: parseFloat(documentSize),
    script: parseFloat(scriptSize),
    stylesheet: parseFloat(styleSize),
    image: parseFloat(imageSize),
    total: parseFloat(totalSize)
  };
}

/**
 * Check if resource is within budget
 */
function checkBudget(size, budget, resourceType) {
  const isWithinBudget = size <= budget;
  const percentage = ((size / budget) * 100).toFixed(0);
  
  const status = isWithinBudget 
    ? `${colors.green}✓${colors.reset}` 
    : `${colors.red}✗${colors.reset}`;
  
  const color = isWithinBudget ? colors.green : colors.red;
  
  return {
    status,
    display: `${status} ${resourceType.padEnd(12)} ${color}${size.toFixed(2)}KB${colors.reset} / ${budget}KB (${percentage}%)`,
    isWithinBudget,
    percentage: parseInt(percentage)
  };
}

/**
 * Main execution
 */
function main() {
  console.log(`\n${colors.bold}${colors.cyan}Performance Budget Monitor${colors.reset}\n`);
  
  const budget = loadBudget();
  const pages = ['index.html', 'resume.html', 'now.html', '404.html'];
  
  let allPassed = true;
  const results = [];
  
  pages.forEach(page => {
    const pagePath = path.join(__dirname, '..', page);
    
    if (!fs.existsSync(pagePath)) {
      console.log(`${colors.yellow}Skipping ${page} (not found)${colors.reset}`);
      return;
    }
    
    console.log(`${colors.bold}${page}${colors.reset}`);
    const analysis = analyzePage(pagePath, budget);
    
    const checks = [
      checkBudget(analysis.document, budget.document, 'Document'),
      checkBudget(analysis.script, budget.script, 'Script'),
      checkBudget(analysis.stylesheet, budget.stylesheet, 'Stylesheet'),
      checkBudget(analysis.image, budget.image, 'Image'),
      checkBudget(analysis.total, budget.total, 'Total')
    ];
    
    checks.forEach(check => console.log(`  ${check.display}`));
    
    const pagePassed = checks.every(c => c.isWithinBudget);
    if (!pagePassed) {
      allPassed = false;
    }
    
    results.push({
      page,
      passed: pagePassed,
      total: analysis.total,
      budget: budget.total
    });
    
    console.log('');
  });
  
  // Summary
  console.log(`${colors.bold}Summary${colors.reset}`);
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const summaryColor = allPassed ? colors.green : colors.red;
  console.log(`${summaryColor}${passed}/${total} pages within budget${colors.reset}`);
  
  if (!allPassed) {
    console.log(`\n${colors.red}${colors.bold}Budget exceeded!${colors.reset} Please optimize before committing.\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}All pages within budget!${colors.reset}\n`);
    process.exit(0);
  }
}

main();
