#!/usr/bin/env node

/**
 * IndexNow submission (https://www.indexnow.org).
 * Tells Bing (and through it ChatGPT search, Copilot and DuckDuckGo), Yandex, Seznam,
 * Naver and Yep that the URLs in sitemap.xml changed, so they recrawl them right away.
 *
 * Run it after a deploy is live:
 *   npm run indexnow              # submit every URL in sitemap.xml
 *   npm run indexnow -- --dry-run # print the payload only
 *
 * The key file (<32 hex chars>.txt in the site root) must already be deployed.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const HOST = 'ifuentes.net';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function findKey() {
  const file = fs.readdirSync(root).find(name => /^[0-9a-f]{32}\.txt$/.test(name));
  if (!file) throw new Error('IndexNow key file not found in the site root');
  const key = fs.readFileSync(path.join(root, file), 'utf8').trim();
  if (`${key}.txt` !== file) throw new Error(`${file} must contain exactly its own name (without .txt)`);
  return key;
}

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const key = findKey();
  const keyLocation = `https://${HOST}/${key}.txt`;
  const payload = { host: HOST, key, keyLocation, urlList: sitemapUrls() };

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const live = await fetch(keyLocation, { cache: 'no-store' }).then(r => (r.ok ? r.text() : '')).catch(() => '');
  if (live.trim() !== key) {
    throw new Error(`${keyLocation} is not live yet. Deploy first, then run this again.`);
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  });
  const meaning = {
    200: 'OK, URLs submitted',
    202: 'Accepted, key validation pending',
    400: 'Bad request',
    403: 'Key not valid (key file missing or mismatched)',
    422: 'URLs do not belong to the host',
    429: 'Too many requests, try again later'
  }[response.status] || response.statusText;
  console.log(`IndexNow ${response.status}: ${meaning}`);
  payload.urlList.forEach(url => console.log(`  ${url}`));
  if (response.status >= 300) process.exit(1);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
