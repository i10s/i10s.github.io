# Deployment Checklist

Use this checklist before deploying changes to production.

## Pre-Deployment

### Code Quality

- [ ] HTML validated (no errors)
- [ ] CSS follows best practices
- [ ] No console errors in browser
- [ ] No broken links
- [ ] All images have proper alt text
- [ ] Code is properly commented

### Performance

- [ ] Page weight < 10KB (excluding images)
- [ ] No render-blocking resources
- [ ] Images optimized (WebP, compressed)
- [ ] Critical CSS inlined
- [ ] Fonts optimized or using system fonts
- [ ] No unused CSS/JS

### Accessibility

- [ ] All interactive elements keyboard accessible
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] ARIA labels where needed
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] Reduced motion preference supported

### SEO

- [ ] Meta description present and accurate
- [ ] Title tag optimized (< 60 characters)
- [ ] Open Graph tags complete
- [ ] Twitter Card tags present
- [ ] Structured data (JSON-LD) valid
- [ ] Canonical URL set
- [ ] robots.txt configured
- [ ] sitemap.xml up to date

### Security

- [ ] All external links have `noopener noreferrer`
- [ ] HTTPS enforced
- [ ] Security headers configured (CSP, X-Frame-Options)
- [ ] No sensitive data exposed
- [ ] Forms have CSRF protection (if applicable)

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Design

- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px - 1920px)
- [ ] Large screens (1921px+)
- [ ] Touch targets min 48x48px

### Content

- [ ] All text proofread
- [ ] Links tested and working
- [ ] Contact information up to date
- [ ] Copyright year current
- [ ] Profile images optimized

## Testing

### Automated Tests

```bash
# Run audit script
./audit.sh

# Lighthouse audit
npx lighthouse https://ifuentes.net --view

# HTML validation
curl -H "Content-Type: text/html; charset=utf-8" \
     --data-binary @index.html \
     https://validator.w3.org/nu/?out=json
```

### Manual Tests

- [ ] Test in incognito/private mode
- [ ] Clear cache and reload
- [ ] Test dark mode
- [ ] Test keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Print preview looks correct

### Performance Metrics

Target metrics:
- [ ] First Contentful Paint (FCP): < 1s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] First Input Delay (FID): < 100ms
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] Time to Interactive (TTI): < 3s

### Lighthouse Scores

Target scores (100/100):
- [ ] Performance: 100
- [ ] Accessibility: 100
- [ ] Best Practices: 100
- [ ] SEO: 100

## Deployment

### Pre-Deploy

- [ ] Backup current version
- [ ] Test on staging (if available)
- [ ] Review git diff
- [ ] Update version/changelog if applicable

### Deploy Commands

```bash
# Commit changes
git add .
git commit -m "Description of changes"

# Push to main (triggers auto-deploy on Netlify)
git push origin main
```

### Post-Deploy Verification

- [ ] Site loads successfully
- [ ] No 404 errors in console
- [ ] All pages accessible
- [ ] Forms working (if applicable)
- [ ] Analytics tracking (if configured)

### Monitoring

- [ ] Check Netlify deploy status
- [ ] Verify DNS resolution
- [ ] Check SSL certificate
- [ ] Monitor error logs
- [ ] Check uptime status

## Post-Deployment

### Verification

- [ ] Site loads in < 2 seconds
- [ ] All links functional
- [ ] Images display correctly
- [ ] Dark mode works
- [ ] Mobile responsive

### External Tools

- [ ] Google Search Console check
- [ ] PageSpeed Insights: https://pagespeed.web.dev/
- [ ] Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- [ ] WAVE Accessibility: https://wave.webaim.org/
- [ ] SSL Labs Test: https://www.ssllabs.com/ssltest/

### Analytics (if configured)

- [ ] Tracking code firing
- [ ] Real User Monitoring active
- [ ] Error tracking configured

## Rollback Plan

If issues occur:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push -f origin main
```

## Documentation

- [ ] README.md updated
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Comments added for complex code
- [ ] Documentation reflects current state

## Maintenance Schedule

### Daily
- Monitor uptime
- Check error logs

### Weekly
- Review analytics
- Check for broken links
- Review performance metrics

### Monthly
- Update dependencies (if any)
- Review and update content
- Check SSL certificate expiry
- Audit accessibility
- Performance audit

### Quarterly
- Comprehensive security audit
- SEO audit
- Content refresh
- Browser compatibility check

## Emergency Contacts

- **Domain Registrar**: [Add details]
- **Hosting**: Netlify (https://app.netlify.com)
- **DNS Provider**: [Add details]
- **SSL Certificate**: Let's Encrypt (auto-renewed by Netlify)

## Notes

- Netlify auto-deploys on push to main branch
- Build time: ~1 minute
- CDN cache: Configured in netlify.toml (if present)
- Custom domain: ifuentes.net configured in Netlify

---

**Last Updated**: November 2025
**Next Review**: December 2025
