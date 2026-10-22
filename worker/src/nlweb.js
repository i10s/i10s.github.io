/**
 * NLWeb endpoint for ifuentes.net (/ask), list mode, protocol v0.55 (https://github.com/nlweb-ai/NLWeb).
 * Deterministic on purpose, like the A2A agent: it ranks the published pages and blog posts against the
 * query with fixed keyword rules and returns them with their schema.org data. No generative AI, so it
 * can never invent facts. Pure module (no Worker APIs), so it is testable in Node.
 */

import { rankDocuments } from './a2a.js';
import { loadPosts } from './api.js';
import { CORS } from './http.js';

export const NLWEB_VERSION = '0.55';
const MAX_BODY_BYTES = 64 * 1024;
const MAX_QUERY = 1000;
const MAX_RESULTS = 10;
const ALLOW = 'GET, HEAD, POST, OPTIONS';
// Words that say nothing about which page answers: question words, the name, "blog"
const STOP = new Set(['about', 'what', 'which', 'when', 'where', 'does', 'have', 'with', 'that', 'this', 'from', 'there', 'their', 'your',
  'inaki', 'fuentes', 'blog', 'post', 'posts', 'article', 'articles', 'sobre', 'para', 'como', 'cual', 'cuales', 'quien', 'donde',
  'tiene', 'esta', 'este', 'articulo', 'articulos', 'escrito', 'publicado']);

const fold = text => String(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const words = text => fold(text).split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !STOP.has(w));
// 1 hit 0.5, 2 hits 0.67, 3 hits 0.75…; the profile shown when nothing matches gets a low 0.1
const score = hits => (hits > 0 ? Math.round((hits / (hits + 1)) * 100) / 100 : 0.1);

class AskError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const isTrue = value => value === true || /^(true|1|yes)$/i.test(String(value));

/** Reads an NLWeb request: GET ?query=…, a v0.55 POST body ({ query: { text }, prefer: { streaming } }) or a form. */
export async function parseAsk(request) {
  const params = new URL(request.url).searchParams;
  let query = params.get('query') ?? params.get('q');
  let streaming = params.get('streaming');
  let mode = params.get('mode') ?? params.get('generate_mode');

  if (request.method === 'POST') {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) throw new AskError(413, 'payload_too_large', 'The request body is larger than 64 KB.');
    if (/application\/x-www-form-urlencoded/i.test(request.headers.get('Content-Type') || '')) {
      const form = new URLSearchParams(raw);
      query = form.get('query') ?? query;
      streaming = form.get('streaming') ?? streaming;
      mode = form.get('mode') ?? form.get('generate_mode') ?? mode;
    } else if (raw.trim()) {
      let body;
      try {
        body = JSON.parse(raw);
      } catch (e) {
        throw new AskError(400, 'invalid_json', 'The request body is not valid JSON.');
      }
      if (!body || typeof body !== 'object') throw new AskError(400, 'invalid_request', 'The request body must be a JSON object.');
      if (typeof body.query === 'string') query = body.query;
      else if (body.query && typeof body.query.text === 'string') query = body.query.text;
      const prefer = body.prefer && typeof body.prefer === 'object' ? body.prefer : {};
      streaming = prefer.streaming ?? body.streaming ?? streaming;
      mode = prefer.mode ?? body.mode ?? body.generate_mode ?? mode;
    }
  }

  query = typeof query === 'string' ? query.trim() : '';
  if (!query) throw new AskError(400, 'missing_query', 'Send a natural-language query: GET /ask?query=… or POST {"query":{"text":"…"}}.');
  if (query.length > MAX_QUERY) throw new AskError(400, 'query_too_long', `The query is longer than ${MAX_QUERY} characters.`);

  const accept = request.headers.get('Accept') || '';
  const stream = streaming !== null && streaming !== undefined
    ? isTrue(streaming)
    : /text\/event-stream/i.test(accept) && !/application\/json/i.test(accept);
  return { query, streaming: stream, requestedMode: mode || 'list' };
}

/**
 * Ranks the published documents and blog posts against a query. Same keyword rules as the A2A agent for
 * the documents; posts match on the words of their title, summary and topic. Falls back to the profile.
 */
