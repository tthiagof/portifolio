import { initScrollCinema } from './scroll-cinema.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let userReduced = false;
try { userReduced = localStorage.getItem('portfolio-motion') === 'reduced'; } catch { /* Storage is optional. */ }
let reducedMotion = systemMotion.matches || userReduced;

const projects = {
  'crono-os': {
    name: 'Crono OS', category: 'SISTEMA WEB / PRODUTO CRONO', image: './images/sistema-os.webp',
    alt: 'Painel do Crono OS com indicadores e gestão de ordens de serviço',
    description: 'Uma plataforma para organizar a operação de campo, da abertura da ordem ao relatório final. O Crono OS reúne informações de atendimentos, clientes, equipe e estoque para facilitar a rotina de empresas de serviços.',
    features: ['Ordens de serviço', 'Clientes e equipe', 'Materiais e estoque', 'Relatórios da operação'],
    url: 'https://cronosistemas.com/sistema/crono-os/', cta: 'Conhecer o Crono OS',
  },
  gruhn: {
    name: 'Gruhn Elétrica', category: 'SITE INSTITUCIONAL / PROJETO CRONO', image: './images/gruhneletrica.webp',
    alt: 'Site institucional da Gruhn Elétrica',
    description: 'Uma presença digital para apresentar os serviços e o portfólio da Gruhn Elétrica, aproximando a empresa de novos clientes. Um espaço para conhecer o trabalho da equipe e encontrar um caminho direto para o contato.',
    features: ['Apresentação institucional', 'Serviços da empresa', 'Portfólio de trabalhos', 'Contato com clientes'],
    url: 'https://www.gruhneletrica.com/', cta: 'Visitar o site',
  },
  cursos: {
    name: 'Cursos Gruhn', category: 'PLATAFORMA DE CURSOS / PROJETO CRONO', image: './images/cursosgruhn.webp',
    alt: 'Página da plataforma Cursos Gruhn',
    description: 'Uma experiência digital dedicada aos cursos de elétrica da Gruhn. O projeto apresenta oportunidades de aprendizado para técnicos, eletricistas e pessoas que querem dar os primeiros passos na área.',
    features: ['Experiência de cursos', 'Apresentação das formações', 'Conteúdo para profissionais', 'Presença digital educacional'],
    url: 'https://cursos.gruhneletrica.com/', cta: 'Conhecer a plataforma',
  },
  propostas: {
    name: 'Crono Propostas', category: 'PRÉ-LANÇAMENTO / PRODUTO CRONO', image: './images/crono-propostas-preview.webp',
    alt: 'Prévia do Crono Propostas, produto em pré-lançamento',
    description: 'Um produto da Crono pensado para criar, enviar e acompanhar propostas comerciais profissionais. O Crono Propostas está em pré-lançamento; a imagem apresenta uma prévia da experiência.',
    features: ['Criação de propostas', 'Apresentação profissional', 'Envio e acompanhamento', 'Produto em pré-lançamento'],
    url: 'https://cronosistemas.com/sistema/crono-propostas/', cta: 'Conhecer a proposta do produto',
  },
};

// A native dialog supplies focus containment and Escape-key support.
const dialog = $('.project-dialog');
let projectTrigger;
$$('[data-open-project]').forEach((button) => {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.openProject];
    if (!project) return;
    projectTrigger = button;
    $('#dialog-title').textContent = project.name;
    $('#dialog-category').textContent = project.category;
    $('#dialog-description').textContent = project.description;
    $('#dialog-image').src = project.image;
    $('#dialog-image').alt = project.alt;
    const features = project.features.map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    });
    $('#dialog-features').replaceChildren(...features);
    const link = $('#dialog-link');
    link.href = project.url;
    link.firstChild.textContent = `${project.cta} `;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
    $('.dialog-close').focus({ preventScroll: true });
  });
});
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  projectTrigger?.focus({ preventScroll: true });
});

const cards = $$('.project-card');
$$('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('.filter').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    cards.forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.hidden = !show;
      card.classList.remove('is-entering');
      if (show) {
        visible += 1;
        card.classList.add('is-visible');
        if (!reducedMotion) requestAnimationFrame(() => card.classList.add('is-entering'));
      }
    });
    $('.project-count').textContent = `${visible} projetos ${filter === 'all' ? 'selecionados' : 'encontrados'}`;
    document.dispatchEvent(new Event('portfolio:layoutchange'));
  });
});

