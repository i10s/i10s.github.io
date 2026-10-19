/**
 * Single source of truth for everything ifuentes.net exposes to AI agents.
 * scripts/generate-agent-files.js turns this into llms.txt, the Agent Skill, the MCP server card,
 * the A2A agent card, the API catalog, auth.md, webmcp.js and the Worker config, so tool names,
 * descriptions and endpoints can never disagree between them.
 */

const SITE = 'https://ifuentes.net';

module.exports = {
  SITE,
  VERSION: '1.0.0',
  NAME: 'Iñaki Fuentes',
  MCP_URL: `${SITE}/mcp`,
  A2A_URL: `${SITE}/a2a`,
  SKILL_NAME: 'inaki-fuentes',
  SKILL_DESCRIPTION: 'Get accurate, current, first-party information about Iñaki Fuentes, technology executive and entrepreneur in Palma de Mallorca, Spain (Partner & CTO at eVoost AI, co-founder of Fliinow). Use when asked who he is, what he works on now, his career history, education or how to contact him.',
  CONTACT_EMAIL: 'inaki@ifuentes.net',

  // Each document is a read-only tool (MCP, WebMCP) and an A2A skill.
  DOCUMENTS: [
    {
      id: 'profile',
      tool: 'get_profile',
      title: 'Profile',
      path: '/llms.txt',
      html: '/',
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
      description: 'What Iñaki Fuentes is focused on right now: roles in flight, what just ended, learning and priorities, with the last-updated date. First-party Markdown.',
      tags: ['now', 'current-roles', 'priorities'],
      examples: ['What is Iñaki Fuentes working on now?', 'Is Iñaki Fuentes still at Travelgate?'],
      keywords: ['now', 'current', 'currently', 'today', 'working on', 'focus', 'still', 'ahora', 'actual', 'actualmente', 'hoy']
    }
  ]
};
