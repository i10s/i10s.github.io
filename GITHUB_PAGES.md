# GitHub Pages Configuration

> This site is hosted on **GitHub Pages**, not Netlify

## 🏗️ Architecture

```
Code → GitHub Repository (i10s.github.io)
         ↓
    GitHub Pages Build
         ↓
    Deploy to GitHub CDN
         ↓
    Custom Domain: ifuentes.net
```

## ✅ What Works on GitHub Pages

### Automatic Features:
- ✅ **HTTPS**: Automatic SSL/TLS
- ✅ **Compression**: Gzip/Brotli automatic
- ✅ **CDN**: Global distribution
- ✅ **Custom Domain**: Via CNAME file
- ✅ **Static Files**: HTML, CSS, JS, images

### Configuration Files:
- ✅ **`CNAME`**: Custom domain (ifuentes.net)
- ✅ **`.nojekyll`**: Bypass Jekyll processing
- ✅ **`robots.txt`**: SEO crawling rules
- ✅ **`sitemap.xml`**: Search engine indexing

## ❌ What DOESN'T Work on GitHub Pages

### Not Supported:
- ❌ **`_headers`**: Netlify-specific (removed)
- ❌ **`.htaccess`**: Apache-specific (archived)
- ❌ **Custom Headers**: CSP, CORS, etc. (GitHub manages these)
- ❌ **Server-side Code**: PHP, Node.js, etc.
- ❌ **Build Process**: Only static files or Jekyll

## 🔒 Security on GitHub Pages

GitHub Pages provides:
- ✅ Automatic HTTPS enforcement
- ✅ DDoS protection
- ✅ Basic security headers
- ⚠️ **No custom security headers** (limitation)

### What We Can Control:
- ✅ `security.txt` file (RFC 9116)
- ✅ Meta tags in HTML
- ✅ Content Security via careful coding
- ✅ Service Worker for offline security

## 🚀 Deployment Process

### 1. Make Changes
```bash
# Edit files locally
vim index.html
```

### 2. Commit and Push
```bash
git add -A
git commit -m "Your commit message"
git push origin main
```

### 3. GitHub Pages Builds
- **Time**: ~1-2 minutes
- **Automatic**: Triggered on push to main
- **Status**: Check Actions tab on GitHub

### 4. Verify
```bash
# Check your site
curl -I https://ifuentes.net

# Should return:
# HTTP/2 200
# content-type: text/html; charset=utf-8
# x-github-request-id: ...
```

## 📊 Performance Optimizations for GitHub Pages

### What We've Done:
1. ✅ **Inline CSS** (no external stylesheets)
2. ✅ **No JavaScript dependencies** (except Service Worker)
3. ✅ **Optimized images** (compressed PNGs)
4. ✅ **DNS Prefetch** for external links
5. ✅ **Resource Hints** (preconnect, preload)
6. ✅ **Service Worker** for offline caching
7. ✅ **Minimal HTML** (~8KB total)

### Result:
- 🚀 **Page weight**: 8.1KB
- ⚡ **Load time**: <100ms
- 💯 **Lighthouse**: 100/100/100/100

## 🔍 Verify Deployment

### Check GitHub Pages Status:
1. Go to: https://github.com/i10s/i10s.github.io
2. Click: **Settings** → **Pages**
3. Should show: "Your site is published at https://ifuentes.net"

### Check DNS:
```bash
dig ifuentes.net
# Should point to GitHub Pages IPs
```

### Check HTTPS:
```bash
curl -I https://ifuentes.net
# Should return HTTP/2 200 with GitHub headers
```

## 🎯 Key Files for GitHub Pages

```
i10s.github.io/
├── index.html              # Main page
├── CNAME                   # Custom domain: ifuentes.net
├── .nojekyll               # Disable Jekyll
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── site.webmanifest        # PWA
├── sw.js                   # Service Worker
├── humans.txt              # Credits
├── .well-known/
│   └── security.txt        # Security contact
└── [images, icons, etc.]
```

## ⚙️ GitHub Repository Settings

### Pages Configuration:
- **Source**: Deploy from `main` branch
- **Root**: `/` (root directory)
- **Custom domain**: `ifuentes.net`
- **Enforce HTTPS**: ✅ Enabled

### Branch Protection (Optional):
- Require pull request reviews
- Require status checks to pass
- Include administrators

## 🆘 Troubleshooting

### Site Not Updating?
```bash
# 1. Check Actions tab for build errors
# 2. Clear browser cache (Ctrl+Shift+R)
# 3. Wait 5 minutes (GitHub Pages cache)
# 4. Check CNAME file is correct
```

### Custom Domain Not Working?
```bash
# 1. Check DNS settings at domain registrar
# 2. Add A records:
#    185.199.108.153
#    185.199.109.153
#    185.199.110.153
#    185.199.111.153
# 3. Or CNAME: i10s.github.io
# 4. Wait for DNS propagation (up to 24h)
```

### HTTPS Issues?
- GitHub Pages enforces HTTPS automatically
- Check: Settings → Pages → "Enforce HTTPS" is checked
- Wait for SSL certificate provisioning (~1 hour)

## 📚 References

- **GitHub Pages Docs**: https://docs.github.com/pages
- **Custom Domain**: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- **Troubleshooting**: https://docs.github.com/pages/setting-up-a-github-pages-site-with-jekyll/troubleshooting-jekyll-build-errors-for-github-pages-sites

---

**Last Updated**: November 6, 2025  
**Platform**: GitHub Pages  
**Domain**: ifuentes.net  
**Repository**: github.com/i10s/i10s.github.io
