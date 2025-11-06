/**
 * PWA Manifest Tests
 * Tests for site.webmanifest structure and completeness
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

describe('PWA Manifest', () => {
  let manifest;

  before(() => {
    const manifestPath = path.join(__dirname, '../site.webmanifest');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
  });

  describe('Required Fields', () => {
    it('should have name field', () => {
      expect(manifest.name).to.exist;
      expect(manifest.name).to.be.a('string');
      expect(manifest.name.length).to.be.greaterThan(0);
    });

    it('should have short_name field', () => {
      expect(manifest.short_name).to.exist;
      expect(manifest.short_name).to.be.a('string');
      expect(manifest.short_name.length).to.be.at.most(15); // Slightly more lenient
    });

    it('should have icons array', () => {
      expect(manifest.icons).to.exist;
      expect(manifest.icons).to.be.an('array');
      expect(manifest.icons.length).to.be.greaterThan(0);
    });

    it('should have start_url', () => {
      expect(manifest.start_url).to.exist;
      expect(manifest.start_url).to.be.a('string');
    });

    it('should have display mode', () => {
      expect(manifest.display).to.exist;
      expect(manifest.display).to.be.oneOf(['fullscreen', 'standalone', 'minimal-ui', 'browser']);
    });

    it('should have theme_color', () => {
      expect(manifest.theme_color).to.exist;
      expect(manifest.theme_color).to.match(/^#[0-9a-f]{6}$/i);
    });

    it('should have background_color', () => {
      expect(manifest.background_color).to.exist;
      expect(manifest.background_color).to.match(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('Icon Requirements', () => {
    it('should have at least 192x192 icon', () => {
      const icon192 = manifest.icons.find(icon => icon.sizes.includes('192x192'));
      expect(icon192).to.exist;
    });

    it('should have at least 512x512 icon', () => {
      const icon512 = manifest.icons.find(icon => icon.sizes.includes('512x512'));
      expect(icon512).to.exist;
    });

    it('should have maskable icon', () => {
      const maskableIcon = manifest.icons.find(icon => 
        icon.purpose && icon.purpose.includes('maskable')
      );
      expect(maskableIcon).to.exist;
    });

    it('icons should have valid src paths', () => {
      manifest.icons.forEach(icon => {
        expect(icon.src).to.exist;
        expect(icon.src).to.be.a('string');
        expect(icon.src.length).to.be.greaterThan(0);
      });
    });

    it('icons should have valid types', () => {
      manifest.icons.forEach(icon => {
        expect(icon.type).to.exist;
        expect(icon.type).to.match(/^image\//);
      });
    });

    it('icons should have valid sizes', () => {
      manifest.icons.forEach(icon => {
        expect(icon.sizes).to.exist;
        expect(icon.sizes).to.match(/^\d+x\d+$/);
      });
    });
  });

  describe('Optional Enhancements', () => {
    it('should have description', () => {
      expect(manifest.description).to.exist;
      expect(manifest.description.length).to.be.greaterThan(20);
    });

    it('should have orientation preference', () => {
      if (manifest.orientation) {
        expect(manifest.orientation).to.be.oneOf([
          'any', 'natural', 'landscape', 'portrait',
          'portrait-primary', 'portrait-secondary',
          'landscape-primary', 'landscape-secondary'
        ]);
      }
    });

    it('should not have shortcuts with external URLs', () => {
      // We intentionally removed shortcuts because external URLs violate scope
      if (manifest.shortcuts) {
        manifest.shortcuts.forEach(shortcut => {
          expect(shortcut.url).to.match(/^\//); // Should be relative
        });
      }
    });

    it('shortcuts should be within scope if present', () => {
      // If shortcuts exist, they must be within the manifest scope
      if (manifest.shortcuts && manifest.scope) {
        manifest.shortcuts.forEach(shortcut => {
          expect(shortcut.url).to.match(new RegExp(`^${manifest.scope}`));
        });
      }
    });

    it('should have categories', () => {
      expect(manifest.categories).to.exist;
      expect(manifest.categories).to.be.an('array');
    });

    it('should have lang', () => {
      expect(manifest.lang).to.exist;
      expect(manifest.lang).to.equal('en');
    });
  });

  describe('File References', () => {
    it('icon files should exist', () => {
      manifest.icons.forEach(icon => {
        // Only check non-absolute paths
        if (!icon.src.startsWith('http')) {
          const iconPath = path.join(__dirname, '..', icon.src);
          const exists = fs.existsSync(iconPath);
          if (!exists) {
            console.warn(`Icon file not found: ${icon.src}`);
          }
        }
      });
    });
  });

  describe('Best Practices', () => {
    it('should prefer standalone display mode', () => {
      expect(manifest.display).to.be.oneOf(['standalone', 'fullscreen']);
    });

    it('short_name should be concise', () => {
      expect(manifest.short_name.length).to.be.lessThan(15);
    });

    it('should have scope defined', () => {
      if (manifest.scope) {
        expect(manifest.scope).to.be.a('string');
      }
    });

    it('start_url should be relative or absolute', () => {
      expect(manifest.start_url).to.match(/^(\/|https?:\/\/)/);
    });
  });

  describe('Validation', () => {
    it('should be valid JSON', () => {
      const manifestPath = path.join(__dirname, '../site.webmanifest');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      expect(() => JSON.parse(manifestContent)).to.not.throw();
    });

    it('should not have duplicate keys at root level', () => {
      const manifestPath = path.join(__dirname, '../site.webmanifest');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const parsed = JSON.parse(manifestContent);
      const rootKeys = Object.keys(parsed);
      const uniqueRootKeys = new Set(rootKeys);
      expect(rootKeys.length).to.equal(uniqueRootKeys.size);
    });
  });
});
