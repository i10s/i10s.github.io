/*! ifuentes.net · split-flap board · progressive enhancement, zero dependencies */
(() => {
  'use strict';

  const d = document;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const ALNUM = /[\p{L}\p{N}]/u;
  const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Tiles: every <i> inside [data-tiles] .w shows one character.
  const groups = () => [...d.querySelectorAll('[data-tiles] .w')];
  const read = () => groups().map(g => [...g.children].map(t => t.textContent).join(''));

  const spin = (tile, to, turns) => new Promise(resolve => {
    if (calm) {
      tile.textContent = to;
      return resolve();
    }
    let k = 0;
    const id = setInterval(() => {
      tile.className = k % 2 ? 'b' : 'a';
      if (++k > turns) {
        clearInterval(id);
        tile.textContent = to;
        resolve();
      } else {
        tile.textContent = pick();
      }
    }, 60);
  });

  const flip = words => Promise.all(groups().flatMap((g, w) =>
    [...g.children].map((tile, i) => spin(tile, [...(words[w] || '')][i] || ' ', 3 + i + 2 * w + ((Math.random() * 4) | 0)))
  ));

  // Boards: rows in [data-board] flap once when they scroll into view.
  // An aria-hidden overlay does the flapping, so assistive tech always reads the real text.
  const scramble = board => {
    const jobs = [];
    board.querySelectorAll('li').forEach((row, r) => {
      [...row.children].forEach((cell, c) => {
        const node = cell.firstChild;
        const chars = node && node.nodeType === 3 ? [...node.nodeValue] : [];
        if (!chars.length) return;
        const fx = d.createElement('span');
        fx.className = 'fx';
        fx.setAttribute('aria-hidden', 'true');
        fx.textContent = chars.map(ch => (ALNUM.test(ch) ? pick() : ch)).join('');
        cell.append(fx);
        jobs.push({ fx, chars, at: r * 2 + c });
      });
    });
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      let live = 0;
      for (const job of jobs) {
        if (!job.fx) continue;
        const settled = tick - job.at;
        if (settled > job.chars.length) {
          job.fx.remove();
          job.fx = null;
          continue;
        }
        live++;
        job.fx.textContent = job.chars.map((ch, k) => (k < settled || !ALNUM.test(ch) ? ch : pick())).join('');
      }
      if (!live) clearInterval(id);
    }, 45);
  };

  const watchBoards = () => {
    const boards = d.querySelectorAll('[data-board]');
    if (calm || !boards.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        scramble(entry.target);
      });
    }, { threshold: 0.3 });
    boards.forEach(board => io.observe(board));
  };

  // Clocks: <span data-tz="Europe/Madrid">--:--</span>
  const startClocks = () => {
    const els = [...d.querySelectorAll('[data-tz]')];
    if (!els.length) return;
    try {
      const formats = els.map(el => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: el.dataset.tz }));
      const tick = () => els.forEach((el, i) => { el.textContent = formats[i].format(Date.now()); });
      tick();
      setInterval(tick, 10000);
    } catch (e) {
      // Unknown time zone: keep the placeholder.
    }
  };

  const toast = message => {
    const el = d.createElement('p');
    el.setAttribute('role', 'status');
    el.textContent = message;
    el.style.cssText = 'position:fixed;left:50%;bottom:1.5rem;z-index:99;transform:translateX(-50%);margin:0;padding:.8rem 1.1rem;border-radius:.4rem;background:#ffcc00;color:#111;font:700 .85rem/1.3 ui-monospace,monospace;box-shadow:0 12px 32px rgba(0,0,0,.35)';
    d.body.append(el);
    setTimeout(() => el.remove(), 4500);
  };

  // ↑ ↑ ↓ ↓ ← → ← → B A  flips the frames listed in data-tiles="WORD WORD|WORD WORD".
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  let playing = false;
  d.addEventListener('keydown', async e => {
    const key = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
    if (pos < KONAMI.length) return;
    pos = 0;
    toast('Achievement unlocked: less wrong every day');
    const host = d.querySelector('[data-tiles]');
    const frames = host && host.dataset.tiles ? host.dataset.tiles.split('|').map(f => f.split(' ')) : [];
    if (playing || !frames.length) return;
    playing = true;
    const home = read();
    for (const words of [...frames, home]) {
      await flip(words);
      await wait(1500);
    }
    playing = false;
  });

  const start = () => {
    startClocks();
    if (!calm && groups().length) flip(read());
    watchBoards();
    console.log('%c IF %c ifuentes.net · less theatre, more execution · psst: ↑↑↓↓←→←→BA', 'background:#ffcc00;color:#111;font-weight:800;padding:2px 6px;border-radius:3px', '');
  };

  if (d.prerendering) d.addEventListener('prerenderingchange', start, { once: true });
  else start();
})();
