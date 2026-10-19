#!/usr/bin/env node

/**
 * LLM-friendly content generator.
 * Builds llms.txt (https://llmstxt.org), llms-full.txt and Markdown versions of the
 * résumé and now pages from the HTML, so the HTML stays the single source of truth.
 *
 * Usage:
 *   npm run generate:llms          # write files
 *   node scripts/generate-llms.js --check   # exit 1 if files are out of date
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const SITE = 'https://ifuentes.net';

const load = file => new JSDOM(fs.readFileSync(path.join(root, file), 'utf8')).window.document;
const clean = text => (text || '').replace(/\s+/g, ' ').trim();
const text = el => clean(el && el.textContent);
const md = s => s.replace(/([*_`\\])/g, '\\$1');

// Inline Markdown for a paragraph: keep links, flatten everything else
function inline(el) {
  let out = '';
  el.childNodes.forEach(node => {
    if (node.nodeType === 3) out += md(node.nodeValue);
    else if (node.nodeName === 'A') {
      const href = node.getAttribute('href');
      const url = href.startsWith('/') ? SITE + href : href;
      out += `[${md(clean(node.textContent))}](${url})`;
    } else if (node.nodeType === 1) out += inline(node);
  });
  return clean(out);
}

// "Role <span>· Org</span>" → { role, org }
function splitTitle(h3) {
  const span = h3.querySelector('span');
  const org = span ? clean(span.textContent).replace(/^·\s*/, '') : '';
  const role = clean(h3.textContent.replace(span ? span.textContent : '', ''));
  return { role, org };
}

function socialLinks(home) {
  return Array.from(home.querySelectorAll('nav[aria-label="Social media and professional links"] a')).map(a => {
    const href = a.getAttribute('href');
    const label = clean(a.textContent);
    return { label, href, shown: href.startsWith('mailto:') ? href.slice(7) : href };
  });
}

