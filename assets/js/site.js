(() => {
  'use strict';

  const themeButton = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const applyTheme = (night) => {
    root.dataset.theme = night ? 'night' : 'day';
    themeButton.setAttribute('aria-pressed', String(night));
    themeButton.setAttribute('aria-label', night ? 'Switch to light colors' : 'Switch to dark colors');
    document.querySelector('meta[name="theme-color"]').content = night ? '#1b1e1a' : '#eae9e0';
  };

  if (themeButton) {
    try { applyTheme(localStorage.getItem('noah-theme') === 'night'); } catch { applyTheme(false); }
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const night = root.dataset.theme !== 'night';
      applyTheme(night);
      try { localStorage.setItem('noah-theme', night ? 'night' : 'day'); } catch { /* Theme still works without storage. */ }
    });
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((target) => revealObserver.observe(target));
    root.classList.add('motion-ready');
  }

  const progress = document.querySelector('.reading-progress');
  let scrollFrame = 0;
  function updateProgress() {
    const distance = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
    scrollFrame = 0;
  }
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
  }, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  // A small, deterministic tile world, drawn at its native pixel resolution.
  const canvas = document.getElementById('signal-canvas');
  const context = canvas?.getContext('2d');
  const motionToggle = document.querySelector('.motion-toggle');
  const signalStatus = document.getElementById('signal-status');
  let paused = reducedMotion.matches;
  let visible = true;
  let animationFrame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let pointerOffset = 0;
  let smoothedOffset = 0;
  let width = 0;
  let height = 0;

  function drawWorld() {
    if (!context || !width || !height) return;
    const block = (x, y, w, h, color) => {
      context.fillStyle = color;
      context.fillRect(Math.round(x), Math.round(y), w, h);
    };
    const shape = (points, color, offset = 0) => {
      context.fillStyle = color;
      context.beginPath();
      points.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x + offset, y);
        else context.lineTo(x + offset, y);
      });
      context.closePath();
      context.fill();
    };
    const parallax = Math.round(smoothedOffset * 3);
    block(0, 0, width, height, '#19323d');
    block(0, 71, width, 44, '#243e49');

    // Stars keep fixed positions; only a few change brightness at a time.
    for (let star = 0; star < 29; star++) {
      const x = (star * 47 + 17) % 188 + 2;
      const y = (star * 29 + 9) % 66 + 12;
      const bright = Math.sin(elapsed * 0.0007 + star * 2.3) > 0.65;
      block(x, y, 1, 1, bright ? '#c6d8c3' : '#557582');
    }
    block(143, 22, 9, 13, '#c6d8c3');
    block(141, 24, 13, 9, '#c6d8c3');
    block(147, 20, 9, 11, '#19323d');

    const cloud = (startX, y, length) => {
      const x = Math.round(((startX + elapsed * 0.0011) % 240) - 24);
      block(x + 6, y, length - 10, 2, '#34515b');
      block(x, y + 2, length, 3, '#34515b');
    };
    cloud(23, 39, 26);
    cloud(112, 51, 36);
    shape([[0,89],[8,89],[8,82],[16,82],[16,74],[24,74],[24,68],[32,68],[32,60],[40,60],[40,54],[48,54],[48,60],[56,60],[56,68],[64,68],[64,76],[72,76],[72,84],[80,84],[80,101],[0,101]], '#415364', parallax);
    shape([[88,101],[88,92],[96,92],[96,84],[104,84],[104,76],[112,76],[112,67],[120,67],[120,58],[128,58],[128,49],[136,49],[136,58],[144,58],[144,67],[152,67],[152,76],[160,76],[160,85],[168,85],[168,95],[192,95],[192,112]], '#415364', parallax);
    shape([[24,68],[32,68],[32,60],[40,60],[40,54],[48,54],[48,60],[56,60],[56,68],[40,68],[40,75],[32,75],[32,68]], '#83918e', parallax);
    shape([[112,67],[120,67],[120,58],[128,58],[128,49],[136,49],[136,58],[144,58],[144,67],[136,67],[136,74],[128,74],[128,67]], '#83918e', parallax);
    shape([[0,100],[8,100],[8,93],[16,93],[16,86],[24,86],[24,79],[32,79],[32,88],[40,88],[40,97],[48,97],[48,104],[60,104],[60,111],[68,111],[68,102],[76,102],[76,93],[84,93],[84,84],[92,84],[92,75],[100,75],[100,84],[108,84],[108,93],[116,93],[116,102],[124,102],[124,111],[140,111],[140,102],[148,102],[148,93],[156,93],[156,84],[164,84],[164,93],[172,93],[172,102],[180,102],[180,110],[192,110],[192,119],[0,119]], '#2d4853', parallax * 2);

    // The lake is drawn before the banks so reflections stay in the water.
    block(0, 114, 192, 62, '#406c71');
    for (let ripple = 0; ripple < 22; ripple++) {
      const x = (ripple * 43 + Math.floor(elapsed / 700) % 5) % 186;
      const y = 116 + (ripple * 17) % 58;
      block(x, y, 3 + (ripple * 7) % 18, 1, ripple % 3 === 0 ? '#7c9b92' : '#527e7e');
    }
    shape([[0,117],[48,117],[48,122],[72,122],[72,128],[88,128],[88,135],[100,135],[100,143],[84,143],[84,151],[64,151],[64,160],[0,160]], '#1c3b38');
    shape([[192,124],[160,124],[160,129],[144,129],[144,138],[128,138],[128,146],[112,146],[112,176],[192,176]], '#1c3b38');
    shape([[0,116],[48,116],[48,119],[72,119],[72,123],[88,123],[88,127],[100,127],[100,131],[83,131],[83,127],[69,127],[69,123],[45,123],[45,119],[0,119]], '#668169');
    shape([[192,123],[160,123],[160,127],[144,127],[144,135],[128,135],[128,139],[112,139],[112,143],[127,143],[127,139],[144,139],[144,131],[162,131],[162,127],[192,127]], '#668169');
    shape([[0,151],[65,151],[65,156],[49,156],[49,163],[40,163],[40,176],[0,176]], '#142d2b');
    shape([[192,142],[152,142],[152,149],[134,149],[134,158],[121,158],[121,176],[192,176]], '#142d2b');
    for (let tile = 0; tile < 18; tile++) {
      const x = (tile * 31) % 185;
      const y = 149 + (tile * 7) % 26;
      if (x < 40 || x > 151) block(x, y, 3, 1, '#23453b');
    }
    block(125, 143, 4, 27, '#638f8e');
    block(129, 143, 2, 30, '#8aada0');
    for (let fall = 0; fall < 4; fall++) block(125, 145 + (fall * 7 + Math.floor(elapsed / 180)) % 25, 2, 3, '#a7c0a9');

    const pine = (x, y, size) => {
      block(x + 6, y + 16, 3, 15, '#344b38');
      shape([[x+6,y],[x+10,y],[x+10,y+6],[x+13,y+6],[x+13,y+12],[x+16,y+12],[x+16,y+18],[x,y+18],[x,y+12],[x+3,y+12],[x+3,y+6],[x+6,y+6]], size ? '#51715c' : '#3d6551');
      block(x, y + 17, 16, 2, '#2c4c3e');
    };
    pine(-2, 86, true);
    pine(158, 94, false);
    pine(178, 102, true);

    // A lit cabin and a small traveler, rather than a character mascot.
    block(22, 109, 23, 19, '#b8a277');
    shape([[18,108],[24,108],[24,103],[30,103],[30,98],[39,98],[39,103],[45,103],[45,108],[50,108],[50,113],[18,113]], '#6c5746');
    block(41, 98, 3, 8, '#6c5746');
    block(26, 116, 6, 6, '#edc076');
    block(26, 118, 6, 1, '#9b7b50');
    block(28, 116, 1, 6, '#9b7b50');
    block(36, 117, 5, 11, '#6c5746');
    block(22, 127, 26, 2, '#866f50');
    const smoke = Math.floor(elapsed / 1300) % 3;
    block(41 + smoke, 93 - smoke, 2, 3, '#67817d');
    block(43 - smoke, 87 - smoke, 2, 2, '#4c696e');
    block(59, 115, 3, 3, '#d6b58b');
    block(59, 114, 3, 1, '#253638');
    block(58, 118, 5, 5, '#b65d44');
    block(58, 123, 2, 4, '#162e30');
    block(61, 123, 2, 4, '#162e30');

    for (let mote = 0; mote < 5; mote++) {
      const x = 65 + mote * 19 + Math.round(Math.sin(elapsed * 0.0005 + mote) * 3);
      const y = 106 + mote % 3 * 12 + Math.round(Math.cos(elapsed * 0.0008 + mote) * 2);
      if (Math.sin(elapsed * 0.001 + mote * 2) > -0.2) block(x, y, 1, 1, '#c5ad66');
    }
  }

  function animate(time) {
    animationFrame = 0;
    if (paused || !visible || document.hidden) { lastTime = 0; return; }
    if (!lastTime || time - lastTime >= 30) {
      elapsed += lastTime ? Math.min(time - lastTime, 70) : 0;
      lastTime = time;
      smoothedOffset += (pointerOffset - smoothedOffset) * 0.065;
      drawWorld();
    }
    animationFrame = requestAnimationFrame(animate);
  }

  function scheduleWorld() {
    if (!context) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastTime = 0;
    if (!paused && visible && !document.hidden) animationFrame = requestAnimationFrame(animate);
    else drawWorld();
  }

  function setPaused(value) {
    paused = value;
    root.dataset.motion = paused ? 'paused' : 'playing';
    motionToggle?.setAttribute('aria-pressed', String(paused));
    if (motionToggle) {
      motionToggle.querySelector('.motion-label').textContent = paused ? 'Resume motion' : 'Pause motion';
      motionToggle.querySelector('.motion-symbol').textContent = paused ? '▷' : 'Ⅱ';
    }
    if (signalStatus) signalStatus.textContent = paused ? 'PAUSED' : 'LIVE';
    scheduleWorld();
  }

  if (context) {
    function resizeWorld() {
      width = 192;
      height = 176;
      canvas.width = width;
      canvas.height = height;
      context.imageSmoothingEnabled = false;
      drawWorld();
    }
    resizeWorld();
    canvas.parentElement.classList.add('is-ready');
    if ('ResizeObserver' in window) new ResizeObserver(resizeWorld).observe(canvas.parentElement);
    else addEventListener('resize', resizeWorld);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        scheduleWorld();
      }).observe(canvas);
    }
    canvas.addEventListener('pointermove', (event) => {
      if (paused || event.pointerType === 'touch') return;
      const bounds = canvas.getBoundingClientRect();
      pointerOffset = ((event.clientX - bounds.left) / bounds.width - 0.5) * 1.6;
    });
    canvas.addEventListener('pointerleave', () => { pointerOffset = 0; });
    document.querySelector('.signal-hint').hidden = false;
    motionToggle.hidden = false;
    motionToggle.addEventListener('click', () => setPaused(!paused));
    document.addEventListener('visibilitychange', scheduleWorld);
  }
  setPaused(paused);
  reducedMotion.addEventListener('change', (event) => setPaused(event.matches));

  const piano = document.querySelector('.piano');
  if (!piano) return;
  const keys = [...piano.querySelectorAll('[data-note]')];
  const hint = document.getElementById('piano-hint');
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audio;
  const timers = new WeakMap();
  const soundToggle = document.querySelector('.sound-toggle');
  const noteDisplay = document.getElementById('note-display');
  let chipSound = true;

  if (!AudioContext) {
    keys.forEach((key) => { key.disabled = true; });
    hint.textContent = 'This browser does not support audio playback. Try a newer browser to play.';
    return;
  }

  if (soundToggle) {
    soundToggle.hidden = false;
    soundToggle.addEventListener('click', () => {
      chipSound = !chipSound;
      soundToggle.setAttribute('aria-pressed', String(chipSound));
      soundToggle.querySelector('.sound-label').textContent = chipSound ? '8-BIT SOUND' : 'SOFT SOUND';
    });
  }

  async function play(key) {
    try {
      audio ||= new AudioContext();
      if (audio.state === 'suspended') await audio.resume();
      const now = audio.currentTime;
      const volume = audio.createGain();
      const tone = audio.createOscillator();
      tone.type = chipSound ? 'square' : 'triangle';
      tone.frequency.value = Number(key.dataset.note);
      volume.gain.setValueAtTime(0, now);
      volume.gain.linearRampToValueAtTime(chipSound ? 0.035 : 0.14, now + 0.012);
      volume.gain.exponentialRampToValueAtTime(0.001, now + (chipSound ? 0.5 : 0.85));
      tone.connect(volume);
      volume.connect(audio.destination);
      tone.start(now);
      tone.stop(now + 0.9);
      tone.onended = () => { tone.disconnect(); volume.disconnect(); };
      clearTimeout(timers.get(key));
      key.classList.add('is-playing');
      if (noteDisplay) noteDisplay.textContent = key.getAttribute('aria-label').replace('Play ', '').replace(' sharp', '♯').replace('high C', 'C5');
      timers.set(key, setTimeout(() => key.classList.remove('is-playing'), 220));
    } catch {
      hint.textContent = 'Sound could not start. Check your browser’s audio permissions and try again.';
    }
  }

  keys.forEach((key) => key.addEventListener('click', () => { void play(key); }));
  document.addEventListener('keydown', (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return;
    // Letter shortcuts are active only while the piano is visible.
    const bounds = piano.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    const key = keys.find((item) => item.dataset.key === event.key.toLowerCase());
    if (key) { event.preventDefault(); void play(key); }
  });
})();
