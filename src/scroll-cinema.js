const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function getSceneProgress(top, height, pinnedHeight) {
  const distance = height - pinnedHeight;
  return distance > 0 ? clamp(-top / distance) : 0;
}

// Keep at most one seek in flight. A scroll reversal replaces the pending target.
export function createVideoScrubber(video) {
  let progress = 0;
  let enabled = true;
  let failed = false;
  let pending = false;
  function seek() {
    if (!enabled || failed || pending || video.seeking || video.readyState < 1 || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const target = progress * Math.max(0, video.duration - 0.04);
    if (Math.abs(video.currentTime - target) < 1 / 40) return;
    try { pending = true; video.currentTime = target; } catch { pending = false; }
  }
  const onSeeked = () => { pending = false; seek(); };
  const onError = () => { failed = true; pending = false; };
  video.addEventListener('loadedmetadata', seek);
  video.addEventListener('loadeddata', seek);
  video.addEventListener('seeked', onSeeked);
  video.addEventListener('error', onError);
  return {
    setProgress(value) { progress = clamp(value); seek(); },
    setEnabled(value) { enabled = value; video.pause(); if (enabled) seek(); },
    destroy() {
      enabled = false;
      video.removeEventListener('loadedmetadata', seek);
      video.removeEventListener('loadeddata', seek);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    },
  };
}

export function initScrollCinema({ isReduced }) {
  const root = document.documentElement;
  const scenes = [...document.querySelectorAll('[data-cinema]')].map((section) => {
    const video = section.querySelector('video');
    video.muted = true;
    video.pause();
    const scene = { section, video, stage: section.querySelector('.cinema-stage'), scrubber: createVideoScrubber(video), requested: false, visible: false };
    video.addEventListener('loadeddata', () => section.classList.add('media-ready'));
    video.addEventListener('error', () => {
      section.classList.remove('media-ready');
      section.classList.add('media-unavailable');
      refresh();
    });
    return scene;
  });
  const art = [...document.querySelectorAll('.project-art')];
  let frame = 0;
  function load(scene) {
    if (scene.requested || isReduced()) return;
    scene.requested = true;
    scene.video.preload = 'auto';
    scene.video.src = scene.video.dataset.src;
    scene.video.load();
  }
  function render() {
    frame = 0;
    const reduced = isReduced();
    for (const scene of scenes) {
      const rect = scene.section.getBoundingClientRect();
      scene.visible = rect.bottom > 0 && rect.top < innerHeight;
      if (!reduced && rect.top < innerHeight * 1.5 && rect.bottom > -innerHeight * 0.5) load(scene);
      // Do not keep processing hidden scenes or seeking videos in a background tab.
      const enabled = !reduced && scene.visible && !document.hidden;
      scene.scrubber.setEnabled(enabled);
      if (reduced || scene.section.classList.contains('media-unavailable')) {
        scene.section.style.setProperty('--scene-progress', '0.5');
        scene.section.querySelectorAll('[data-scene-copy], [data-reel-label]').forEach((el) => {
          el.classList.toggle('is-current', (el.dataset.sceneCopy ?? el.dataset.reelLabel) === '0');
        });
        continue;
      }
      const progress = getSceneProgress(rect.top, rect.height, scene.stage.offsetHeight);
      scene.section.style.setProperty('--scene-progress', progress.toFixed(4));
      scene.scrubber.setProgress(progress);
      const chapter = Math.min(2, Math.floor(progress * 3));
      scene.section.querySelectorAll('[data-scene-copy]').forEach((el, index) => el.classList.toggle('is-current', index === chapter));
      // The reel transitions at 2–3, 4–5 and 6–7 seconds of a 9-second clip.
      const shot = progress < 2.5 / 9 ? 0 : progress < 4.5 / 9 ? 1 : progress < 6.5 / 9 ? 2 : 3;
      scene.section.querySelectorAll('[data-reel-label]').forEach((el, index) => el.classList.toggle('is-current', index === shot));
      scene.section.querySelector('.cinema-position').textContent = `${String(Math.round(progress * 100)).padStart(2, '0')} — 100`;
    }
    if (!reduced) for (const item of art) {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) continue;
      const progress = clamp((innerHeight - rect.top) / (innerHeight + rect.height));
      item.style.setProperty('--project-travel', progress.toFixed(4));
      item.style.setProperty('--project-drift', `${((progress - 0.5) * 20).toFixed(2)}px`);
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function refresh() {
    root.classList.toggle('cinema-enabled', !isReduced());
    scenes.forEach((scene) => scene.scrubber.setEnabled(!isReduced() && scene.visible && !document.hidden));
    schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', refresh);
  document.addEventListener('portfolio:motionchange', refresh);
  document.addEventListener('portfolio:layoutchange', schedule);
  // Metadata can change after jumping directly to an anchor in a scene.
  scenes.forEach((scene) => scene.video.addEventListener('loadedmetadata', schedule));
  refresh();
  return { refresh };
}