function buildResume(doc) {
  const lines = [];
  lines.push(`# ${text(doc.querySelector('h1'))}: résumé`, '');
  lines.push(`> ${text(doc.querySelector('.motto'))}`, '');
  lines.push(inline(doc.querySelector('.summary')), '');

  doc.querySelectorAll('.facts > div').forEach(div => {
    lines.push(`- ${text(div.querySelector('dt'))}: ${inline(div.querySelector('dd'))}`);
  });
  const glance = Array.from(doc.querySelectorAll('.strip li')).map(text).join(' · ');
  if (glance) lines.push(`- At a glance: ${glance}`);
  lines.push(`- Last updated: ${text(doc.querySelector('.eyebrow')).replace(/^.*Updated\s*/, '')}`, `- HTML version: ${SITE}/resume.html`, '');

  lines.push('## Experience', '');
  doc.querySelectorAll('article.job').forEach(job => {
    const { role, org } = splitTitle(job.querySelector('h3'));
    lines.push(`### ${role}, ${org}`, '');
    const meta = job.querySelector('.meta');
    const details = [text(job.querySelector('.when'))];
    if (meta) {
      const tag = meta.querySelector('.tag');
      const place = clean(meta.textContent.replace(tag ? tag.textContent : '', ''));
      if (place) details.push(place);
      if (tag) details.push(text(tag));
    }
    lines.push(details.join(' · '), '');
    job.querySelectorAll('p:not(.when):not(.meta)').forEach(p => lines.push(inline(p), ''));
  });

  lines.push('## Education', '');
  doc.querySelectorAll('.edu li').forEach(li => {
    const { role, org } = splitTitle(li.querySelector('h3'));
    const meta = li.querySelector('.meta');
    const note = meta ? ` ${text(meta)}.` : '';
    lines.push(`- **${role}**, ${org} (${text(li.querySelector('.when'))}).${note}`);
  });
  lines.push('');

  doc.querySelectorAll('.side section').forEach(section => {
    lines.push(`## ${text(section.querySelector('h2'))}`, '');
    section.querySelectorAll('li').forEach(li => {
      const small = li.querySelector('small');
      const label = clean(li.textContent.replace(small ? small.textContent : '', ''));
      lines.push(small ? `- ${label}: ${text(small)}` : `- ${label}`);
    });
    lines.push('');
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function buildNow(doc) {
  const lines = [];
  lines.push(`# ${text(doc.querySelector('h1 .sr'))}: Iñaki Fuentes`, '');
  lines.push(`> ${text(doc.querySelector('.eyebrow'))}`, '');
  lines.push(inline(doc.querySelector('.lede')), '');

  doc.querySelectorAll('main section').forEach(section => {
    lines.push(`## ${text(section.querySelector('h2'))}`, '');
    section.querySelectorAll('.card').forEach(card => {
      const spans = Array.from(card.querySelectorAll('header > *')).map(text).join(' · ');
      lines.push(`### ${text(card.querySelector('h3'))}`, '', spans, '', inline(card.querySelector('p')), '');
    });
    const ordered = section.querySelector('ol.rows');
    section.querySelectorAll('.rows li').forEach((li, i) => {
      const bullet = ordered ? `${i + 1}.` : '-';
      lines.push(`${bullet} **${text(li.querySelector('.k'))}**: ${inline(li.querySelector('p:not(.k)'))}`);
    });
    lines.push('');
  });

  lines.push(inline(doc.querySelector('.meta')), '', `HTML version: ${SITE}/now.html`, '');
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function buildIntro(home, now) {
  const bio = Array.from(home.querySelectorAll('#bio ~ p')).map(inline);
  const pitch = ['.lede', '.sub', '.sign'].map(s => text(home.querySelector(s))).join(' ');
  return { bio, pitch, updated: text(now.querySelector('.eyebrow')).match(/Updated ([^·]+)/)[1].trim() };
}

function buildLlms(home, now) {
  const { bio, pitch, updated } = buildIntro(home, now);
  const lines = [
    `# ${text(home.querySelector('h1 .sr'))}`,
    '',
    `> ${bio[0]}`,
    '',
    ...bio.slice(1).flatMap(p => [p, '']),
    `In his own words: "${pitch}"`,
    '',
    `Last updated: ${updated}.`,
    '',
    '## Main pages',
    '',
    `- [Résumé](${SITE}/resume.md): Full career history with dates, acquisitions, education, certifications, languages and awards (HTML: ${SITE}/resume.html)`,
    `- [Now](${SITE}/now.md): What he is focused on right now (HTML: ${SITE}/now.html)`,
    `- [Home](${SITE}/): Current roles, career highlights and contact`,
    '',
    '## Contact and profiles',
    '',
    ...socialLinks(home).map(l => `- [${l.label}](${l.href})${l.href.startsWith('mailto:') ? `: ${l.shown}` : ''}`),
    '',
    '## Optional',
    '',
    `- [Full text](${SITE}/llms-full.txt): Bio, résumé and now page in a single file`,
    `- [RSS feed](${SITE}/feed.xml): Updates`,
    `- [humans.txt](${SITE}/humans.txt): Credits and colophon`
  ];
  return lines.join('\n') + '\n';
}

function buildFull(home, now, resumeMd, nowMd) {
  const { bio, pitch, updated } = buildIntro(home, now);
  const demote = s => s.replace(/^(#{1,5}) /gm, '#$1 ');
  return [
    `# ${text(home.querySelector('h1 .sr'))}`,
    '',
    ...bio.flatMap(p => [p, '']),
    `In his own words: "${pitch}"`,
    '',
    `Website: ${SITE}/ · Last updated: ${updated}`,
    '',
    '## Contact and profiles',
    '',
    ...socialLinks(home).map(l => `- ${l.label}: ${l.shown}`),
    '',
    demote(resumeMd).trim(),
    '',
    demote(nowMd).trim(),
    ''
  ].join('\n');
}

function build() {
  const home = load('index.html');
  const resume = load('resume.html');
  const now = load('now.html');
  const resumeMd = buildResume(resume);
  const nowMd = buildNow(now);
  return {
    'resume.md': resumeMd,
    'now.md': nowMd,
    'llms.txt': buildLlms(home, now),
    'llms-full.txt': buildFull(home, now, resumeMd, nowMd)
  };
}

module.exports = { build };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const files = build();
  let stale = 0;
  let written = 0;
  Object.entries(files).forEach(([name, content]) => {
    const file = path.join(root, name);
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current === content) return;
    if (check) {
      stale++;
      console.error(`✗ ${name} is out of date. Run: npm run generate:llms`);
    } else {
      fs.writeFileSync(file, content, 'utf8');
      written++;
      console.log(`✓ Wrote ${name}`);
    }
  });
  if (check && stale) process.exit(1);
  if (!check && !written) console.log('✓ LLM files are up to date');
}
