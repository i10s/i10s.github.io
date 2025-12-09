# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

Please report security issues privately to: `mailto:inaki@ifuentes.net`
Do **not** open public issues for potential vulnerabilities.

Acknowledge receipt expected within 72 hours; resolution ETA depends on severity.

## Scope

- HTML/CSS/JS in this repository
- Service Worker caching logic
- Security headers configuration

Out of scope:

- Third-party platforms (LinkedIn, GitHub, external blog)
- Browser-specific vulnerabilities

## Disclosure Process

1. Submit report with reproduction steps.
2. I review & confirm impact.
3. Fix implemented & deployed.
4. (Optional) Public acknowledgment in `security-acknowledgments.html`.

## Security Measures Implemented

### HTTP Security Headers

- **X-Frame-Options**: SAMEORIGIN (clickjacking protection)
- **X-Content-Type-Options**: nosniff (MIME sniffing prevention)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts geolocation, microphone, camera, payment, USB, magnetometer, accelerometer, gyroscope
- **Content-Security-Policy**: Strict CSP with self-origin restrictions
- **Cross-Origin-Embedder-Policy**: require-corp
- **Cross-Origin-Opener-Policy**: same-origin
- **Cross-Origin-Resource-Policy**: same-origin

### Service Worker Security

- Validates URL origins before caching
- Only caches same-origin and HTTPS resources
- Credential handling restricted to same-origin
- GET-only request handling

### Link Security

- All external links use `rel="noopener noreferrer"` to prevent tabnabbing
- Target `_blank` links properly secured

## Preferred Languages

English / Spanish.

## PGP

Key fingerprint hosted at Keybase: <https://keybase.io/ifuentes>

## Additional Info

Formal security.txt: `/.well-known/security.txt`

## Last Security Audit

December 2025
