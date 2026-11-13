(function () {
  var panel = document.getElementById('amr-panel');
  if (!panel) return;
  var $ = function (id) { return document.getElementById(id); };

  // --- arena (px do SVG) e escala: 1 px = 5 mm ---
  var AX0 = 16, AX1 = 464, AY0 = 30, AY1 = 250, MM = 5;
  var CX = 240, CY = 140, A = 150, B = 55, W = 0.5;
  var L = 27;
  var WHEEL_R_MM = 50;
  var WHEEL_ANG = [60, 180, 300].map(function (d) { return d * Math.PI / 180; });
  var OBST = [[165, 140, 9], [315, 140, 9], [62, 70, 7]];
  var RAYS = 72, MAXR = 130;

  var el = {
    robot: $('amr-robot'), trail: $('amr-trail'), rays: $('amr-rays'), hits: $('amr-hits'),
    sweep: $('amr-sweep-line'), velLine: $('amr-vel-line'), velHead: $('amr-vel-head'),
    route: $('amr-route'), routeGlow: $('amr-route-glow'),
    x: $('tl-x'), y: $('tl-y'), z: $('tl-z'), vx: $('tl-vx'), vy: $('tl-vy'), w: $('tl-w'),
    w1: $('tl-w1'), w2: $('tl-w2'), w3: $('tl-w3'), clock: $('tl-clock'),
    bars: [$('bar-1'), $('bar-2'), $('bar-3')],
    rollers: [$('amr-roller-1'), $('amr-roller-2'), $('amr-roller-3')]
  };

  function pose(tau) {
    var u = W * tau;
    var th = 1.1 * Math.sin(0.9 * tau);
    return {
      x: CX + A * Math.cos(u),
      y: CY - B * Math.sin(2 * u),
      th: th,
      vx: -A * W * Math.sin(u),
      vy: 2 * B * W * Math.cos(2 * u),
      w: 0.99 * Math.cos(0.9 * tau)
    };
  }

  var d = '';
  for (var i = 0; i <= 160; i++) {
    var p = pose(i / 160 * (2 * Math.PI / W));
    d += (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
  }
  el.route.setAttribute('d', d);
  el.routeGlow.setAttribute('d', d);

  function cast(px, py, ang) {
    var dx = Math.cos(ang), dy = Math.sin(ang), t = MAXR, s;
    if (dx > 0) t = Math.min(t, (AX1 - px) / dx); else if (dx < 0) t = Math.min(t, (AX0 - px) / dx);
    if (dy > 0) t = Math.min(t, (AY1 - py) / dy); else if (dy < 0) t = Math.min(t, (AY0 - py) / dy);
    for (var k = 0; k < OBST.length; k++) {
      var fx = px - OBST[k][0], fy = py - OBST[k][1], r = OBST[k][2];
      var b = fx * dx + fy * dy, c = fx * fx + fy * fy - r * r, disc = b * b - c;
      if (disc >= 0) { s = -b - Math.sqrt(disc); if (s > 0.5 && s < t) t = s; }
    }
    return t;
  }

  function pad(n, w, dec) {
    var s = Math.abs(n).toFixed(dec);
    var sign = n < 0 ? '−' : '+';
    s = sign + s;
    while (s.length < w) s = '\u00a0' + s;
    return s;
  }

  var phase = [0, 0, 0], trail = [], tau = 1.2, lastT = 0, lastTxt = 0, running = false, raf = 0;

  function render(dt, now) {
    var p = pose(tau), c = Math.cos(p.th), s = Math.sin(p.th);

    var vxr = p.vx * c + p.vy * s;
    var vyr = -p.vx * s + p.vy * c;
    var v = WHEEL_ANG.map(function (a) { return -Math.sin(a) * vxr + Math.cos(a) * vyr + L * p.w; });
    var rpm = v.map(function (vi) { return vi * MM / (2 * Math.PI * WHEEL_R_MM) * 60; });

    el.robot.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ') rotate(' + (-p.th * 180 / Math.PI).toFixed(2) + ')');

    for (var i = 0; i < 3; i++) {
      phase[i] += v[i] * dt;
      el.rollers[i].setAttribute('stroke-dashoffset', (phase[i] % 4.8).toFixed(2));
    }

    trail.push(p.x.toFixed(1) + ' ' + p.y.toFixed(1));
    if (trail.length > 150) trail.shift();
    el.trail.setAttribute('d', 'M' + trail.join('L'));

    var vsx = p.vx, vsy = -p.vy, vm = Math.hypot(vsx, vsy) || 1;
    var ex = p.x + vsx * 0.45, ey = p.y + vsy * 0.45, ux = vsx / vm, uy = vsy / vm;
    el.velLine.setAttribute('x1', p.x); el.velLine.setAttribute('y1', p.y);
    el.velLine.setAttribute('x2', ex.toFixed(1)); el.velLine.setAttribute('y2', ey.toFixed(1));
    el.velHead.setAttribute('d', 'M' + ex.toFixed(1) + ' ' + ey.toFixed(1) +
      'L' + (ex - ux * 6 - uy * 3).toFixed(1) + ' ' + (ey - uy * 6 + ux * 3).toFixed(1) +
      'L' + (ex - ux * 6 + uy * 3).toFixed(1) + ' ' + (ey - uy * 6 - ux * 3).toFixed(1) + 'Z');

    var base = tau * 5, rd = '', hd = '';
    for (var k = 0; k < RAYS; k++) {
      var ang = base + k * (2 * Math.PI / RAYS);
      var t = cast(p.x, p.y, ang);
      var hx = (p.x + Math.cos(ang) * t).toFixed(1), hy = (p.y + Math.sin(ang) * t).toFixed(1);
      rd += 'M' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + 'L' + hx + ' ' + hy;
      if (t < MAXR - 0.01) hd += 'M' + hx + ' ' + hy + 'h0';
    }
    el.rays.setAttribute('d', rd);
    el.hits.setAttribute('d', hd);
    var sa = base, st = cast(p.x, p.y, sa);
    el.sweep.setAttribute('x1', p.x); el.sweep.setAttribute('y1', p.y);
    el.sweep.setAttribute('x2', (p.x + Math.cos(sa) * st).toFixed(1));
    el.sweep.setAttribute('y2', (p.y + Math.sin(sa) * st).toFixed(1));

    for (var j = 0; j < 3; j++) {
      var w = Math.max(-120, Math.min(120, rpm[j])) * 54 / 120;
      el.bars[j].setAttribute('x', w >= 0 ? 346 : 346 + w);
      el.bars[j].setAttribute('width', Math.abs(w).toFixed(1));
    }

    if (!now || now - lastTxt > 66) {
      lastTxt = now || 0;
      el.x.textContent = pad((p.x - AX0) * MM, 7, 1);
      el.y.textContent = pad((AY1 - p.y) * MM, 7, 1);
      el.z.textContent = pad(p.th * 180 / Math.PI, 6, 1);
      el.vx.textContent = pad(vxr * MM / 1000, 6, 3);
      el.vy.textContent = pad(vyr * MM / 1000, 6, 3);
      el.w.textContent = pad(p.w, 5, 2);
      el.w1.textContent = pad(rpm[0], 4, 0);
      el.w2.textContent = pad(rpm[1], 4, 0);
      el.w3.textContent = pad(rpm[2], 4, 0);
      var m = Math.floor(tau / 60), sec = tau - m * 60;
      el.clock.textContent = 't = ' + String(m).padStart(2, '0') + ':' + (sec < 10 ? '0' : '') + sec.toFixed(1) + ' s';
    }
  }

  function loop(now) {
    if (!running) return;
    var dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0;
    lastT = now;
    tau += dt;
    render(dt, now);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    lastT = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  var reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var visible = true;
  var pausedByClass = document.documentElement.classList.contains('motion-paused');

  function syncRunning() {
    if (reduceQuery.matches || pausedByClass || !visible || document.hidden) {
      stop();
      return;
    }
    start();
  }

  function updateMotion() {
    pausedByClass = document.documentElement.classList.contains('motion-paused');
    if (reduceQuery.matches) {
      stop();
      tau = 2.4;
      lastT = 0;
      lastTxt = 0;
      render(0, 0);
      return;
    }
    syncRunning();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      syncRunning();
    }, { threshold: 0.1 }).observe(panel);
  }

  reduceQuery.addEventListener('change', updateMotion);
  if (window.MutationObserver) {
    new MutationObserver(updateMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  document.addEventListener('visibilitychange', syncRunning);

  render(0, 0);
  updateMotion();
})();
