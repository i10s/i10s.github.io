# Offline Page for PWA

When the site is offline and cached content is not available, users will see this page.

## Implementation

The service worker (`sw.js`) handles offline functionality by:
1. Caching critical assets on first visit
2. Serving cached content when offline
3. Falling back to this message if content is not cached

## Cached Assets

- index.html
- if.png (profile image)
- site.webmanifest

## To Create Custom Offline Page

Create `offline.html` in the root directory with a custom message and design.
Then update `sw.js` to cache and serve it when offline.

Example offline.html:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Offline - Iñaki Fuentes</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { color: #666; }
  </style>
</head>
<body>
  <div>
    <h1>📡 You're Offline</h1>
    <p>Please check your internet connection and try again.</p>
  </div>
</body>
</html>
```
