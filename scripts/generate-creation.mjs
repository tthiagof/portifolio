// Generates an original 3D motion graphic from vector geometry, not stock footage.
// Rendering only: requires FFmpeg and Sharp. The website has no such dependencies.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const moduleIndex = process.argv.indexOf('--sharp-module');
const sharp = (await import(moduleIndex >= 0 ? pathToFileURL(process.argv[moduleIndex + 1]).href : 'sharp')).default;
const W = 1280, H = 800, frames = 216;
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
const phase = (t, a, b) => ease((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const text = (x, y, value, size = 14, color = '#d4c7e8', weight = 400) => `<text x="${x}" y="${y}" font-family="DejaVu Sans, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${value}</text>`;
const line = (x1, y1, x2, y2, color = '#a87aff', opacity = 1, width = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
const rect = (x, y, w, h, fill = '#1f1831', radius = 8, stroke = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const nodes = [
  { x: -450, y: -275, w: 900, h: 52, content: (t) => `${text(24, 33, 'CRONO', 19, '#ffffff', 700)}${text(121, 32, '/ seu próximo passo', 11, '#8e7ca8')}${rect(725, 16, 110, 22, '#2a1c40', 11)}${text(740, 31, 'CONECTADO', 9, '#c8a9ff')}${rect(852, 16, 21, 21, '#a77af5', 6)}` },
  { x: -450, y: -207, w: 164, h: 482, content: () => `${text(20, 33, 'SEU ESPAÇO', 9, '#79668f')}${['Visão geral', 'Projetos', 'Pessoas', 'Resultados'].map((label, i) => `${i === 0 ? rect(10, 55, 144, 37, '#3a235d', 7) : ''}${rect(23, 67 + i * 55, 12, 12, i === 0 ? '#b28aff' : '#55436a', 3)}${text(45, 78 + i * 55, label, 10, i === 0 ? '#ede3ff' : '#9a86b2')}`).join('')}${line(20, 335, 144, 335, '#aa7bff', .15)}${text(22, 366, 'Tudo conectado.', 10, '#9d83ba')}${rect(20, 412, 124, 44, '#20182c', 7)}${text(33, 439, 'Vamos além ↗', 11, '#c9a7ff')}` },
  { x: -269, y: -207, w: 719, h: 68, content: () => `${text(20, 30, 'Seu negócio, em movimento.', 22, '#f3edff', 500)}${text(21, 52, 'Uma experiência construída ao redor da sua ideia.', 10, '#9682ae')}` },
  ...['Organizar', 'Conectar', 'Evoluir'].map((label, i) => ({ x: -269 + i * 245, y: -122, w: 229, h: 90, content: (t) => `${text(18, 27, ['CLAREZA', 'INTEGRAÇÃO', 'POSSIBILIDADES'][i], 8, '#9580af')}${text(18, 61, label, 23, '#f1e8ff', 500)}<circle cx="197" cy="46" r="16" fill="#ad7fff18" stroke="#b98bff55"/>${text(190, 51, '↗', 15, '#c69aff')}` })),
  { x: -269, y: -15, w: 474, h: 174, content: (t) => {
    const p = phase(t, .57, .9);
    const points = [[20,137],[71,128],[122,140],[174,88],[225,103],[277,66],[328,77],[381,45],[453,35]];
    const chart = points.map(([x,y]) => `${x},${y}`).join(' ');
    return `${text(19, 28, 'NOVOS CAMINHOS', 9, '#a18ab9')}${[65,100,135].map(y=>line(20,y,454,y,'#ad7fff',.08)).join('')}<defs><clipPath id="chartclip"><rect x="0" y="0" width="${474*p}" height="174"/></clipPath></defs><g clip-path="url(#chartclip)"><polygon points="20,155 ${chart} 453,155" fill="url(#chartFill)"/><polyline points="${chart}" fill="none" stroke="#bb92ff" stroke-width="3" stroke-linejoin="round"/><polyline points="${chart}" fill="none" stroke="#bb92ff" stroke-width="7" stroke-opacity=".16" filter="url(#glow)"/></g>`;
  } },
  { x: 222, y: -15, w: 228, h: 174, content: (t) => {
    const p = phase(t, .64, .94);
    return `${text(18,28,'PEÇAS QUE SE CONECTAM',8,'#a18ab9')}<circle cx="67" cy="100" r="39" fill="none" stroke="#342346" stroke-width="10"/><circle cx="67" cy="100" r="39" fill="none" stroke="#b78bff" stroke-width="10" stroke-linecap="round" stroke-dasharray="${220*p} 245" transform="rotate(-90 67 100)"/>${rect(128,75,8,8,'#bb92ff',2)}${text(144,83,'Pessoas',9)}${rect(128,98,8,8,'#7d55b1',2)}${text(144,106,'Ideias',9)}${rect(128,121,8,8,'#4f345e',2)}${text(144,129,'Negócios',9)}`;
  } },
  { x: -269, y: 176, w: 719, h: 99, content: (t) => `${text(20,24,'DA PRIMEIRA IDEIA À PRÓXIMA CONQUISTA',9,'#a18ab9')}${['Entender','Desenhar','Construir','Evoluir'].map((label,i)=>`${rect(20+i*175,44,153,34,t>.64+i*.055?'#3a2457':'#241b32',6)}${text(35+i*175,65,`${String(i+1).padStart(2,'0')}  ${label}`,10,t>.64+i*.055?'#dec7ff':'#766186')}`).join('')}` },
];

function draw(t) {
  const camera = phase(t, .1, .92);
  const yaw = lerp(-.44, -.07, camera), pitch = lerp(.36, .10, camera);
  function project(x, y, z = 0) {
    const xx = x*Math.cos(yaw) + z*Math.sin(yaw), zz = -x*Math.sin(yaw)+z*Math.cos(yaw);
    const yy = y*Math.cos(pitch)-zz*Math.sin(pitch), depth = y*Math.sin(pitch)+zz*Math.cos(pitch);
    const s = 1400/(1400+depth);
    return {x:W/2+xx*s, y:H/2+yy*s+12};
  }
  const point = (p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="ambient"><stop stop-color="#482469" stop-opacity=".5"/><stop offset="1" stop-color="#090b14" stop-opacity="0"/></radialGradient><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a77aff" stop-opacity=".3"/><stop offset="1" stop-color="#a77aff" stop-opacity="0"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="4"/></filter><linearGradient id="panelFill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#20172f"/><stop offset="1" stop-color="#11111f"/></linearGradient></defs>${rect(0,0,W,H,'#090b14',0)}<ellipse cx="640" cy="420" rx="610" ry="380" fill="url(#ambient)"/>`;
  // An architectural grid and orbital paths supply depth without a physical device.
  for(let x=-800;x<=800;x+=80) { const a=project(x,340,-500),b=project(x,340,500);svg+=line(a.x,a.y,b.x,b.y,'#8a5fb3',.10); }
  for(let z=-500;z<=500;z+=80) { const a=project(-800,340,z),b=project(800,340,z);svg+=line(a.x,a.y,b.x,b.y,'#8a5fb3',.10); }
  const orbit=Array.from({length:101},(_,i)=>{const a=i/100*Math.PI*2;return point(project(Math.cos(a)*560,Math.sin(a)*310,80));}).join(' ');
  svg+=`<polyline points="${orbit}" fill="none" stroke="#b589ff" stroke-opacity=".12"/>`;
  // Moving particles converge toward the structure at the beginning.
  for(let i=0;i<62;i++){
    const a=i*2.39996+t*.9, r=lerp(470+(i%7)*30,180+(i%11)*28,phase(t,0,.5));
    const p=project(Math.cos(a)*r,Math.sin(a)*r*.64,(i%5-2)*55);
    const opacity=(.18+(i%4)*.11)*(1-phase(t,.65,1)*.7);
    svg+=`<circle cx="${p.x}" cy="${p.y}" r="${i%4===0?2.3:1.1}" fill="#c9a4ff" opacity="${opacity}"/>`;
    if(i%3===0 && t<.5) svg+=line(p.x,p.y,640,410,'#ab77ff',.025*(1-phase(t,.1,.5)));
  }
  const assembly=phase(t,.07,.33);
  const corners=[[-463,-289],[464,-289],[464,288],[-463,288]].map(([x,y])=>point(project(x,y,32))).join(' ');
  svg+=`<polygon points="${corners}" fill="#110c1e" fill-opacity="${assembly*.65}" stroke="#ad7aff" stroke-opacity="${assembly*.35}" stroke-width="1"/>`;
  // Flying modules resolve into a dashboard. Each is an extruded plane in 3D.
  nodes.forEach((n,i)=>{
    const start=.1+i*.026, settle=.49+i*.027;
    const q=phase(t,start,settle), opacity=phase(t,start,start+.11);
    if(opacity<=0)return;
    const dx=Math.sin(i*4.1)*420*(1-q), dy=Math.cos(i*2.7)*330*(1-q), z=(i%2?1:-1)*(130+i*13)*(1-q);
    const scale=lerp(.2,1,q), w=n.w*scale,h=n.h*scale;
    const x=n.x+dx+(n.w-w)/2,y=n.y+dy+(n.h-h)/2;
    const a=project(x,y,z), b=project(x+w,y,z), c=project(x,y+h,z), d=project(x+w,y+h,z);
    const aa=project(x,y,z+14),bb=project(x+w,y,z+14),cc=project(x,y+h,z+14),dd=project(x+w,y+h,z+14);
    svg+=`<g opacity="${opacity}"><polygon points="${[b,d,dd,bb].map(point).join(' ')}" fill="#39224b" stroke="#8454b0" stroke-width=".6"/><polygon points="${[c,d,dd,cc].map(point).join(' ')}" fill="#1a132a" stroke="#674786" stroke-width=".6"/>`;
    svg+=`<g transform="matrix(${(b.x-a.x)/n.w} ${(b.y-a.y)/n.w} ${(c.x-a.x)/n.h} ${(c.y-a.y)/n.h} ${a.x} ${a.y})">${rect(0,0,n.w,n.h,'url(#panelFill)',8,'#9a6bc94a')}${n.content(t)}</g></g>`;
  });
  // A scanning highlight brings the assembled interface online.
  const scan=phase(t,.52,.97), scanY=lerp(-270,280,scan);
  if(t>.52&&t<.97){const a=project(-450,scanY,-4),b=project(450,scanY,-4);svg+=`<g opacity="${Math.sin(scan*Math.PI)*.65}" filter="url(#glow)">${line(a.x,a.y,b.x,b.y,'#cfabff',1,5)}</g>${line(a.x,a.y,b.x,b.y,'#d7b7ff',Math.sin(scan*Math.PI)*.3,1)}`;}
  // Corner locators and tiny abstract blocks make the opening feel intentional.
  for(const [x,y,sx,sy] of [[-475,-300,1,1],[475,-300,-1,1],[-475,300,1,-1],[475,300,-1,-1]]){
    const a=project(x,y,-5),b=project(x+sx*20,y,-5),c=project(x,y+sy*20,-5);
    svg+=line(a.x,a.y,b.x,b.y,'#cca5ff',.45)+line(a.x,a.y,c.x,c.y,'#cca5ff',.45);
  }
  if(t<.3){const power=1-phase(t,.1,.3);svg+=`<circle cx="640" cy="410" r="${12+power*9}" fill="#c5a1ff" opacity="${power}" filter="url(#glow)"/><circle cx="640" cy="410" r="3" fill="#fff" opacity="${power}"/>`;}
  return svg+'</svg>';
}

await mkdir(path.join(root,'public/video'),{recursive:true});
const ffmpeg=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','png','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-g','6','-keyint_min','6','-sc_threshold','0','-bf','0','-movflags','+faststart',path.join(root,'public/video/criacao-digital-scroll.mp4')],{stdio:['pipe','inherit','inherit']});
let pipeError;
ffmpeg.stdin.on('error',(error)=>{pipeError=error;});
const finished=once(ffmpeg,'close');
for(let i=0;i<frames;i++){
  const frame=await sharp(Buffer.from(draw(i/(frames-1)))).png().toBuffer();
  if(pipeError)throw pipeError;
  if(!ffmpeg.stdin.write(frame))await once(ffmpeg.stdin,'drain');
  if(i%48===0)console.log(`Construção digital: ${i}/${frames} quadros`);
}
ffmpeg.stdin.end();
const [code]=await finished;
if(code!==0)throw new Error(`FFmpeg terminou com código ${code}`);
await sharp(Buffer.from(draw(1))).webp({quality:88}).toFile(path.join(root,'public/images/criacao-digital-poster.webp'));
console.log('Cena original e poster criados.');
