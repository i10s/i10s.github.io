#!/usr/bin/env node

/**
 * Social card generator (Open Graph, 1200x630).
 * Writes HTML templates to cards/ and, when puppeteer-core and a local Chrome
 * are available, renders them to PNG in the site root (og.png, og-resume.png, og-now.png).
 *
 * Usage: npm run generate:og-cards
 * Optional: CHROME_PATH=/path/to/chrome npm run generate:og-cards
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cardsDir = path.join(root, 'cards');

const cards = [
  {
    name: 'og-home',
    png: 'og.png',
    eyebrow: 'Salidas · Departures · PMI',
    words: ['IÑAKI', 'FUENTES'],
    lede: 'I build, scale and fix tech businesses.',
    status: 'In flight',
    note: 'eVoost AI · Fliinow'
  },
  {
    name: 'og-resume',
    png: 'og-resume.png',
    eyebrow: 'Iñaki Fuentes · Résumé',
    words: ['FLIGHT', 'LOG'],
    lede: 'Twenty years, four acquisitions.',
    status: 'Landed',
    note: 'CEO · CIO · COO · CTO'
  },
  {
    name: 'og-now',
    png: 'og-now.png',
    eyebrow: 'Iñaki Fuentes · Now boarding',
    words: ['NOW'],
    lede: 'eVoost AI, Fliinow, founders and a UEFA C diploma.',
    status: 'Boarding',
    note: 'Updated October 2026'
  }
];

const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const tiles = word => `<span class="w">${[...word].map(c => `<i>${escape(c)}</i>`).join('')}</span>`;

const template = card => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1200, initial-scale=1">
  <title>${escape(card.lede)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { display: flex; flex-direction: column; justify-content: space-between; width: 1200px; height: 630px; padding: 60px 72px; overflow: hidden; background: #111214; color: #f4f1e8; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    .mono { font: 600 22px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .12em; text-transform: uppercase; color: #a7a49c; }
    .top, .bottom { display: flex; align-items: center; justify-content: space-between; }
    .mark { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 10px; background: #ffcc00; color: #111; font: 800 30px/1 system-ui, sans-serif; letter-spacing: -.05em; }
    .tiles { display: flex; gap: 30px; font: 700 88px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .w { display: flex; gap: 7px; }
    .w i { position: relative; display: grid; place-items: center; width: 74px; height: 106px; border-radius: 8px; background: linear-gradient(#26272c 50%, #1d1e22 50%); font-style: normal; box-shadow: 0 8px 18px #0007; }
    .w i::after { content: ""; position: absolute; left: 0; right: 0; top: calc(50% - 1px); height: 2px; background: #000b; }
    .lede { max-width: 980px; font-size: 54px; font-weight: 750; line-height: 1.08; letter-spacing: -.03em; }
    .status { color: #63e08f; }
    .status::before { content: ""; display: inline-block; width: 14px; height: 14px; margin-right: 14px; border-radius: 50%; background: currentColor; }
    .site { padding: 14px 18px; border-radius: 8px; background: #ffcc00; color: #111; }
  </style>
</head>
<body>
  <div class="top"><span class="mark">IF</span><span class="mono">${escape(card.eyebrow)}</span></div>
  <div class="tiles">${card.words.map(tiles).join('')}</div>
  <p class="lede">${escape(card.lede)}</p>
  <div class="bottom mono"><span><span class="status">${escape(card.status)}</span> · ${escape(card.note)}</span><span class="site">ifuentes.net</span></div>
</body>
</html>
`;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p));
}

async function render() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer-core');
  } catch {
    return false;
  }
  const executablePath = findChrome();
  if (!executablePath) return false;
  const browser = await puppeteer.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  for (const card of cards) {
    await page.goto(`file://${path.join(cardsDir, `${card.name}.html`)}`);
    await page.screenshot({ path: path.join(root, card.png) });
    console.log(`✓ Rendered ${card.png}`);
  }
  await browser.close();
  return true;
}

fs.mkdirSync(cardsDir, { recursive: true });
cards.forEach(card => {
  fs.writeFileSync(path.join(cardsDir, `${card.name}.html`), template(card), 'utf8');
  console.log(`✓ Generated cards/${card.name}.html`);
});

render()
  .then(done => {
    if (!done) {
      console.log('\nPNG rendering skipped (needs puppeteer-core and Chrome; set CHROME_PATH if needed).');
      console.log('Open each card at 1200x630 and screenshot it, or run with Chrome installed.');
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
