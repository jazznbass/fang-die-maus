import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.SRT_PORT || 8000);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml' };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!path.startsWith(root + sep) || pathname.includes('/node_modules/')) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(path);
    response.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    }).end(body);
  } catch {
    response.writeHead(404).end('Nicht gefunden');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Mäuse fangen: http://127.0.0.1:${port} — Mit Strg+C beenden`);
});
