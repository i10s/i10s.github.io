#!/usr/bin/env node

/**
 * Simple development server with live reload
 * Zero dependencies - uses only Node.js built-in modules
 * 
 * Usage: node scripts/dev-server.js
 * Or add to package.json: "dev": "node scripts/dev-server.js"
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = path.join(__dirname, '..');

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
};

// Live reload injector script
const liveReloadScript = `
<script>
(function() {
  const connect = () => {
    const ws = new WebSocket('ws://localhost:${PORT}/livereload');
    ws.onopen = () => console.log('[Live Reload] Connected');
    ws.onmessage = (msg) => {
      if (msg.data === 'reload') {
        console.log('[Live Reload] Reloading...');
        location.reload();
      }
    };
    ws.onclose = () => {
      console.log('[Live Reload] Disconnected, retrying...');
      setTimeout(connect, 1000);
    };
  };
  connect();
})();
</script>
`;

// WebSocket clients
const wsClients = [];

// Create HTTP server
const server = http.createServer((req, res) => {
  // Handle WebSocket upgrade for live reload
  if (req.url === '/livereload') {
    return;
  }

  // Determine file path
  let filePath = path.join(ROOT_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try with .html extension
      if (!filePath.endsWith('.html')) {
        const htmlPath = filePath + '.html';
        fs.stat(htmlPath, (err2, stats2) => {
          if (!err2 && stats2.isFile()) {
            serveFile(htmlPath, res);
          } else {
            serve404(res);
          }
        });
      } else {
        serve404(res);
      }
      return;
    }

    serveFile(filePath, res);
  });
});

// Serve file with live reload injection
function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error loading file: ${err}`);
      return;
    }

    // Inject live reload script into HTML files
    if (ext === '.html') {
      content = Buffer.from(
        content.toString().replace('</body>', `${liveReloadScript}</body>`)
      );
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

// Serve 404 page
function serve404(res) {
  const offlinePath = path.join(ROOT_DIR, 'offline.html');
  fs.readFile(offlinePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
}

// Upgrade HTTP connection to WebSocket
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/livereload') {
    // Simple WebSocket handshake
    const key = req.headers['sec-websocket-key'];
    const hash = require('crypto')
      .createHash('sha1')
      .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64');

    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${hash}\r\n` +
      '\r\n'
    );

    wsClients.push(socket);

    socket.on('close', () => {
      const index = wsClients.indexOf(socket);
      if (index > -1) wsClients.splice(index, 1);
    });
  }
});

// Watch for file changes
const watchedExtensions = ['.html', '.css', '.js', '.json'];
const watchedDirs = [ROOT_DIR];

function watchFiles() {
  watchedDirs.forEach(dir => {
    fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
      if (err) return;

      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          watchedDirs.push(fullPath);
          watchFiles();
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (watchedExtensions.includes(ext)) {
            fs.watch(fullPath, () => {
              console.log(`[File changed] ${entry.name}`);
              notifyClients();
            });
          }
        }
      });
    });
  });
}

// Notify all WebSocket clients to reload
function notifyClients() {
  wsClients.forEach(client => {
    try {
      // Send WebSocket frame (opcode 0x81 = text frame)
      const msg = Buffer.from('reload');
      const frame = Buffer.concat([
        Buffer.from([0x81, msg.length]),
        msg
      ]);
      client.write(frame);
    } catch (e) {
      console.error('Error notifying client:', e);
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${ROOT_DIR}`);
  console.log(`🔄 Live reload enabled\n`);
  console.log(`Press Ctrl+C to stop\n`);
  
  watchFiles();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
