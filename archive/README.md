# Archived Files

This directory contains old versions of the website that are no longer in use but kept for reference.

## To Complete the Archive Process

Run these commands in your terminal:

```bash
cd /home/i10s/Code/ifuentes-net/i10s.github.io

# Move old HTML files to archive
mv index_old.html archive/2024/
mv index2.html archive/2024/

# Add changes to git
git add .

# Commit the changes
git commit -m "chore: archive old HTML versions"

# Push to remote
git push origin main
```

## Archived Files

After running the commands above, this directory will contain:
- `2024/index_old.html` - Old version (13KB)
- `2024/index2.html` - Alternative version (45KB)

**Total space saved:** ~58KB from the main directory

---

Created: November 6, 2025
