/**
 * Test Setup
 * Global configuration and utilities for tests
 */

// Suppress JSDOM warnings
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

// Global test utilities
global.testUtils = {
  /**
   * Clean HTML whitespace for comparison
   */
  cleanWhitespace: (str) => {
    return str.replace(/\s+/g, ' ').trim();
  },

  /**
   * Extract CSS from HTML
   */
  extractCSS: (html) => {
    const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    return match ? match[1] : '';
  },

  /**
   * Extract JSON-LD from HTML
   */
  extractJSONLD: (html) => {
    const match = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    return match ? JSON.parse(match[1]) : null;
  },

  /**
   * Check if URL is external
   */
  isExternalURL: (url, baseURL = 'https://ifuentes.net') => {
    try {
      const urlObj = new URL(url, baseURL);
      const baseObj = new URL(baseURL);
      return urlObj.hostname !== baseObj.hostname;
    } catch {
      return false;
    }
  }
};

// Console output control
const originalConsole = { ...console };

before(() => {
  // Reduce noise in test output
  if (process.env.SILENT_TESTS === 'true') {
    global.console = {
      ...console,
      log: () => {},
      warn: () => {},
      info: () => {}
    };
  }
});

after(() => {
  // Restore console
  if (process.env.SILENT_TESTS === 'true') {
    global.console = originalConsole;
  }
});
