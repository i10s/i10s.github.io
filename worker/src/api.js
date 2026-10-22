/**
 * Read-only REST API for ifuentes.net (/api). JSON over the same published documents the MCP server
 * and the A2A agent use, plus the blog. No state, no authentication; errors are RFC 9457 problem
 * details. Pure module (no Worker APIs), so it is testable in Node. Described by /openapi.json.
 */

import { CORS, problem, splitFrontMatter } from './http.js';

const CACHE = 'public, max-age=300';
const ALLOW = 'GET, HEAD, OPTIONS';
const TOPIC = /^[a-z]+$/;
const LANG = /^[a-z]{2}$/;

const json = body => new Response(JSON.stringify(body, null, 2), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': CACHE, ...CORS }
});

/** Loads the published blog index (/blog/posts.json). */
export async function loadPosts(load) {
  return JSON.parse(await load('/blog/posts.json'));
}

async function documentBody(doc, { site, load }) {
  const { meta, body } = splitFrontMatter(await load(doc.markdown));
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    url: `${site}${doc.markdown}`,
    html_url: `${site}${doc.html}`,
    updated: meta.last_updated || null,
    content_type: 'text/markdown',
    content: body
  };
}

function index(config) {
  return {
    name: 'ifuentes.net API',
    description: `Public, read-only JSON API with first-party information about ${config.name}. No authentication.`,
    version: config.version,
    documentation: config.developersUrl,
    openapi: config.openapiUrl,
    endpoints: config.apiEndpoints.map(e => ({ ...e, ...(e.path.includes('{') ? {} : { url: `${config.site}${e.path}` }) })),
    related: { mcp: config.mcpUrl, a2a: config.a2aUrl, nlweb: config.askUrl, apiCatalog: `${config.site}/.well-known/api-catalog`, llms: `${config.site}/llms.txt` }
  };
}

function listPosts(data, params, instance) {
  const topic = params.get('topic');
  const lang = params.get('lang');
  const limitParam = params.get('limit');
  if (topic !== null && !TOPIC.test(topic)) return problem(400, 'topic must be a topic id such as "evoost".', { instance });
  if (lang !== null && !LANG.test(lang)) return problem(400, 'lang must be a two-letter ISO 639-1 code such as "es".', { instance });
  const limit = limitParam === null ? Infinity : Number(limitParam);
  if (limitParam !== null && !(Number.isInteger(limit) && limit >= 1 && limit <= 100)) {
    return problem(400, 'limit must be an integer from 1 to 100.', { instance });
  }
  const posts = data.posts
    .filter(p => topic === null || p.topic === topic)
    .filter(p => lang === null || p.lang === lang)
    .slice(0, limit);
  return json({ count: posts.length, updated: data.updated, posts });
}

async function route(request, config, load) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const instance = url.pathname;

  if (path === '/api') return json(index(config));

  const doc = config.documents.find(d => d.api && path === `/api/${d.id}`);
  if (doc) return json(await documentBody(doc, { site: config.site, load }));

  if (path === '/api/posts') return listPosts(await loadPosts(load), url.searchParams, instance);

  const slug = /^\/api\/posts\/([^/]+)$/.exec(path);
  if (slug) {
    const posts = (await loadPosts(load)).posts;
    const post = posts.find(p => p.slug === slug[1]);
    if (!post) return problem(404, `No blog post with slug '${slug[1]}'. List them at ${config.apiUrl}/posts.`, { instance });
    const { body } = splitFrontMatter(await load(new URL(post.markdown_url).pathname));
    return json({ ...post, content_type: 'text/markdown', content: body });
  }

  return problem(404, `No such endpoint. See ${config.apiUrl} or ${config.openapiUrl}.`, { instance });
}

/**
 * Handles one request under /api.
 * @param {Request} request
 * @param {object} config worker/src/config.json
 * @param {(path: string) => Promise<string>} load reads a published file; throws if it cannot
 */
export async function handleApi(request, config, load) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS, Allow: ALLOW } });
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return problem(405, `${request.method} is not allowed: this API is read-only.`, { instance: new URL(request.url).pathname, headers: { Allow: ALLOW } });
  }
  let response;
  try {
    response = await route(request, config, load);
  } catch (e) {
    response = problem(502, `Could not read the published site: ${e.message}`, { instance: new URL(request.url).pathname });
  }
  return request.method === 'HEAD' ? new Response(null, response) : response;
}
