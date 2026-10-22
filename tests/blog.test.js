/**
 * Blog: generator behaviour (Markdown subset, validation) and the generated files on disk.
 */
const { expect } = require('chai');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');
const { markdown, inline, TOPICS } = require('../scripts/generate-blog');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

describe('Blog generator: Markdown', () => {
  it('renders paragraphs, headings, lists, quotes and code', () => {
    const html = markdown('Uno\ndos.\n\n## Título\n\n- a\n- b\n\n1. x\n2. y\n\n> cita\n\n```\nif (a < b) {}\n```\n\n### Sub');
    expect(html).to.equal([
      '<p>Uno dos.</p>', '<h2>Título</h2>', '<ul><li>a</li><li>b</li></ul>', '<ol><li>x</li><li>y</li></ol>',
      '<blockquote><p>cita</p></blockquote>', '<pre><code>if (a &lt; b) {}</code></pre>', '<h3>Sub</h3>'
    ].join('\n'));
  });

  it('escapes HTML and renders inline marks and links', () => {
    expect(inline('a <b> & "c"')).to.equal('a &lt;b&gt; &amp; &quot;c&quot;');
    expect(inline('**n** *i* _j_ `x<y` [l](https://ifuentes.net/?a=1&b=2)'))
      .to.equal('<strong>n</strong> <em>i</em> <em>j</em> <code>x&lt;y</code> <a href="https://ifuentes.net/?a=1&amp;b=2">l</a>');
  });

  it('rejects unsafe link targets and h1 in the body', () => {
    expect(() => inline('[x](javascript:alert(1))')).to.throw(/unsupported link/);
    expect(() => markdown('# Title')).to.throw(/only h1/);
  });

  it('has the five agreed topics', () => {
    expect(Object.keys(TOPICS)).to.have.members(['personal', 'liderazgo', 'tecnologia', 'evoost', 'fliinow']);
  });
});

describe('Blog generator: posts', () => {
  const script = path.join(root, 'scripts', 'generate-blog.js');
  let tmp;

  // Run the generator against a throwaway copy of the files it reads and writes
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-'));
    fs.mkdirSync(path.join(tmp, 'scripts'));
    fs.mkdirSync(path.join(tmp, 'blog', 'posts'), { recursive: true });
    fs.copyFileSync(script, path.join(tmp, 'scripts', 'generate-blog.js'));
    fs.copyFileSync(path.join(root, 'sitemap.xml'), path.join(tmp, 'sitemap.xml'));
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const post = (name, front, body = 'Texto del artículo.') =>
    fs.writeFileSync(path.join(tmp, 'blog', 'posts', name), `---\n${front}\n---\n${body}\n`);
  const run = (...args) => execFileSync('node', [path.join(tmp, 'scripts', 'generate-blog.js'), ...args], { encoding: 'utf8', stdio: 'pipe' });

  it('builds post, topic, feed and sitemap entries, newest first', () => {
    post('2026-10-23-dos.md', 'title: Dos\ndate: 2026-10-23\ndescription: Segundo.\ntopic: evoost');
    post('2026-10-20-uno.md', 'title: Uno\ndate: 2026-10-20\ndescription: Primero.\ntopic: liderazgo\nlang: en', 'English body.');
    run();
    const idx = fs.readFileSync(path.join(tmp, 'blog', 'index.html'), 'utf8');
    expect(idx.indexOf('/blog/dos/')).to.be.lessThan(idx.indexOf('/blog/uno/'));
    const doc = new JSDOM(fs.readFileSync(path.join(tmp, 'blog', 'uno', 'index.html'), 'utf8')).window.document;
    expect(doc.documentElement.lang).to.equal('en');
    expect(doc.querySelector('link[rel="canonical"]').href).to.equal('https://ifuentes.net/blog/uno/');
    const ld = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
    expect(ld).to.include({ '@type': 'BlogPosting', headline: 'Uno', datePublished: '2026-10-20', articleSection: 'Liderazgo' });
    expect(ld.author['@id']).to.equal('https://ifuentes.net/#person');
    expect(doc.querySelector('a[rel="next"]').getAttribute('href')).to.equal('/blog/dos/');
    expect(fs.readFileSync(path.join(tmp, 'blog', 'uno.md'), 'utf8')).to.match(/^# Uno\n/);
    const feed = fs.readFileSync(path.join(tmp, 'blog', 'feed.xml'), 'utf8');
    expect(feed.match(/<item>/g)).to.have.length(2);
    expect(feed).to.include('<lastBuildDate>Fri, 23 Oct 2026 00:00:00 +0000</lastBuildDate>');
    const sitemap = fs.readFileSync(path.join(tmp, 'sitemap.xml'), 'utf8');
    ['/blog/', '/blog/dos/', '/blog/uno/', '/blog/tema/evoost/', '/blog/tema/liderazgo/'].forEach(u => expect(sitemap).to.include(`https://ifuentes.net${u}</loc>`));
    expect(sitemap).not.to.include('/blog/tema/fliinow/');
    expect(run('--check')).to.include('up to date (2 posts)');
  });

  it('removes the pages of a deleted post and --check spots stale files', () => {
    post('2026-10-20-uno.md', 'title: Uno\ndate: 2026-10-20\ndescription: Primero.\ntopic: personal');
    run();
    fs.rmSync(path.join(tmp, 'blog', 'posts', '2026-10-20-uno.md'));
    expect(() => run('--check')).to.throw();
    run();
    expect(fs.existsSync(path.join(tmp, 'blog', 'uno'))).to.equal(false);
    expect(fs.existsSync(path.join(tmp, 'blog', 'uno.md'))).to.equal(false);
  });

  it('refuses invalid posts', () => {
    post('2026-10-20-mal.md', 'title: Mal\ndate: 2026-10-20\ndescription: x\ntopic: futbol');
    expect(() => run()).to.throw(/topic/);
  });
});

describe('Blog: generated files in the repo', () => {
  it('are up to date with blog/posts', () => {
    expect(execFileSync('node', ['scripts/generate-blog.js', '--check'], { cwd: root, encoding: 'utf8' })).to.include('up to date');
  });

  it('index is linked from every main page and uses no JavaScript', () => {
    ['index.html', 'now.html', 'resume.html', '404.html'].forEach(page => {
      expect(read(page), page).to.include('href="/blog/"');
      expect(read(page), page).not.to.include('bearblog');
    });
    const idx = read('blog/index.html');
    expect(idx).not.to.match(/<script(?![^>]*application\/ld\+json)/);
    expect(idx).to.include('href="/blog/feed.xml"');
  });

  it('feed is valid RSS', () => {
    const doc = new JSDOM(read('blog/feed.xml'), { contentType: 'text/xml' }).window.document;
    expect(doc.querySelector('parsererror')).to.equal(null);
    expect(doc.querySelector('channel > link').textContent).to.equal('https://ifuentes.net/blog/');
  });
});
