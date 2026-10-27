import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const assets = [...html.matchAll(/(?:src|href|poster)="\.\/([^"#?]+)"/g)].map((match) => match[1]);
for (const asset of new Set(assets)) {
  const file = path.join(root, asset.startsWith('src/') ? asset : `public/${asset}`);
  if (!(await stat(file).catch(() => null))?.isFile()) throw new Error(`Arquivo ausente: ${asset}`);
}
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });
await cp(path.join(root, 'index.html'), path.join(dist, 'index.html'));
console.log('✓ Build concluído em dist/');
console.log(`✓ ${new Set(assets).size} referências locais verificadas`);
console.log('  Use npm run preview para conferir.');
