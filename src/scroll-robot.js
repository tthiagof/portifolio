(function () {
  var bot = document.querySelector('.scroll-bot');
  if (!bot) return;

  var stage = bot.querySelector('.bot-stage');
  var label = bot.querySelector('.bot-label');
  var zones = [
    { selector: '#inicio', key: 'hero' },
    { selector: '#habilidades', key: 'skills' },
    { selector: '#projetos', key: 'projects' },
    { selector: '.robotics-feature', key: 'robotics' },
    { selector: '#sobre', key: 'about' },
    { selector: '#curriculo', key: 'resume' },
    { selector: '#contato', key: 'contact' }
  ];
  var labels = {
    hero: 'EM ESPERA',
    skills: 'MAPEANDO SKILLS',
    projects: 'COMPILANDO PROJETOS',
    robotics: 'NAVEGAÇÃO ATIVA',
    about: 'ESCANEANDO PERFIL',
    resume: 'CARREGANDO CV',
    contact: 'ABRINDO CANAL'
  };
  var sides = {
    hero: 'right',
    skills: 'left',
    projects: 'right',
    robotics: 'left',
    about: 'right',
    resume: 'left',
    contact: 'right'
  };

  zones.forEach(function (item) { item.el = document.querySelector(item.selector); });

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var state = { zone: bot.dataset.zone || 'hero', frame: 0, burstTimer: 0 };

  function setZone(zone) {
    if (zone === state.zone) return;
    state.zone = zone;
    bot.dataset.zone = zone;
    label.textContent = labels[zone] || labels.hero;
    if (reducedMotion.matches || document.documentElement.classList.contains('motion-paused')) return;
    bot.classList.remove('is-entering');
    void bot.offsetWidth;
    bot.classList.add('is-entering');
    clearTimeout(state.burstTimer);
    state.burstTimer = setTimeout(function () { bot.classList.remove('is-entering'); }, 900);
  }

  function lanePosition() {
    var width = bot.offsetWidth || 120;
    var height = stage.offsetHeight || 120;
    var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var progress = maxScroll ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    var minY = Math.max(72, window.innerHeight * 0.18);
    var maxY = Math.max(minY, window.innerHeight - height - 34);
    var y = minY + (maxY - minY) * progress;
    var side = sides[state.zone] || 'right';
    var gap = Math.max(8, Math.min(22, window.innerWidth * 0.014));
    var drift = Math.abs(Math.sin(progress * Math.PI * 4)) * 6;
    var x = side === 'left' ? gap + drift : window.innerWidth - width - gap - drift;
    return { x: x, y: y, side: side };
  }

  function place(x, y) {
    bot.style.left = x + 'px';
    bot.style.top = y + 'px';
  }

  function update() {
    state.frame = 0;

    var marker = window.innerHeight * 0.38;
    var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    var zone = atBottom ? zones[zones.length - 1].key : 'hero';
    if (!atBottom) {
      for (var i = 0; i < zones.length; i++) {
        if (zones[i].el && zones[i].el.getBoundingClientRect().top <= marker) zone = zones[i].key;
      }
    }
    setZone(zone);

    if (bot.classList.contains('chat-open')) return;
    var lane = lanePosition();
    bot.dataset.side = lane.side;
    place(lane.x, lane.y);
  }

  function requestUpdate() {
    if (!state.frame) state.frame = requestAnimationFrame(update);
  }

  // Local conversation: curated facts, shuffled wording, no external service.
  var topics = [
    { questions: ['Quem é o Thiago?', 'Me apresenta o Thiago?', 'Qual é a história do Thiago?'], answers: ['Thiago é desenvolvedor e fundador da Crono Sistemas, em Santa Cruz do Sul, RS. Ele cria sistemas web, automações e também presta serviços de TI.', 'Pode chamar de alguém que gosta de transformar problemas em software! Thiago fundou a Crono Sistemas e trabalha com sistemas web, automações e TI em Santa Cruz do Sul, RS.'], href: '#sobre', action: 'Conhecer o Thiago' },
    { questions: ['Quais projetos posso conhecer?', 'O que ele já desenvolveu?', 'Me mostra os projetos?'], answers: ['Na galeria você encontra Crono OS, o site da Gruhn Elétrica e a plataforma Cursos Gruhn. Também tem o Crono Propostas, identificado como pré-lançamento. Cada projeto tem detalhes para explorar!', 'Vamos ao que já saiu do código? Tem sistema de ordens de serviço, site institucional e plataforma de cursos. O Crono Propostas aparece como pré-lançamento. Separei a galeria para você.'], href: '#projetos', action: 'Explorar projetos' },
    { questions: ['Ele também trabalha com robótica?', 'De onde vem esse robô?', 'Qual é a experiência em robótica?'], answers: ['Tenho uma boa razão para estar aqui! Em 2025, Thiago participou da seletiva WorldSkills de Robótica Móvel Autônoma pelo SENAI. Trabalhou com controle, navegação, mecânica e sistemas embarcados em C++ com Studica Robotics.', 'Robótica faz parte da trajetória dele: seletiva WorldSkills de Robótica Móvel Autônoma em 2025, pelo SENAI, com atuação em navegação e controle, estrutura mecânica e programação embarcada em C++ com Studica Robotics.'], href: '.robotics-feature', action: 'Ver robótica' },
    { questions: ['Como falar com ele?', 'Quero conversar sobre um projeto!', 'Como entro em contato?'], answers: ['Vamos conectar vocês! Na seção de contato estão o WhatsApp e o e-mail do Thiago. Conte sua ideia, o que precisa resolver e o que já tem em mente.', 'Próximo passo: conversar com o Thiago. Você pode escolher WhatsApp ou e-mail na seção de contato e explicar sua ideia de projeto.'], href: '#contato', action: 'Abrir contatos' },
    { questions: ['Posso baixar o currículo?', 'Onde encontro a formação dele?', 'Quero conhecer a experiência dele.'], answers: ['Claro! O currículo em PDF reúne formação, experiências, cursos e projetos. Thiago cursa Técnico em Desenvolvimento de Sistemas no SENAI, com conclusão prevista para junho de 2027.', 'Deixei um atalho para o currículo! O PDF tem experiências, projetos e formação, incluindo o Técnico em Desenvolvimento de Sistemas no SENAI, com conclusão prevista em junho de 2027.'], href: '#curriculo', action: 'Ver currículo' },
    { questions: ['Que tipo de solução ele cria?', 'Como ele pode ajudar minha empresa?', 'Ele faz sistemas e automações?'], answers: ['O foco é desenvolver sistemas web e automações, da estrutura de dados à implantação, com GitHub e CI/CD. Ele também presta serviços de TI. Para entender a solução ideal, vale contar seu cenário diretamente a ele.', 'Ele trabalha com sistemas web, automações e serviços de TI, cuidando desde os dados até a implantação, com versionamento e CI/CD. Uma conversa sobre sua necessidade é o melhor começo.'], href: '#habilidades', action: 'Ver habilidades' }
  ];
  var face = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path class="chat-antenna" d="M20 10V6"/><circle cx="20" cy="5" r="2" class="chat-antenna-tip"/><rect x="7" y="11" width="26" height="22" rx="9"/><path d="M4 19v7m32-7v7"/><g class="chat-eyes"><path d="M14 19v3m12-3v3"/></g><path class="chat-smile" d="M16 27q4 3 8 0"/></svg>';
  var panel = document.createElement('section');
  panel.id = 'robot-chat';
  panel.className = 'robot-chat';
  panel.hidden = true;
  panel.dataset.state = 'idle';
  panel.setAttribute('aria-label', 'Conversa com AMR-01');
  panel.innerHTML = '<header class="chat-header"><span class="chat-avatar">' + face + '<i class="chat-online" aria-hidden="true"></i></span><div class="chat-identity"><span class="chat-eyebrow">SEU COPILOTO DIGITAL</span><strong>AMR-01<span class="chat-version">/ 01</span></strong><small><i aria-hidden="true"></i><span class="chat-presence">Pronto para explorar</span></small></div><button type="button" class="chat-close" aria-label="Fechar conversa"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8M6 14l8-8"/></svg></button></header><div class="chat-signal" aria-hidden="true"><span></span></div><div class="chat-messages" role="log" aria-label="Mensagens" aria-live="polite" aria-relevant="additions"></div><div class="chat-compose"><div class="chat-prompt"><span class="chat-status" role="status">Por onde vamos começar?</span><span class="chat-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div><div class="chat-suggestions" aria-label="Perguntas sugeridas"></div></div><footer><span aria-hidden="true">✧</span> Guia do portfólio · respostas preparadas</footer>';
  document.body.appendChild(panel);
  var messages = panel.querySelector('.chat-messages');
  var suggestions = panel.querySelector('.chat-suggestions');
  var status = panel.querySelector('.chat-status');
  var presence = panel.querySelector('.chat-presence');
  var busy = false;
  var started = false;
  var closingTimer = 0;
  var revealTimer = 0;
  var activeRevealComplete = null;
  var dockAnimation = null;
  var followMessages = true;
  var previous = new Map();
  var topicNames = ['o Thiago', 'os projetos', 'a robótica', 'os contatos', 'o currículo', 'as soluções'];
  var topicSymbols = ['◎', '⌘', '◇', '↗', '↓', '⚡'];

  function motionEnabled() {
    return !reducedMotion.matches && !document.documentElement.classList.contains('motion-paused');
  }

  function variant(items, key) {
    var last = previous.get(key);
    var choices = items.filter(function (_, i) { return i !== last; });
    var result = choices[Math.floor(Math.random() * choices.length)] || items[0];
    previous.set(key, items.indexOf(result));
    return result;
  }

  function scrollMessages(smooth) {
    if (!followMessages || panel.hidden) return;
    messages.scrollTo({ top: messages.scrollHeight, behavior: smooth && motionEnabled() ? 'smooth' : 'instant' });
  }
  // Let visitors read earlier messages without fighting the automatic scroll.
  messages.addEventListener('wheel', function () { followMessages = false; }, { passive: true });
  messages.addEventListener('touchstart', function () { followMessages = false; }, { passive: true });
  messages.addEventListener('scroll', function () {
    if (messages.scrollHeight - messages.scrollTop - messages.clientHeight < 20) followMessages = true;
  }, { passive: true });

  function setConversationState(value) {
    panel.dataset.state = value;
    bot.classList.toggle('is-thinking', value === 'thinking');
    bot.classList.toggle('is-speaking', value === 'speaking');
    presence.textContent = { idle: 'Pronto para explorar', thinking: 'Conectando os pontos', speaking: 'Transmitindo resposta' }[value];
  }

  function appendBubble(bubble) {
    messages.appendChild(bubble);
    while (messages.children.length > 24) messages.firstChild.remove();
    scrollMessages(true);
  }

  function createBubble(text, user) {
    var bubble = document.createElement('div');
    bubble.className = 'chat-message ' + (user ? 'from-user' : 'from-bot');
    var author = document.createElement('span');
    author.className = 'chat-author';
    author.textContent = user ? 'VOCÊ' : 'AMR-01';
    var paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.append(author, paragraph);
    return bubble;
  }

  function addAction(bubble, topic) {
    var link = document.createElement('a');
    var destination = document.querySelector(topic.href);
    if (!destination) return;
    if (!destination.id) destination.id = 'robotics-chat-destination';
    link.href = '#' + destination.id;
    link.textContent = topic.action + ' ↗';
    link.addEventListener('click', function (event) {
      event.preventDefault();
      closeChat();
      destination.scrollIntoView({ behavior: motionEnabled() ? 'smooth' : 'instant' });
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    });
    bubble.appendChild(link);
  }

  function createThinkingBubble(topic) {
    var bubble = document.createElement('div');
    bubble.className = 'chat-message from-bot chat-thinking';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.innerHTML = '<div class="chat-processing"><span class="chat-thinking-avatar">' + face + '<i></i><i></i></span><div><span class="chat-author">AMR-01</span><span class="chat-thinking-caption"></span><span class="chat-typing-dots"><i></i><i></i><i></i></span></div></div><div class="chat-thinking-track"><span></span></div>';
    bubble.querySelector('.chat-thinking-caption').textContent = 'Explorando ' + topicNames[topics.indexOf(topic)];
    appendBubble(bubble);
    return bubble;
  }

  function revealAnswer(bubble, text, topic) {
    var initialHeight = bubble.getBoundingClientRect().height;
    var answer = createBubble(text, false);
    addAction(answer, topic);
    // Keep the complete message for assistive technology; animate a visual copy.
    var paragraph = answer.querySelector('p');
    var accessibleText = document.createElement('span');
    accessibleText.className = 'chat-sr-only';
    accessibleText.textContent = text;
    var visualText = document.createElement('span');
    visualText.setAttribute('aria-hidden', 'true');
    var words = text.match(/\S+\s*/g) || [text];
    var stagger = Math.min(28, 1350 / words.length);
    words.forEach(function (word, index) {
      var span = document.createElement('span');
      span.className = 'chat-word';
      span.style.setProperty('--word-delay', index * stagger + 'ms');
      span.textContent = word;
      visualText.appendChild(span);
    });
    paragraph.replaceChildren(accessibleText, visualText);
    answer.classList.add('is-revealing');
    bubble.replaceWith(answer);
    setConversationState('speaking');
    status.textContent = 'AMR-01 está digitando…';
    var growth;
    if (motionEnabled() && !panel.hidden) {
      growth = answer.animate([{ height: initialHeight + 'px' }, { height: answer.getBoundingClientRect().height + 'px' }], {
        duration: 480, easing: 'cubic-bezier(.22,1,.36,1)'
      });
    }
    scrollMessages(true);
    function complete() {
      clearTimeout(revealTimer);
      if (growth) growth.cancel();
      answer.classList.remove('is-revealing');
      paragraph.textContent = text;
      answer.removeAttribute('aria-hidden');
      messages.setAttribute('aria-busy', 'false');
      setConversationState('idle');
      status.textContent = variant(['O que mais você quer descobrir?', 'Podemos explorar outro assunto.', 'Próxima parada? Você escolhe.'], 'prompt');
      busy = false;
      activeRevealComplete = null;
      renderQuestions();
      scrollMessages(true);
      if (!panel.hidden && !panel.inert && document.activeElement === document.body) {
        suggestions.querySelector('button').focus({ preventScroll: true });
      }
    }
    activeRevealComplete = complete;
    // The visual copy never generates partial live-region announcements.
    answer.setAttribute('aria-hidden', 'true');
    revealTimer = setTimeout(complete, motionEnabled() && !panel.hidden ? words.length * stagger + 320 : 0);
  }

  function ask(topic, question) {
    if (busy) return;
    busy = true;
    followMessages = true;
    appendBubble(createBubble(question, true));
    messages.setAttribute('aria-busy', 'true');
    suggestions.querySelectorAll('button').forEach(function (item) { item.disabled = true; });
    setConversationState('thinking');
    status.textContent = 'Explorando ' + topicNames[topics.indexOf(topic)] + '…';
    var thinking = createThinkingBubble(topic);
    var caption = thinking.querySelector('.chat-thinking-caption');
    setTimeout(function () { caption.textContent = 'Organizando a resposta'; }, 850);
    setTimeout(function () {
      revealAnswer(thinking, variant(topic.answers, topic.answers), topic);
    }, 1500 + Math.random() * 500);
  }

  function renderQuestions() {
    suggestions.replaceChildren();
    topics.map(function (topic) { return { topic: topic, order: Math.random() }; }).sort(function (a, b) { return a.order - b.order; }).forEach(function (entry, index) {
      var topic = entry.topic;
      var question = variant(topic.questions, topic);
      var button = document.createElement('button');
      button.type = 'button';
      button.style.setProperty('--question-delay', index * 35 + 'ms');
      var symbol = document.createElement('span');
      symbol.className = 'chat-question-icon';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = topicSymbols[topics.indexOf(topic)];
      var text = document.createElement('span');
      text.textContent = question;
      button.append(symbol, text);
      button.addEventListener('click', function () { ask(topic, question); });
      suggestions.appendChild(button);
    });
  }

  function dockBot(open) {
    var before = bot.getBoundingClientRect();
    if (dockAnimation) dockAnimation.cancel();
    bot.style.transition = 'none';
    bot.classList.toggle('chat-open', open);
    if (!open) update();
    var after = bot.getBoundingClientRect();
    if (motionEnabled()) {
      dockAnimation = bot.animate([
        { transform: 'translate(' + (before.left - after.left) + 'px,' + (before.top - after.top) + 'px) scale(' + before.width / after.width + ')' },
        { transform: 'translate(0,0) scale(1)' }
      ], { duration: 720, easing: 'cubic-bezier(.22,1,.36,1)' });
      dockAnimation.onfinish = function () { bot.style.removeProperty('transition'); dockAnimation = null; };
    } else {
      bot.style.removeProperty('transition');
    }
  }

  function closeChat() {
    if (panel.hidden || panel.inert) return;
    panel.classList.add('is-closing');
    panel.inert = true;
    bot.setAttribute('aria-expanded', 'false');
    bot.focus({ preventScroll: true });
    dockBot(false);
    closingTimer = setTimeout(function () {
      panel.hidden = true;
      panel.classList.remove('is-closing');
    }, motionEnabled() ? 260 : 0);
  }

  function toggleChat() {
    if (!panel.hidden && !panel.inert) { closeChat(); return; }
    clearTimeout(closingTimer);
    panel.classList.remove('is-closing');
    panel.hidden = false;
    panel.inert = false;
    dockBot(true);
    bot.setAttribute('aria-expanded', 'true');
    if (!started) {
      appendBubble(createBubble('Oi! Eu sou o AMR-01, seu copiloto por aqui. 🤖 Escolha uma pergunta e vamos explorar os projetos, a trajetória e as ideias do Thiago juntos.', false));
      renderQuestions();
      started = true;
    }
    scrollMessages(false);
    panel.querySelector('.chat-close').focus({ preventScroll: true });
  }

  function syncMotion() {
    if (!motionEnabled()) {
      if (activeRevealComplete) activeRevealComplete();
      if (dockAnimation) { dockAnimation.cancel(); dockAnimation = null; bot.style.removeProperty('transition'); }
    }
  }
  new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  reducedMotion.addEventListener('change', syncMotion);
  bot.removeAttribute('aria-hidden');
  bot.setAttribute('role', 'button');
  bot.setAttribute('tabindex', '0');
  bot.setAttribute('aria-label', 'Conversar com AMR-01, guia do portfólio');
  bot.setAttribute('aria-controls', panel.id);
  bot.setAttribute('aria-expanded', 'false');
  bot.addEventListener('click', toggleChat);
  bot.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleChat(); }
  });
  panel.querySelector('.chat-close').addEventListener('click', closeChat);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !panel.hidden) closeChat(); });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  document.addEventListener('portfolio:layoutchange', requestUpdate);
  reducedMotion.addEventListener('change', requestUpdate);
  window.addEventListener('load', requestUpdate);
  requestUpdate();
})();