const menu = $('#mobile-menu');
const menuToggle = $('.menu-toggle');
const main = $('main');
const footer = $('.site-footer');
function setMenu(open, restoreFocus = false) {
  menu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', open);
  main.inert = open;
  footer.inert = open;
  if (open) $('a', menu).focus({ preventScroll: true });
  else if (restoreFocus) menuToggle.focus({ preventScroll: true });
}
menuToggle.addEventListener('click', () => setMenu(menu.hidden, !menu.hidden));
$$('a', menu).forEach((link) => link.addEventListener('click', () => {
  setMenu(false);
  const target = $(link.getAttribute('href'));
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}));
document.addEventListener('keydown', (event) => {
  if (menu.hidden) return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
    const focusable = [menuToggle, ...$$('a', menu)];
    const index = focusable.indexOf(document.activeElement);
    event.preventDefault();
    focusable[(index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
  }
});
matchMedia('(min-width: 761px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

// Native details stay functional when scripting is unavailable.
$$('.service').forEach((service) => {
  service.addEventListener('toggle', () => {
    if (service.open) $$('.service').filter((other) => other !== service).forEach((other) => { other.open = false; });
    document.dispatchEvent(new Event('portfolio:layoutchange'));
  });
});

const motionToggle = $('.motion-toggle');
function updateMotion() {
  reducedMotion = systemMotion.matches || userReduced;
  root.classList.toggle('motion-reduced', reducedMotion);
  motionToggle.setAttribute('aria-pressed', String(reducedMotion));
  motionToggle.disabled = systemMotion.matches;
  $('.motion-label').textContent = systemMotion.matches ? 'Movimento reduzido pelo sistema' : reducedMotion ? 'Ativar animações' : 'Reduzir animações';
  motionToggle.title = systemMotion.matches ? 'A preferência de movimento reduzido do seu dispositivo está sendo respeitada.' : '';
  if (reducedMotion) {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
    $$('.magnetic, [data-tilt]').forEach((el) => { el.style.transform = ''; });
    $('.portrait-scene').style.translate = '';
  }
  syncParticles();
  document.dispatchEvent(new Event('portfolio:motionchange'));
}
motionToggle.addEventListener('click', () => {
  userReduced = !userReduced;
  try { localStorage.setItem('portfolio-motion', userReduced ? 'reduced' : 'full'); } catch { /* No persistence required. */ }
  updateMotion();
});
systemMotion.addEventListener('change', updateMotion);

if ('IntersectionObserver' in window) {
  root.classList.add('js-motion');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$('.desktop-nav a').forEach((link) => {
        const current = link.hash === `#${entry.target.id}`;
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  $$('main section[id]').forEach((section) => navObserver.observe(section));
}

// Pointer effects never intercept native mouse or touch interactions.
const aura = $('.cursor-aura');
let pointerX = -1000;
let pointerY = -1000;
document.addEventListener('pointermove', (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (reducedMotion || !finePointer.matches) return;
  aura.style.left = `${pointerX}px`;
  aura.style.top = `${pointerY}px`;
  aura.style.opacity = '1';
}, { passive: true });
document.addEventListener('pointerleave', () => { aura.style.opacity = '0'; });
$$('.magnetic').forEach((el) => {
  el.addEventListener('pointermove', (event) => {
    if (reducedMotion || !finePointer.matches) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.13;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});
$$('[data-tilt]').forEach((el) => {
  el.addEventListener('pointermove', (event) => {
    if (reducedMotion || !finePointer.matches) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotation = el.classList.contains('portrait-wrap') ? -4 : 0;
    el.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 7}deg) rotateZ(${rotation}deg)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

const progress = $('.scroll-progress');
const portraitScene = $('.portrait-scene');
let scrollFrame = 0;
function renderScroll() {
  scrollFrame = 0;
  const range = root.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
  if (!reducedMotion && innerWidth > 760 && scrollY < innerHeight) portraitScene.style.translate = `0 ${scrollY * 0.065}px`;
}
addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll); }, { passive: true });
renderScroll();

// A small ambient field; work stops when the hero leaves the screen.
const canvas = $('.particle-canvas');
const context = canvas.getContext('2d');
const hero = $('.hero');
let particles = [];
let particleFrame = 0;
let heroVisible = true;
let canvasWidth = 0;
let canvasHeight = 0;
let previousTime = 0;
function sizeCanvas() {
  const rect = hero.getBoundingClientRect();
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(canvasWidth * ratio);
  canvas.height = Math.round(canvasHeight * ratio);
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = innerWidth < 761 ? 17 : 38;
  particles = Array.from({ length: count }, () => ({ x: Math.random() * canvasWidth, y: Math.random() * canvasHeight, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, radius: Math.random() * 1.1 + 0.4 }));
}
function drawParticles(time) {
  particleFrame = 0;
  if (!context || reducedMotion || !heroVisible || document.hidden) return;
  const delta = Math.min((time - previousTime) / 16.67 || 1, 2);
  previousTime = time;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const rect = hero.getBoundingClientRect();
  const px = pointerX - rect.left;
  const py = pointerY - rect.top;
  particles.forEach((p, index) => {
    p.x = (p.x + p.vx * delta + canvasWidth) % canvasWidth;
    p.y = (p.y + p.vy * delta + canvasHeight) % canvasHeight;
    context.fillStyle = 'rgba(181, 137, 255, 0.45)';
    context.beginPath(); context.arc(p.x, p.y, p.radius, 0, Math.PI * 2); context.fill();
    if (Math.hypot(p.x - px, p.y - py) < 160 && finePointer.matches) {
      context.strokeStyle = 'rgba(181, 137, 255, 0.14)'; context.lineWidth = 0.6;
      context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(px, py); context.stroke();
    }
    for (let j = index + 1; j < particles.length; j++) {
      const other = particles[j];
      const distance = Math.hypot(p.x - other.x, p.y - other.y);
      if (distance > 100) continue;
      context.strokeStyle = `rgba(181, 137, 255, ${(1 - distance / 100) * 0.12})`;
      context.lineWidth = 0.5; context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(other.x, other.y); context.stroke();
    }
  });
  particleFrame = requestAnimationFrame(drawParticles);
}
function syncParticles() {
  if (particleFrame) cancelAnimationFrame(particleFrame);
  particleFrame = 0;
  if (context && !reducedMotion && heroVisible && !document.hidden) {
    previousTime = performance.now();
    particleFrame = requestAnimationFrame(drawParticles);
  }
}
if ('ResizeObserver' in window) new ResizeObserver(sizeCanvas).observe(hero);
else addEventListener('resize', sizeCanvas);
if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncParticles(); }).observe(hero);
document.addEventListener('visibilitychange', syncParticles);
sizeCanvas();
updateMotion();

function updateClock() {
  $('.local-clock').textContent = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(new Date());
}
updateClock();
setInterval(updateClock, 30_000);
$('#year').textContent = new Date().getFullYear();

initScrollCinema({ isReduced: () => reducedMotion });
