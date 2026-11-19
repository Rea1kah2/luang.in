/**
 * luang.in Production Web Server (Render & Local)
 * Serves Static PWA (web/) + Neon PostgreSQL API (/api/data) + Healthchecks (/health)
 */

try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional in production
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const dataHandler = require('./api/data');

const PORT = parseInt(process.env.PORT || '10000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const WEB_DIR = path.join(__dirname, 'web');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function serveStatic(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(WEB_DIR, relativePath);

  // Security: Prevent path traversal outside WEB_DIR
  if (!filePath.startsWith(WEB_DIR)) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for single-page routing if file doesn't exist
      const indexPath = path.join(WEB_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, indexData) => {
        if (readErr) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.statusCode = 200;
        res.end(indexData);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // Precision caching for Service Worker & Manifest vs static assets
    const baseName = path.basename(filePath);
    if (baseName === 'sw.js' || baseName === 'manifest.json') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Service-Worker-Allowed', '/');
    } else if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.statusCode = 500;
      res.end('Server File Error');
    });
    res.statusCode = 200;
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  // CORS Preflight headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-jadwalin-pin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  req.query = Object.fromEntries(parsedUrl.searchParams);

  // Extend res with helper methods matching Vercel/Express signature
  res.status = function (code) {
    res.statusCode = code;
    return {
      json: (data) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
      },
      end: () => res.end()
    };
  };

  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };

  // Route: Healthcheck for Render Blueprint
  if (pathname === '/health') {
    req.url = '/api/data?ping=true';
    return dataHandler(req, res);
  }

  // Route: /api/data API endpoint
  if (pathname === '/api/data' || pathname.startsWith('/api/')) {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
      // Safeguard against unbounded payloads (> 10MB)
      if (rawBody.length > 10 * 1024 * 1024) {
        res.status(413).json({ error: 'PAYLOAD_TOO_LARGE' });
        req.destroy();
      }
    });

    req.on('end', () => {
      req.body = rawBody;
      dataHandler(req, res).catch((err) => {
        console.error('API Handler Exception:', err);
        if (!res.writableEnded) {
          res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: err.message });
        }
      });
    });
    return;
  }

  // Route: Static files from web/
  serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`[luang.in] Server running at http://${HOST}:${PORT}`);
  console.log(`[luang.in] Database URL configured: ${Boolean(process.env.DATABASE_URL)}`);
  console.log(`[luang.in] Healthcheck ready at http://${HOST}:${PORT}/health`);
});
