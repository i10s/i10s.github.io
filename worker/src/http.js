/**
 * Small HTTP helpers shared by the REST API, NLWeb and the home page. Pure module (only standard
 * fetch API globals), so it is testable in Node.
 */

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, A2A-Version, A2A-Extensions'
};

const STATUS_TITLES = { 400: 'Bad Request', 404: 'Not Found', 405: 'Method Not Allowed', 413: 'Content Too Large', 502: 'Bad Gateway' };

/** RFC 9457 problem details. */
export function problem(status, detail, { instance, headers = {} } = {}) {
  const body = { type: 'about:blank', title: STATUS_TITLES[status] || 'Error', status, detail };
  if (instance) body.instance = instance;
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/problem+json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS, ...headers }
  });
}

/** Splits YAML front matter (flat key: value lines, as generated for the site) from a Markdown document. */
export function splitFrontMatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!pair) continue;
    let value = pair[2].trim();
    if (value.startsWith('"')) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Not a JSON-style string: keep it as written
      }
    }
    meta[pair[1]] = value;
  }
  return { meta, body: text.slice(match[0].length).replace(/^\n+/, '') };
}

// Fetchers acting for a person in a chat (not crawlers): they read the page to answer, so Markdown serves them better
const USER_AGENTS = /\b(ChatGPT-User|Claude-User|Perplexity-User|MistralAI-User|DuckAssistBot|Meta-ExternalFetcher)\b/i;

/** True if the request asks for Markdown, or comes from an AI assistant fetching the page for a user. */
export function prefersMarkdown(request) {
  const accept = request.headers.get('Accept') || '';
  if (/\btext\/markdown\b/i.test(accept)) return true;
  return USER_AGENTS.test(request.headers.get('User-Agent') || '');
}
