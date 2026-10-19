#!/usr/bin/env node

/**
 * Asset stamping: appends a content hash to /flap.js references (?v=xxxxxxxx)
 * in every page and in the service worker precache list, so browsers, Cloudflare
 * and the service worker can never pair new HTML with a stale script.
 *
 * Usage:
 *   npm run stamp                       # rewrite references
 *   node scripts/stamp-assets.js --check   # exit 1 if a reference is stale
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const ASSET = 'flap.js';
const FILES = ['index.html', 'now.html', '404.html', 'offline.html', 'sw.js'];
const PATTERN = /\/flap\.js(?:\?v=[0-9a-f]+)?(?=["'])/g;

const hash = () => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, ASSET))).digest('hex').slice(0, 8);
const stampedUrl = () => `/${ASSET}?v=${hash()}`;

function stamp(check) {
  const url = stampedUrl();
  const stale = [];
  FILES.forEach(file => {
    const filePath = path.join(root, file);
    const original = fs.readFileSync(filePath, 'utf8');
    const refs = original.match(PATTERN) || [];
    if (!refs.length) throw new Error(`${file} does not reference /${ASSET}`);
    if (refs.every(ref => ref === url)) return;
    stale.push(file);
    if (!check) fs.writeFileSync(filePath, original.replace(PATTERN, url), 'utf8');
  });
  return { url, stale };
}

module.exports = { stampedUrl, stamp };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const { url, stale } = stamp(check);
  if (check && stale.length) {
    console.error(`✗ Stale ${ASSET} references in: ${stale.join(', ')}. Run: npm run stamp`);
    process.exit(1);
  }
  console.log(stale.length ? `✓ Stamped ${url} in ${stale.join(', ')}` : `✓ ${url} is up to date`);
}
