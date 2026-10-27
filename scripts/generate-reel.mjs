// Optional asset-generation tool. FFmpeg is only needed to regenerate this video.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
mkdirSync(path.join(root, 'public/video'), { recursive: true });
const shots = ['sistema-os', 'gruhneletrica', 'cursosgruhn', 'crono-propostas-preview'];
const inputs = shots.flatMap((shot) => ['-i', path.join(root, `public/images/${shot}.webp`)]);
const filters = shots.map((_, i) => `[${i}:v]scale=1152:648:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x171022,zoompan=z='1.0+0.0013*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=72:s=1280x720:fps=24,setsar=1,format=yuv420p[v${i}]`);
filters.push('[v0][v1]xfade=transition=smoothleft:duration=1:offset=2[a]', '[a][v2]xfade=transition=fade:duration=1:offset=4[b]', '[b][v3]xfade=transition=smoothup:duration=1:offset=6[out]');
const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex_threads', '1', '-filter_complex', filters.join(';'), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p', '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-bf', '0', '-movflags', '+faststart', path.join(root, 'public/video/projetos-scroll.mp4')], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
console.log('Vídeo dos projetos criado com transições e quadros-chave a cada 250 ms.');
