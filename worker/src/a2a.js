/**
 * A2A (Agent2Agent) JSON-RPC 2.0 handling for ifuentes.net.
 * Deterministic on purpose: the agent picks one of the published documents and returns it verbatim,
 * so it can never invent facts about Iñaki Fuentes. Pure module (no Worker APIs) so it is testable in Node.
 */

export const ERRORS = {
  PARSE: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,
  TASK_NOT_FOUND: -32001,
  UNSUPPORTED_OPERATION: -32004,
  EXTENDED_CARD_NOT_CONFIGURED: -32007
};

const SEND = new Set(['message/send', 'SendMessage']);
const STREAMING = new Set(['message/stream', 'SendStreamingMessage', 'tasks/resubscribe', 'SubscribeToTask',
  'tasks/pushNotificationConfig/set', 'tasks/pushNotificationConfig/get', 'tasks/pushNotificationConfig/list',
  'tasks/pushNotificationConfig/delete']);
const TASKS = new Set(['tasks/get', 'tasks/cancel', 'tasks/list', 'GetTask', 'CancelTask', 'ListTasks']);
const EXTENDED_CARD = new Set(['agent/getAuthenticatedExtendedCard', 'GetExtendedAgentCard']);

/** Plain text of an A2A message (v0.3 "kind" parts and v1 parts with a "text" field). */
export function messageText(message) {
  return (message.parts || [])
    .filter(part => part && typeof part.text === 'string')
    .map(part => part.text)
    .join('\n');
}

/** Scores every document by the keywords the text mentions; best first, ties in published order. */
export function rankDocuments(text, documents) {
  const haystack = ` ${String(text).toLowerCase()} `;
  return documents
    .map((doc, order) => ({ doc, order, hits: doc.keywords.filter(keyword => haystack.includes(keyword.toLowerCase())).length }))
    .sort((a, b) => b.hits - a.hits || a.order - b.order)
    .map(({ doc, hits }) => ({ doc, hits }));
}

/** Picks the document that answers the message: explicit skill first, then keywords, else the profile. */
export function pickDocument(text, documents, requestedSkill) {
  const requested = documents.find(doc => doc.id === requestedSkill);
  if (requested) return requested;
  const [best] = rankDocuments(text, documents);
  return best.hits > 0 ? best.doc : documents[0];
}

/**
 * Handles one JSON-RPC request object.
 * @param {unknown} request parsed JSON body
 * @param {{ documents: Array<{id: string, path: string, keywords: string[]}>, site: string,
 *           load: (path: string) => Promise<string>, newId?: () => string }} options
 * @returns {Promise<object|null>} JSON-RPC response, or null for a notification
 */
export async function handleA2A(request, { documents, site, load, newId = () => crypto.randomUUID() }) {
  const isObject = request !== null && typeof request === 'object' && !Array.isArray(request);
  const id = isObject && (typeof request.id === 'string' || typeof request.id === 'number') ? request.id : null;
  const error = (code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

  if (!isObject || request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
    return error(ERRORS.INVALID_REQUEST, 'Invalid Request: expected a JSON-RPC 2.0 request object');
  }
  if (!('id' in request)) return null;

  const { method, params } = request;
  if (SEND.has(method)) {
    const message = params && params.message;
    if (!message || typeof message !== 'object' || !Array.isArray(message.parts)) {
      return error(ERRORS.INVALID_PARAMS, 'Invalid params: params.message with a parts array is required');
    }
    const skill = (message.metadata && message.metadata.skill) || (params.metadata && params.metadata.skill);
    const doc = pickDocument(messageText(message), documents, skill);
    let markdown;
    try {
      markdown = await load(doc.path);
    } catch (e) {
      return error(ERRORS.INTERNAL, `Could not load ${site}${doc.path}`);
    }
    return {
      jsonrpc: '2.0',
      id,
      result: {
        kind: 'message',
        role: 'agent',
        messageId: newId(),
        contextId: typeof message.contextId === 'string' ? message.contextId : newId(),
        parts: [{ kind: 'text', text: `> Source: ${site}${doc.path} (first-party, published by Iñaki Fuentes)\n\n${markdown}` }],
        metadata: { skill: doc.id, source: `${site}${doc.path}` }
      }
    };
  }
  if (STREAMING.has(method)) {
    return error(ERRORS.UNSUPPORTED_OPERATION, 'Unsupported operation: this agent has no streaming or push notifications');
  }
  if (TASKS.has(method)) {
    return error(ERRORS.TASK_NOT_FOUND, 'Task not found: this agent answers with messages, not tasks');
  }
  if (EXTENDED_CARD.has(method)) {
    return error(ERRORS.EXTENDED_CARD_NOT_CONFIGURED, 'There is no authenticated extended card: everything is public');
  }
  return error(ERRORS.METHOD_NOT_FOUND, `Method not found: ${method}`);
}
