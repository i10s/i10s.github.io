# Security Strategy - DevDependencies

## Context

This project has **ZERO runtime dependencies**. The website is pure static HTML/CSS/JS with no npm packages deployed to production.

All npm dependencies are **devDependencies** (testing tools only):
- `mocha`, `chai` - Testing framework
- `jsdom` - DOM testing
- `lighthouse` - Performance auditing
- `html-validate` - HTML validation
- etc.

## Vulnerability Management

### Current Status (Nov 6, 2025)

✅ **Production**: 0 vulnerabilities (no dependencies)
⚠️ **Development**: 2 critical (underscore in nomnom → unused transitive dep)

### Resolution Strategy

We use npm `overrides` to force secure versions of transitive dependencies:

```json
{
  "overrides": {
    "underscore": "^1.13.6"
  }
}
```

This ensures that even if a devDependency (like an old version of Lighthouse's sub-dependency) requires an old `underscore`, npm will use the safe version.

## Why This Matters (and doesn't)

**Why it matters:**
- Good security hygiene
- Clean CI/CD pipeline
- No warnings in development

**Why it doesn't affect production:**
- These packages are never deployed
- They only run in test environment
- The website is static files only

## Testing the Fix

After adding overrides, running `npm install` will resolve the dependency tree with the secure version:

```bash
# Install with overrides
npm install

# Verify no vulnerabilities
npm audit

# Confirm tests still pass
npm test
```

## Alternative Approaches Considered

1. **`npm audit fix --force`** ❌
   - Could break Lighthouse or other tools with breaking changes
   - Not worth the risk for devDeps

2. **Ignore the warnings** ❌
   - Would fail CI/CD security gate
   - Poor security posture even for dev tools

3. **Remove problematic packages** ❌
   - Lighthouse is essential for performance testing
   - No alternative with equal features

4. **Use overrides** ✅ **CHOSEN**
   - Minimal risk
   - Fixes vulnerability
   - Maintains all functionality
   - Standard npm feature (Node 16.9.0+)

## Future Maintenance

The CI/CD pipeline runs `npm audit --audit-level=moderate` on every commit. If new vulnerabilities are found:

1. Check if they're in devDependencies (non-critical)
2. Try `npm audit fix` first (non-breaking fixes)
3. Add to `overrides` if needed
4. Update the problematic package if available
5. Document the decision here

## References

- npm overrides: <https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides>
- underscore vulnerability: GHSA-cf4h-3jhx-xvhq
- Security policy: [SECURITY.md](./SECURITY.md)
