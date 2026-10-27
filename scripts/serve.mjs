import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const preview = process.argv.includes('--preview');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || (preview ? 4173 : 5173));
const clients = new Set();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp4': 'video/mp4' };
export function createRequestHandler({ preview = false } = {}) {
  const root = preview ? path.join(projectRoot, 'dist') : projectRoot;
  return async (req, res) => {
  const headers = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': preview ? 'public, max-age=0' : 'no-store' };
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); res.end('Método não permitido'); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400, headers); res.end('URL inválida'); return; }
  if (!preview && pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': connected\n\n'); clients.add(res);
    req.on('close', () => clients.delete(res)); return;
  }
  if (pathname.includes('\0') || pathname.split('/').some((part) => part.startsWith('.')) || pathname.includes('\\')) {
    res.writeHead(404, headers); res.end('Não encontrado'); return;
  }
  // Only website assets are public. Source originals and project files are private.
  const safePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const allowed = safePath === 'index.html' || safePath === 'favicon.svg' || /^(src|images|fonts|video)\//.test(safePath);
  if (!allowed) { res.writeHead(404, headers); res.end('Não encontrado'); return; }
  const target = !preview && !safePath.startsWith('src/') && safePath !== 'index.html' ? path.join(root, 'public', safePath) : path.join(root, safePath);
  if (!target.startsWith(`${root}${path.sep}`)) { res.writeHead(404, headers); res.end('Não encontrado'); return; }
  try {
    const info = await stat(target);
    if (!info.isFile()) throw new Error('not a file');
    let content = await readFile(target);
    const ext = path.extname(target);
    if (ext === '.mp4') {
      headers['Accept-Ranges'] = 'bytes';
      // Media seeks use partial HTTP requests, including on Safari/iOS.
      const range = req.method === 'GET' && !req.headers?.['if-range'] && req.headers?.range;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        const size = content.length;
        let start, end;
        if (match && (match[1] || match[2])) {
          if (match[1]) { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1; }
          else { start = Math.max(0, size - Number(match[2])); end = size - 1; }
        }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
          res.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` }); res.end(); return;
        }
        const part = content.subarray(start, end + 1);
        res.writeHead(206, { ...headers, 'Content-Type': 'video/mp4', 'Content-Length': part.length, 'Content-Range': `bytes ${start}-${end}/${size}` });
        res.end(part); return;
      }
    }
    if (!preview && ext === '.html') content = Buffer.from(content.toString().replace('</body>', '<script>new EventSource("/__reload").onmessage=()=>location.reload();</script></body>'));
    res.writeHead(200, { ...headers, 'Content-Type': types[ext] || 'application/octet-stream', 'Content-Length': content.length });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Não encontrado'); }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const root = preview ? path.join(projectRoot, 'dist') : projectRoot;
if (!existsSync(path.join(root, 'index.html'))) {
  console.error('Execute npm run build antes de usar npm run preview.');
  process.exit(1);
}
const server = http.createServer(createRequestHandler({ preview }));
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `Porta ${port} ocupada. Use npm run ${preview ? 'preview' : 'dev'} -- --port 5174` : error.message);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => {
  console.log(`\n  THIAGO FERREIRA · ${preview ? 'Prévia de produção' : 'Desenvolvimento'}\n\n  Local: http://localhost:${port}\n  ${preview ? 'Build em dist/.' : 'Atualização automática ao salvar os arquivos.'}\n`);
});
const watchers = [];
let reloadTimer;
if (!preview) {
  const reload = () => { clearTimeout(reloadTimer); reloadTimer = setTimeout(() => { for (const client of clients) client.write('data: reload\n\n'); }, 100); };
  for (const entry of ['index.html', 'src', 'public']) {
    watchers.push(watch(path.join(projectRoot, entry), { recursive: entry !== 'index.html' }, reload));
  }
}
const heartbeat = setInterval(() => { for (const client of clients) client.write(': heartbeat\n\n'); }, 20_000);
function shutdown() {
  clearInterval(heartbeat); clearTimeout(reloadTimer);
  for (const watcher of watchers) watcher.close();
  for (const client of clients) client.end();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}