export function rank(query, documents, posts) {
  const ranked = rankDocuments(query, documents);
  const blogMatched = ranked.some(r => r.doc.id === 'blog' && r.hits > 0);
  const terms = [...new Set(words(query))];
  const postHits = posts.map(post => {
    const text = fold(`${post.title} ${post.description} ${post.topic} ${post.topic_name}`);
    const hits = terms.filter(term => text.includes(term)).length;
    return { post, hits: hits + (blogMatched ? 1 : 0) };
  });
  const items = [
    ...ranked.filter(r => r.hits > 0).map(r => ({ doc: r.doc, hits: r.hits })),
    ...postHits.filter(p => p.hits > 0)
  ];
  // Stable sort keeps documents in published order and posts newest first on equal scores
  items.sort((a, b) => b.hits - a.hits);
  return items.length ? items.slice(0, MAX_RESULTS) : [{ doc: documents[0], hits: 0 }];
}

function toResult(item, config) {
  const site = new URL(config.site).hostname;
  const person = { '@type': 'Person', '@id': `${config.site}/#person`, name: config.name, url: `${config.site}/` };
  if (item.doc) {
    const { doc } = item;
    const url = `${config.site}${doc.html}`;
    return {
      url,
      name: `${doc.title} · ${config.name}`,
      site,
      score: score(item.hits),
      description: doc.description,
      schema_object: {
        '@context': 'https://schema.org',
        '@type': doc.schemaType,
        '@id': url,
        url,
        name: `${doc.title} · ${config.name}`,
        description: doc.description,
        [doc.schemaType === 'Blog' ? 'author' : 'about']: person,
        encoding: { '@type': 'MediaObject', contentUrl: `${config.site}${doc.markdown}`, encodingFormat: 'text/markdown' }
      }
    };
  }
  const { post } = item;
  return {
    url: post.url,
    name: post.title,
    site,
    score: score(item.hits),
    description: post.description,
    schema_object: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${post.url}#post`,
      url: post.url,
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated,
      inLanguage: post.lang,
      articleSection: post.topic_name,
      author: person,
      encoding: { '@type': 'MediaObject', contentUrl: post.markdown_url, encodingFormat: 'text/markdown' }
    }
  };
}

function failure(status, code, message, headers = {}) {
  return new Response(JSON.stringify({ _meta: { response_type: 'failure', version: NLWEB_VERSION }, error: { code, message } }, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS, ...headers }
  });
}

const event = (name, data) => `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;

/**
 * Handles one request to /ask.
 * @param {Request} request
 * @param {object} config worker/src/config.json
 * @param {(path: string) => Promise<string>} load reads a published file; throws if it cannot
 * @param {{ newId?: () => string }} [options]
 */
export async function handleAsk(request, config, load, { newId = () => crypto.randomUUID() } = {}) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS, Allow: ALLOW } });
  if (!['GET', 'HEAD', 'POST'].includes(request.method)) {
    return failure(405, 'method_not_allowed', `${request.method} is not allowed. Use GET /ask?query=… or POST.`, { Allow: ALLOW });
  }

  let ask;
  try {
    ask = await parseAsk(request);
  } catch (e) {
    if (e instanceof AskError) return failure(e.status, e.code, e.message);
    throw e;
  }

  let posts = [];
  try {
    posts = (await loadPosts(load)).posts;
  } catch (e) {
    // The blog index is optional for an answer: rank the documents alone
  }
  const results = rank(ask.query, config.documents, posts).map(item => toResult(item, config));
  const site = new URL(config.site).hostname;
  const queryId = newId();

  if (ask.streaming) {
    const body = [
      event('start', { _meta: { version: NLWEB_VERSION, response_type: 'answer', mode: 'list', site }, query_id: queryId, streaming: true }),
      ...results.map((item, index) => event('result', { index, item })),
      event('complete', { _meta: { version: NLWEB_VERSION } })
    ].join('');
    return new Response(request.method === 'HEAD' ? null : body, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', ...CORS }
    });
  }

  const body = {
    _meta: { response_type: 'answer', response_format: 'conversational_search', version: NLWEB_VERSION, mode: 'list', site },
    query_id: queryId,
    query: ask.query,
    results
  };
  if (ask.requestedMode !== 'list') body._meta.note = 'Only list mode is served: results are published pages, not generated text.';
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS }
  });
}
