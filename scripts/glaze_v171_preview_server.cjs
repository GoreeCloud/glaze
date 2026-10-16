'use strict';
// Restrict the local qualification HTTP server to preview assets.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const roots = new Set(['reference', 'assets', 'css', 'js', 'tokens', 'integrations']);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2'
};
function createPreviewServer(rootDirectory) {
  const root = fs.realpathSync(rootDirectory);
  return http.createServer((request, response) => {
    const headers = {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'};
    const reject = (status, message) => response.writeHead(status, headers).end(message);
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return reject(405, 'Method not allowed');
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      return reject(400, 'Malformed URL');
    }
    if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('\0'))
      return reject(400, 'Malformed path');
    const components = pathname.slice(1).split('/');
    if (!roots.has(components[0]) || components.some(part => !part || part === '.' || part === '..' || part.startsWith('.')))
      return reject(403, 'Forbidden');
    const assetRoot = path.join(root, components[0]);
    const withinAssetRoot = target => target.startsWith(assetRoot + path.sep);
    const candidate = path.resolve(root, ...components);
    if (!withinAssetRoot(candidate)) return reject(403, 'Forbidden');
    const type = types[path.extname(candidate).toLowerCase()];
    if (!type) return reject(403, 'Unsupported asset');
    fs.realpath(candidate, (error, resolved) => {
      if (error) return reject(404, 'Not found');
      // A symlink must not alias a non-preview root, hidden file, or another asset root.
      if (!withinAssetRoot(resolved) || path.relative(root, resolved).split(path.sep).some(part => part.startsWith('.')))
        return reject(403, 'Forbidden');
      fs.stat(resolved, (statError, stat) => {
        if (statError || !stat.isFile()) return reject(404, 'Not found');
        fs.readFile(resolved, (readError, bytes) => {
          if (readError) return reject(404, 'Not found');
          response.writeHead(200, {...headers, 'Content-Type': type});
          response.end(request.method === 'HEAD' ? undefined : bytes);
        });
      });
    });
  });
}
module.exports = {createPreviewServer};
