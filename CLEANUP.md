# File Cleanup Recommendations

## Files That Can Be Safely Removed

These files are no longer used in the optimized main site and can be archived or deleted:

### Old HTML Files (45KB + 13KB = 58KB savings)

```bash
# Move to archive folder
mkdir -p archive
mv index2.html archive/
mv index_old.html archive/
```

**Files:**
- `index2.html` (45KB) - Old version, not in use
- `index_old.html` (13KB) - Old version, not in use

### Unused CSS Files

The main `index.html` uses inline CSS and doesn't reference these external stylesheets:

```bash
# If not used by other pages (lab/, stocks/, v2/):
# mv style.css archive/
```

**Files:**
- `style.css` - 404 page styles (keep if you have a custom 404.html)
- `assets/css/main.css` - Large template CSS (1055 lines, ~30KB) - not used by main page

**Action:** Review if these are used by:
- `/lab/index.html`
- `/stocks/index.html`
- `/v2/index.html`

If not used anywhere, move to archive.

### Legacy Directories

Check if these subdirectories are still needed:

- `v2/` - Alternative version? (has its own complete site)
- `lab/` - Lab experiments page
- `stocks/` - Stock quotes page

**Action:** Review each directory and determine if still relevant.

## Archive Structure

Recommended archive organization:

```
archive/
├── 2024/
│   └── versions/
│       ├── index_old.html
│       └── index2.html
├── unused-css/
│   ├── style.css
│   └── main.css
└── old-assets/
    └── (any unused images/fonts)
```

## Commands to Clean Up

```bash
# Create archive directory
mkdir -p archive/versions
mkdir -p archive/unused-css
mkdir -p archive/old-assets

# Move old HTML files
mv index_old.html archive/versions/
mv index2.html archive/versions/

# Add to .gitignore if you don't want to track archives
echo "archive/" >> .gitignore

# Commit the changes
git add .
git commit -m "chore: archive unused files, clean up project structure"
git push origin main
```

## Before Deleting, Check:

1. **Search for references:**
   ```bash
   # Check if any file references the old HTML files
   grep -r "index2.html" .
   grep -r "index_old.html" .
   
   # Check CSS usage
   grep -r "style.css" .
   grep -r "assets/css/main.css" .
   ```

2. **Check analytics:**
   - Review if these pages receive traffic
   - Check for inbound links

3. **Verify subdirectories:**
   ```bash
   # Check what's in each directory
   ls -lh v2/
   ls -lh lab/
   ls -lh stocks/
   ```

## Current Size Analysis

```bash
# Current project size
du -sh .                    # Total: ~7.4MB

# Size by directory
du -sh assets/             # Check assets size
du -sh v2/                 # Check v2 size
du -sh images/             # Check images size
```

## Optimization Opportunities

### Images

Check if images are optimized:

```bash
# List all images with sizes
find . -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) -exec ls -lh {} \;

# Consider converting to WebP
# cwebp -q 80 image.jpg -o image.webp
```

### Fonts

If you have unused fonts in `assets/webfonts/`:

```bash
ls -lh assets/webfonts/
# Remove if using system fonts (which you are in main index.html)
```

## Impact Summary

**Immediate cleanup:**
- Old HTML files: ~58KB
- Potential CSS cleanup: ~30KB+
- Total savings: ~90KB+

**After cleanup:**
- Faster repository cloning
- Cleaner project structure
- Easier maintenance
- Better organization

## Safe Cleanup Commands

Run these commands to safely archive old files:

```bash
#!/bin/bash
# Safe cleanup script

echo "Creating archive directory..."
mkdir -p archive/2024

echo "Moving old HTML versions..."
mv index_old.html archive/2024/ 2>/dev/null
mv index2.html archive/2024/ 2>/dev/null

echo "Creating README in archive..."
cat > archive/README.md << 'EOF'
# Archived Files

This directory contains old versions and unused files from the website.

## Contents

- `2024/` - HTML versions from 2024 and earlier
- These files are kept for reference but are not used in production

## Restoration

To restore a file:
```bash
cp archive/path/to/file ./
```

---
Archived: November 2025
EOF

echo "Done! Review changes with: git status"
```

## Keep These Files

**Essential files:**
- `index.html` - Main optimized page ✓
- `site.webmanifest` - PWA manifest ✓
- `robots.txt` - SEO ✓
- `sitemap.xml` - SEO ✓
- `.htaccess` - Performance/security ✓
- `CNAME` - Domain configuration ✓
- All favicon files - Branding ✓
- `if.png`, `ifuentes.jpg` - Profile images ✓

**Documentation files:**
- `README.md` - Project docs ✓
- `OPTIMIZATIONS.md` - Optimization details ✓
- `DEPLOYMENT_CHECKLIST.md` - Deploy guide ✓
- `CLEANUP.md` - This file ✓
- `audit.sh` - Testing script ✓

## Questions to Answer

1. **Is v2/ directory needed?**
   - If yes: Keep it
   - If no: Archive it (saves significant space)

2. **Are lab/ and stocks/ actively used?**
   - Check analytics
   - Check last update date
   - Consider linking from main page or archiving

3. **Are assets/css files used by subpages?**
   - Check references
   - If only used by archived pages, archive them too

## Final Recommendation

**Conservative approach (recommended):**
1. Archive old HTML files (index2.html, index_old.html)
2. Keep everything else until usage is verified
3. Document what each directory is for
4. Review quarterly

**Aggressive approach:**
1. Archive all old HTML
2. Review and archive unused CSS
3. Consolidate or archive subdirectories (v2, lab, stocks)
4. Keep only production files

---

**Next Steps:**
1. Review this document
2. Run the safe cleanup script
3. Test the site
4. Commit and deploy

**Last Updated:** November 2025
