#!/usr/bin/env node

/**
 * Asset stamping: appends a content hash to script references (?v=xxxxxxxx) in every page and in
 * the service worker precache list, so browsers, Cloudflare and the service worker can never pair
 * new HTML with a stale script.
 *
 * Usage:
 *   npm run stamp                          # rewrite references
 *   node scripts/stamp-assets.js --check   # exit 1 if a reference is stale
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');

// asset → files that reference it
const ASSETS = {
  'flap.js': ['index.html', 'now.html', '404.html', 'offline.html', 'sw.js'],
  'webmcp.js': ['index.html', 'resume.html', 'now.html', 'sw.js']
};

const hash = asset => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, asset))).digest('hex').slice(0, 8);
const stampedUrl = asset => `/${asset}?v=${hash(asset)}`;
const pattern = asset => new RegExp(`/${asset.replace(/\./g, '\\.')}(?:\\?v=[0-9a-f]+)?(?=["'])`, 'g');

function stamp(check) {
  const stale = [];
  const urls = {};
  Object.entries(ASSETS).forEach(([asset, files]) => {
    const url = stampedUrl(asset);
    urls[asset] = url;
    files.forEach(file => {
      const filePath = path.join(root, file);
      const original = fs.readFileSync(filePath, 'utf8');
      const refs = original.match(pattern(asset)) || [];
      if (!refs.length) throw new Error(`${file} does not reference /${asset}`);
      if (refs.every(ref => ref === url)) return;
      stale.push(`${file} (${asset})`);
      if (!check) fs.writeFileSync(filePath, original.replace(pattern(asset), url), 'utf8');
    });
  });
  return { urls, stale };
}

module.exports = { ASSETS, stampedUrl, stamp };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const { urls, stale } = stamp(check);
  if (check && stale.length) {
    console.error(`✗ Stale asset references in: ${stale.join(', ')}. Run: npm run stamp`);
    process.exit(1);
  }
  console.log(stale.length ? `✓ Stamped ${stale.join(', ')}` : `✓ ${Object.values(urls).join(', ')} up to date`);
}
