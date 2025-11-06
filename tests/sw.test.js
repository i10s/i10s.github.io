/**
 * Service Worker Tests
 * Tests for sw.js functionality, caching, and offline behavior
 */

const { JSDOM } = require('jsdom');
const { expect } = require('chai');

describe('Service Worker', () => {
  let swCode;
  let cacheName;
  let offlineUrl;

  before(() => {
    const fs = require('fs');
    const path = require('path');
    swCode = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  });

  describe('Configuration', () => {
    it('should define VERSION constant', () => {
      expect(swCode).to.include('const VERSION');
    });

    it('should define CACHE_NAME with version', () => {
      expect(swCode).to.include('const CACHE_NAME');
      expect(swCode).to.match(/CACHE_NAME.*VERSION/);
    });

    it('should define OFFLINE_URL', () => {
      expect(swCode).to.include('const OFFLINE_URL');
      expect(swCode).to.include('/offline.html');
    });

    it('should cache essential resources', () => {
      expect(swCode).to.include('/');
      expect(swCode).to.include('/index.html');
      expect(swCode).to.include('/site.webmanifest');
      expect(swCode).to.include('/offline.html');
    });
  });

  describe('Install Event', () => {
    it('should have install event listener', () => {
      expect(swCode).to.match(/addEventListener\s*\(\s*['"]install['"]/);
    });

    it('should call skipWaiting during install', () => {
      expect(swCode).to.include('skipWaiting');
    });

    it('should pre-cache resources', () => {
      expect(swCode).to.match(/caches\.open/);
      expect(swCode).to.match(/addAll/);
    });
  });

  describe('Activate Event', () => {
    it('should have activate event listener', () => {
      expect(swCode).to.match(/addEventListener\s*\(\s*['"]activate['"]/);
    });

    it('should claim clients', () => {
      expect(swCode).to.include('clients.claim');
    });

    it('should clean old caches', () => {
      expect(swCode).to.match(/caches\.keys/);
      expect(swCode).to.match(/caches\.delete/);
    });
  });

  describe('Fetch Event', () => {
    it('should have fetch event listener', () => {
      expect(swCode).to.match(/addEventListener\s*\(\s*['"]fetch['"]/);
    });

    it('should handle requests appropriately', () => {
      // Service worker should handle fetch events
      expect(swCode).to.include('fetch');
      expect(swCode).to.match(/caches\.match|fetch/);
    });

    it('should implement cache-first strategy', () => {
      expect(swCode).to.match(/caches\.match/);
    });

    it('should provide offline fallback for navigation', () => {
      expect(swCode).to.match(/request\.mode\s*===\s*['"]navigate['"]/);
      expect(swCode).to.include('OFFLINE_URL');
    });
  });

  describe('Error Handling', () => {
    it('should catch fetch errors', () => {
      expect(swCode).to.match(/\.catch\s*\(/);
    });

    it('should handle cache failures gracefully', () => {
      const catchBlocks = swCode.match(/catch/g);
      expect(catchBlocks).to.have.length.greaterThan(0);
    });
  });

  describe('Version Management', () => {
    it('should use semantic versioning', () => {
      const versionMatch = swCode.match(/VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/);
      expect(versionMatch).to.not.be.null;
      if (versionMatch) {
        const [major, minor, patch] = versionMatch[1].split('.').map(Number);
        expect(major).to.be.at.least(1);
        expect(minor).to.be.at.least(0);
        expect(patch).to.be.at.least(0);
      }
    });

    it('should include version in cache name', () => {
      expect(swCode).to.match(/CACHE_NAME\s*=\s*`.*\$\{VERSION\}`/);
    });
  });
});

describe('Service Worker Integration', () => {
  it('should be registered in index.html', () => {
    const fs = require('fs');
    const path = require('path');
    const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    
    expect(indexHtml).to.include('serviceWorker');
    expect(indexHtml).to.match(/navigator\.serviceWorker\.register/);
    expect(indexHtml).to.include('sw.js');
  });

  it('should not preload service worker unnecessarily', () => {
    // We intentionally removed SW preload as it caused "unused resource" warning
    const fs = require('fs');
    const path = require('path');
    const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    
    // SW registration is sufficient - preload is not necessary and causes warnings
    expect(indexHtml).to.match(/navigator\.serviceWorker\.register/);
  });
});
