/**
 * Single source of truth for everything ifuentes.net exposes to AI agents.
 * scripts/generate-agent-files.js turns this into llms.txt, the Agent Skill, the MCP server card,
 * the A2A agent card, the API catalog, the OpenAPI description, the developer page, auth.md, webmcp.js
 * and the Worker config, so tool names, descriptions and endpoints can never disagree between them.
 */

const SITE = 'https://ifuentes.net';

module.exports = {
  SITE,
  VERSION: '1.1.0',
  NAME: 'Iñaki Fuentes',
  MCP_URL: `${SITE}/mcp`,
  A2A_URL: `${SITE}/a2a`,
  API_URL: `${SITE}/api`,
  ASK_URL: `${SITE}/ask`,
  OPENAPI_URL: `${SITE}/openapi.json`,
  DEVELOPERS_URL: `${SITE}/developers/`,
  SKILL_NAME: 'inaki-fuentes',
  SKILL_DESCRIPTION: 'Get accurate, current, first-party information about Iñaki Fuentes, technology executive and entrepreneur in Palma de Mallorca, Spain (Partner & CTO at eVoost AI, co-founder of Fliinow). Use when asked who he is, what he works on now, his career history, education or how to contact him.',
  CONTACT_EMAIL: 'inaki@ifuentes.net',

  // Each document is a read-only tool (MCP, WebMCP), an A2A skill and a REST endpoint (/api/<id>).
  // path: what the tools return; markdown: the same text with front matter, for the REST API (defaults to path);
  // schemaType: the schema.org type of the HTML page, for NLWeb /ask results.
  DOCUMENTS: [
    {
      id: 'profile',
      tool: 'get_profile',
      title: 'Profile',
      path: '/llms.txt',
      markdown: '/index.md',
      html: '/',
      schemaType: 'ProfilePage',
      description: 'Who Iñaki Fuentes is: current roles, short bio, career highlights and contact links. First-party Markdown from ifuentes.net.',
      tags: ['profile', 'bio', 'contact'],
      examples: ['Who is Iñaki Fuentes?', 'What is Iñaki Fuentes\'s current role?', 'How can I contact Iñaki Fuentes?'],
      keywords: []
    },
    {
      id: 'resume',
      tool: 'get_resume',
      title: 'Résumé',
      path: '/resume.md',
      html: '/resume.html',
      schemaType: 'ProfilePage',
      description: 'Iñaki Fuentes\'s full résumé: every role with dates and acquisitions, education, certifications, languages and awards. First-party Markdown.',
      tags: ['resume', 'career', 'education'],
      examples: ['Summarise Iñaki Fuentes\'s career.', 'Where did Iñaki Fuentes study?'],
      keywords: ['resume', 'résumé', 'cv', 'career', 'experience', 'history', 'education', 'degree', 'certification', 'award', 'trayectoria', 'experiencia', 'formación', 'estudios']
    },
    {
      id: 'now',
      tool: 'get_now',
      title: 'Now',
      path: '/now.md',
      html: '/now.html',
      schemaType: 'WebPage',
      description: 'What Iñaki Fuentes is focused on right now: roles in flight, what just ended, learning and priorities, with the last-updated date. First-party Markdown.',
      tags: ['now', 'current-roles', 'priorities'],
      examples: ['What is Iñaki Fuentes working on now?', 'Is Iñaki Fuentes still at Travelgate?'],
      keywords: ['now', 'current', 'currently', 'today', 'working on', 'focus', 'still', 'ahora', 'actual', 'actualmente', 'hoy']
    },
    {
      id: 'blog',
      tool: 'get_blog_posts',
      title: 'Blog',
      path: '/blog/llms.txt',
      html: '/blog/',
      schemaType: 'Blog',
      api: false, // the REST API has /api/posts (JSON) instead of /api/blog
      description: 'Every article on Iñaki Fuentes\'s blog, newest first: title, date, topic, summary and a link to its Markdown version. Mostly in Spanish. First-party Markdown.',
      tags: ['blog', 'articles', 'writing'],
      examples: ['What has Iñaki Fuentes written about?', '¿Qué ha publicado Iñaki Fuentes en su blog?'],
      keywords: ['blog', 'post', 'article', 'artículo', 'wrote', 'written', 'writing', 'escrito', 'escribe', 'publicado']
    }
  ],

  // One blog article by slug (the slugs come from get_blog_posts). MCP and WebMCP tool, REST /api/posts/{slug}.
  POST_TOOL: {
    tool: 'get_blog_post',
    title: 'Blog post',
    path: '/blog/{slug}.md',
    description: 'One article from Iñaki Fuentes\'s blog as Markdown, by slug (list them with get_blog_posts). Mostly in Spanish. First-party Markdown.'
  }
};
