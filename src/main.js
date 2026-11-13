const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    description: 'Uma presença digital para apresentar os serviços e o portfólio da Gruhn Elétrica, aproximando a empresa de novos clientes. Além dos sistemas que desenvolvi, presto serviços de TI para a empresa, com suporte técnico e acompanhamento da operação digital.',
    features: ['Apresentação institucional', 'Serviços da empresa', 'Serviços de TI e suporte', 'Contato com clientes'],
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
const toggle = $('.menu-toggle');
function closeMenu() { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); }
toggle.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  toggle.setAttribute('aria-expanded', String(!menu.hidden));
  toggle.setAttribute('aria-label', menu.hidden ? 'Abrir menu' : 'Fechar menu');
});
$$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
$('#year').textContent = new Date().getFullYear();

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = $('.motion-toggle');
let motionPaused = false;

const typingText = $('#typing-text');
const typingWords = ['sistemas web', 'automações', 'serviços de TI', 'GitHub e CI/CD', 'robótica móvel'];
let typingTimer = 0;
let typingWordIndex = 0;
let typingCharIndex = 0;
let typingDeleting = false;
function renderTyping() {
  if (typingText) typingText.textContent = typingWords[typingWordIndex].slice(0, typingCharIndex);
}
function typeStep() {
  if (!typingText || motionPaused || motionPreference.matches) return;
  if (document.hidden) { typingTimer = setTimeout(typeStep, 500); return; }
  const word = typingWords[typingWordIndex];
  if (!typingDeleting) {
    typingCharIndex = Math.min(typingCharIndex + 1, word.length);
    renderTyping();
    if (typingCharIndex === word.length) {
      typingDeleting = true;
      typingTimer = setTimeout(typeStep, 1700);
      return;
    }
    typingTimer = setTimeout(typeStep, 62 + Math.random() * 46);
    return;
  }
  typingCharIndex = Math.max(typingCharIndex - 1, 0);
  renderTyping();
  if (typingCharIndex === 0) {
    typingDeleting = false;
    typingWordIndex = (typingWordIndex + 1) % typingWords.length;
    typingTimer = setTimeout(typeStep, 380);
    return;
  }
  typingTimer = setTimeout(typeStep, 32);
}
function startTyping() {
  if (!typingText || motionPaused || motionPreference.matches) return;
  clearTimeout(typingTimer);
  typingCharIndex = 0;
  typingDeleting = false;
  renderTyping();
  typingTimer = setTimeout(typeStep, 650);
}
function pauseTyping() {
  clearTimeout(typingTimer);
  if (!typingText) return;
  typingCharIndex = typingWords[typingWordIndex].length;
  typingDeleting = true;
  renderTyping();
}

function syncMotion() {
  const paused = motionPaused || motionPreference.matches;
  document.documentElement.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Ativar animações' : 'Pausar animações';
  motionButton.setAttribute('aria-label', motionButton.textContent);
  motionButton.disabled = motionPreference.matches;
  if (motionPreference.matches) motionButton.textContent = 'Movimento reduzido';
  if (paused) {
    pauseTyping();
    $$('[data-tilt]').forEach((element) => { element.style.transform = ''; });
    const panel = $('.technical-panel');
    panel.style.removeProperty('--mx');
    panel.style.removeProperty('--my');
  } else {
    startTyping();
  }
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; syncMotion(); });
motionPreference.addEventListener('change', syncMotion);
syncMotion();

const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
$$('[data-tilt]').forEach((element) => {
  element.addEventListener('pointermove', (event) => {
    if (motionPreference.matches || motionPaused || !finePointer.matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty('--px', `${(x + 0.5) * 100}%`);
    element.style.setProperty('--py', `${(y + 0.5) * 100}%`);
    element.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
  });
  element.addEventListener('pointerleave', () => { element.style.transform = ''; });
});

const hero = $('.hero');
const technicalPanel = $('.technical-panel');
hero.addEventListener('pointermove', (event) => {
  if (motionPreference.matches || motionPaused || !finePointer.matches) return;
  const rect = hero.getBoundingClientRect();
  technicalPanel.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
  technicalPanel.style.setProperty('--my', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
});
hero.addEventListener('pointerleave', () => {
  technicalPanel.style.removeProperty('--mx');
  technicalPanel.style.removeProperty('--my');
});

const progressBar = $('.scroll-progress');
let progressFrame = 0;
function renderProgress() {
  progressFrame = 0;
  const range = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${range > 0 ? Math.min(scrollY / range, 1) : 0})`;
}
addEventListener('scroll', () => { if (!progressFrame) progressFrame = requestAnimationFrame(renderProgress); }, { passive: true });
addEventListener('resize', renderProgress, { passive: true });
document.addEventListener('portfolio:layoutchange', renderProgress);
renderProgress();
if ('IntersectionObserver' in window) {
  const reveals = $$('.section-heading, .skills-grid article, .project-card, .about-layout, .resume-layout, .contact-layout, .robotics-feature');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  reveals.forEach((element, index) => { element.classList.add('reveal-on-scroll'); element.style.setProperty('--reveal-delay', `${index % 3 * 70}ms`); observer.observe(element); });
  document.documentElement.classList.add('motion-ready');
  new IntersectionObserver(([entry]) => $('.technical-panel').classList.toggle('motion-offscreen', !entry.isIntersecting)).observe($('.technical-panel'));
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('.desktop-nav a').forEach(link => {
      const active = link.hash === '#' + entry.target.id;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-15% 0px -55% 0px' });
  $$('main section[id]').forEach(section => navObserver.observe(section));
}
const updateHeader = () => $('.site-header').classList.toggle('is-scrolled', scrollY > 16);
addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
document.addEventListener('visibilitychange', () => document.body.classList.toggle('motion-offscreen', document.hidden));
