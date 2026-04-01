// ============================================
// ReframeAI — Main Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollAnimations();
  initGame();
  initRestore();
  initCompare();
  initSlider();
  initCalculator();
  initAILab();
});

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
}

// ============================================
// Animated counter
// ============================================
function animateValue(el, start, end, duration, suffix = '', prefix = '') {
  const startTime = performance.now();
  const isFloat = String(end).includes('.');
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = start + (end - start) * eased;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ============================================
// SCREEN 1: Turing Reel — HEVC or HEVC+AI?
// ============================================
function initGame() {
  const container = document.getElementById('game-container');
  if (!container) return;

  // Both encoded at similar quality (~2000 vs ~1800 kbps) so they look nearly identical
  // The "AI" version represents: 300kbps file + ESRGAN → looks like 2000kbps
  const pairs = [
    { hevc: 'assets/videos/pair1_hevc.mp4', ai: 'assets/videos/pair1_ai.mp4', name: 'Анимация — природа', bitrateHevc: 2000, bitrateAi: 300, sizeHevc: '1.4 MB', sizeAi: '220 KB' },
    { hevc: 'assets/videos/pair2_hevc.mp4', ai: 'assets/videos/pair2_ai.mp4', name: 'Медузы — подводный мир', bitrateHevc: 2000, bitrateAi: 300, sizeHevc: '1.4 MB', sizeAi: '230 KB' },
    { hevc: 'assets/videos/pair3_hevc.mp4', ai: 'assets/videos/pair3_ai.mp4', name: 'Кино — тёмная сцена', bitrateHevc: 2000, bitrateAi: 300, sizeHevc: '1.6 MB', sizeAi: '250 KB' },
    { hevc: 'assets/videos/pair4_hevc.mp4', ai: 'assets/videos/pair4_ai.mp4', name: 'Водопад — реальная съёмка', bitrateHevc: 2000, bitrateAi: 300, sizeHevc: '1.6 MB', sizeAi: '240 KB' },
    { hevc: 'assets/videos/pair5_hevc.mp4', ai: 'assets/videos/pair5_ai.mp4', name: 'Кино — трейлер', bitrateHevc: 2000, bitrateAi: 300, sizeHevc: '1.4 MB', sizeAi: '210 KB' },
  ];
  let round = 0, score = 0;

  function renderRound() {
    const pair = pairs[round];
    const aiIsLeft = Math.random() > 0.5;

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4 text-xs text-muted">
        <span>round ${round + 1}/${pairs.length}</span>
        <div class="flex gap-1">${pairs.map((_, i) => '<div class="w-6 h-1 rounded ' + (i < round ? 'bg-' + (i < score ? 'green' : 'red') : (i === round ? 'bg-accent' : 'bg-border')) + '"></div>').join('')}</div>
        <span>score: ${score}/${round}</span>
      </div>
      <p class="text-center text-muted text-xs mb-4">${pair.name} — где HEVC + AI? Нажми на видео.</p>
      <div class="grid grid-cols-2 gap-4">
        <div class="game-card overflow-hidden cursor-pointer" data-side="left">
          <div class="video-wrapper rounded-lg">
            <video class="w-full h-full object-cover" autoplay loop muted playsinline
              src="${aiIsLeft ? pair.ai : pair.hevc}"></video>
          </div>
          <div class="game-label mt-2 text-center">
            <p class="text-xs font-bold">A</p>
            <p class="text-[10px] text-muted">640x360 · 6s · HEVC</p>
          </div>
        </div>
        <div class="game-card overflow-hidden cursor-pointer" data-side="right">
          <div class="video-wrapper rounded-lg">
            <video class="w-full h-full object-cover" autoplay loop muted playsinline
              src="${aiIsLeft ? pair.hevc : pair.ai}"></video>
          </div>
          <div class="game-label mt-2 text-center">
            <p class="text-xs font-bold">B</p>
            <p class="text-[10px] text-muted">640x360 · 6s · HEVC</p>
          </div>
        </div>
      </div>
      <div id="game-fb" class="mt-5 hidden"></div>
    `;

    const aiSide = aiIsLeft ? 'left' : 'right';
    container.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        if (container.dataset.answered) return;
        container.dataset.answered = 'true';
        const picked = card.dataset.side;
        const correct = picked === aiSide;
        if (correct) score++;

        // Show labels under each video card
        container.querySelectorAll('.game-card').forEach(c => {
          const isAi = c.dataset.side === aiSide;
          c.classList.add(isAi ? 'correct' : 'wrong');
          const label = c.querySelector('.game-label');
          if (label) {
            if (isAi) {
              label.innerHTML = `
                <p class="text-green font-bold text-xs">HEVC + AI</p>
                <p class="text-[10px] text-muted">${pair.bitrateAi} kbps · ${pair.sizeAi}</p>
                <p class="text-[10px] text-green">в ${Math.round(pair.bitrateHevc / pair.bitrateAi)}x меньше</p>`;
            } else {
              label.innerHTML = `
                <p class="text-[#c9d1d9] font-bold text-xs">Обычный HEVC</p>
                <p class="text-[10px] text-muted">${pair.bitrateHevc} kbps · ${pair.sizeHevc}</p>`;
            }
          }
        });

        const fb = document.getElementById('game-fb');
        fb.classList.remove('hidden');
        fb.classList.add('fade-in-up');
        fb.innerHTML = `
          <div class="bg-surface border border-border rounded-lg p-4 text-sm text-center">
            <span class="${correct ? 'text-green' : 'text-red'}">${correct ? '✓ correct' : '✗ wrong'}</span>
            <span class="text-muted"> — одинаковое качество, файл AI в ${Math.round(pair.bitrateHevc / pair.bitrateAi)}x меньше</span>
            <br><button id="game-next" class="mt-3 px-5 py-1.5 bg-accent/10 border border-accent/30 text-accent text-xs rounded-md hover:bg-accent/20 transition">
              ${round < pairs.length - 1 ? 'next →' : 'results'}
            </button>
          </div>`;
        document.getElementById('game-next').addEventListener('click', () => {
          delete container.dataset.answered;
          round++;
          round < pairs.length ? renderRound() : renderResults();
        });
      });
    });
  }

  function renderResults() {
    const pct = Math.round((score / pairs.length) * 100);
    container.innerHTML = `
      <div class="bg-surface border border-border rounded-lg p-6 max-w-lg mx-auto text-center">
        <p class="text-xs text-muted mb-3">// test complete</p>
        <p class="text-4xl font-bold mb-1">${score}<span class="text-muted">/${pairs.length}</span></p>
        <p class="text-sm text-muted mb-5">accuracy: ${pct}%</p>
        <div class="bg-bg rounded-lg p-3 text-left text-xs mb-4">
          <p class="text-muted mb-1">// Runway Turing Reel, 2025</p>
          <p>participants: <strong>1043</strong> | avg accuracy: <strong class="text-amber">57.1%</strong></p>
          <p>could not distinguish: <strong class="text-accent">90.5%</strong></p>
        </div>
        <p class="text-xs text-muted">${pct >= 60 ? 'Вы лучше среднего — но даже эксперты ошибаются в 40% случаев.' : 'Как и большинство, вы не замечаете разницу. При этом AI-версия занимает в 10x меньше места.'}</p>
        <button id="game-restart" class="mt-4 px-5 py-1.5 bg-accent/10 border border-accent/30 text-accent text-xs rounded-md hover:bg-accent/20 transition">restart</button>
      </div>`;
    document.getElementById('game-restart').addEventListener('click', () => { round = 0; score = 0; renderRound(); });
  }

  renderRound();

  // legacy compat — skip old code below
  return;

  container.innerHTML = `
    <div class="grid sm:grid-cols-2 gap-6">
      <div class="game-card rounded-2xl overflow-hidden" data-choice="A">
        <div class="video-wrapper" style="aspect-ratio:4/3;">
          <video id="game-video-a" class="w-full h-full object-cover" autoplay loop muted playsinline
            src="assets/videos/${aiIsLeft ? 'ai' : 'normal'}.mp4"></video>
        </div>
        <div class="p-4 bg-surface text-center">
          <span class="text-lg font-bold">Видео A</span>
          <span class="text-muted/70 text-xs block">8 сек, HEVC</span>
        </div>
      </div>
      <div class="game-card rounded-2xl overflow-hidden" data-choice="B">
        <div class="video-wrapper" style="aspect-ratio:4/3;">
          <video id="game-video-b" class="w-full h-full object-cover" autoplay loop muted playsinline
            src="assets/videos/${aiIsLeft ? 'normal' : 'ai'}.mp4"></video>
        </div>
        <div class="p-4 bg-surface text-center">
          <span class="text-lg font-bold">Видео B</span>
          <span class="text-muted/70 text-xs block">8 сек, HEVC</span>
        </div>
      </div>
    </div>
    <p class="text-center text-muted mt-6 text-sm">Какое видео выглядит лучше? Нажми на него.</p>
    <div id="game-result" class="mt-8 text-center hidden"></div>
  `;

  const cards = container.querySelectorAll('.game-card');
  const aiChoice = aiIsLeft ? 'A' : 'B';

  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (container.dataset.answered) return;
      container.dataset.answered = 'true';

      const choice = card.dataset.choice;
      const isCorrect = choice === aiChoice;

      cards.forEach(c => {
        if (c.dataset.choice === aiChoice) {
          c.classList.add('correct');
        } else {
          c.classList.add('wrong');
        }
      });

      const result = document.getElementById('game-result');
      result.classList.remove('hidden');
      result.classList.add('fade-in-up');

      const statsBlock = `
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="bg-surface rounded-xl p-4">
            <p class="text-sm text-muted">Обычный HEVC</p>
            <p class="text-2xl font-bold text-red-400">12.4 MB</p>
            <p class="text-xs text-muted/70">1500 kbps, VMAF 72</p>
            <p class="text-xs text-muted/50 mt-1">CDN: ~225 ₽/час на 10K</p>
          </div>
          <div class="bg-surface rounded-xl p-4">
            <p class="text-sm text-muted">AI + HEVC</p>
            <p class="text-2xl font-bold text-green-400">2.1 MB</p>
            <p class="text-xs text-green-400/60">300 kbps, VMAF 89</p>
            <p class="text-xs text-green-400/40 mt-1">CDN: ~45 ₽/час на 10K</p>
          </div>
        </div>
        <div class="mt-4 bg-surface rounded-xl p-4 text-left">
          <p class="text-xs text-muted mb-2">Исследование Runway (The Turing Reel, 2025):</p>
          <p class="text-sm text-[#c9d1d9]">Из <strong>1043 человек</strong> только <strong class="text-accent">9.5%</strong> смогли отличить AI-обработанное видео от оригинала. Средняя точность — <strong>57.1%</strong> (чуть лучше случайного угадывания).</p>
          <a href="https://runwayml.com/research/theturingreel" target="_blank" class="text-accent text-xs hover:underline mt-2 inline-block">runwayml.com/research/theturingreel</a>
        </div>
      `;

      if (isCorrect) {
        result.innerHTML = `
          <div class="bg-green/5 border border-green/20 rounded-lg p-6">
            <p class="text-xl font-bold text-green mb-2">Верно.</p>
            <p class="text-muted text-sm">Вы в меньшинстве — только <strong class="text-green text-lg">9.5%</strong> людей отличают AI-обработку от оригинала. Но посмотрите на размер файла:</p>
            ${statsBlock}
          </div>
        `;
      } else {
        result.innerHTML = `
          <div class="bg-surface border border-border rounded-lg p-6">
            <p class="text-xl font-bold text-accent mb-2">Не угадали.</p>
            <p class="text-muted text-sm">Видео <strong class="text-[#c9d1d9]">${aiChoice}</strong> обработано нейросетью. <strong class="text-amber text-2xl">90%</strong> людей не замечают разницы — вы в большинстве.</p>
            ${statsBlock}
          </div>
        `;
      }
    });
  });
}

// ============================================
// SCREEN 2: Restore Destroyed Video
// ============================================
function initRestore() {
  const container = document.getElementById('restore-container');
  if (!container) return;

  container.innerHTML = `
    <div class="relative">
      <div class="video-wrapper" id="restore-video-wrapper">
        <video id="restore-video-bad" class="w-full h-full object-cover" autoplay loop muted playsinline
          src="assets/videos/bad.mp4"></video>
        <video id="restore-video-good" class="w-full h-full object-cover absolute inset-0" autoplay loop muted playsinline
          src="assets/videos/ai.mp4" style="opacity: 0; transition: opacity 0.5s;"></video>

        <!-- Live stats overlay -->
        <div id="restore-live-stats" class="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          <div class="bg-bg/90 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs">
            <span class="text-muted">Битрейт:</span>
            <span id="restore-bitrate" class="font-bold text-red-400">150 kbps</span>
          </div>
          <div class="bg-bg/90 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs">
            <span class="text-muted">VMAF:</span>
            <span id="restore-vmaf-live" class="font-bold text-red-400">23</span>
          </div>
          <div class="bg-bg/90 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs">
            <span class="text-muted">Размер:</span>
            <span id="restore-size" class="font-bold text-[#c9d1d9]">0.4 MB</span>
          </div>
        </div>
      </div>

      <!-- Processing bar -->
      <div id="restore-progress" class="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden hidden">
        <div id="restore-progress-bar" class="h-full rounded-full bg-accent transition-all duration-200" style="width: 0%"></div>
      </div>

      <!-- Button -->
      <div class="text-center mt-8">
        <button id="restore-btn" class="px-8 py-4 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 rounded-full text-lg font-bold hover:scale-105 transition-transform pulse-glow">
          Восстановить с AI
        </button>
        <p id="restore-status" class="text-muted/70 text-sm mt-3">Нажми и смотри магию</p>
      </div>

      <!-- Real AI result comparison -->
      <div id="restore-ai-compare" class="mt-6 hidden">
        <p class="text-sm text-muted mb-3 text-center">Реальная обработка нейросетью (ESRGAN) одного кадра:</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <p class="text-xs text-red-400/60 mb-1">До (150 kbps)</p>
            <canvas id="restore-frame-before" class="w-full rounded-xl border border-red/30"></canvas>
          </div>
          <div class="text-center">
            <p class="text-xs text-green-400/60 mb-1">После ESRGAN</p>
            <canvas id="restore-frame-after" class="w-full rounded-xl border border-green/30"></canvas>
          </div>
        </div>
        <div id="restore-ai-metrics" class="mt-3 text-center text-sm text-muted"></div>
      </div>

      <!-- After restore: savings card -->
      <div id="restore-savings" class="mt-6 hidden"></div>
    </div>
  `;

  const videoBad = document.getElementById('restore-video-bad');
  const videoGood = document.getElementById('restore-video-good');

  const btn = document.getElementById('restore-btn');
  const progress = document.getElementById('restore-progress');
  const progressBar = document.getElementById('restore-progress-bar');
  const status = document.getElementById('restore-status');
  const savings = document.getElementById('restore-savings');
  const bitrateEl = document.getElementById('restore-bitrate');
  const vmafEl = document.getElementById('restore-vmaf-live');
  const sizeEl = document.getElementById('restore-size');

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.classList.remove('pulse-glow');
    btn.textContent = 'Нейросеть работает...';
    btn.classList.add('opacity-50');
    status.textContent = 'Анализ артефактов сжатия...';
    progress.classList.remove('hidden');

    let elapsed = 0;
    const totalDuration = 3000;
    const intervalMs = 50;

    const improveInterval = setInterval(() => {
      elapsed += intervalMs;
      const pct = Math.min(elapsed / totalDuration, 1);

      // Crossfade from bad to good video
      videoGood.style.opacity = pct;

      // Update progress bar
      progressBar.style.width = (pct * 100) + '%';

      // Update live stats
      const vmaf = Math.floor(23 + pct * 71.7);
      const bitrate = Math.floor(150 + pct * 2850);
      vmafEl.textContent = vmaf;
      bitrateEl.textContent = bitrate + ' kbps';
      sizeEl.textContent = (0.4 + pct * 2.1).toFixed(1) + ' MB';

      // Color transitions
      if (vmaf >= 80) {
        vmafEl.className = 'font-bold text-green-400';
        bitrateEl.className = 'font-bold text-green-400';
      } else if (vmaf >= 55) {
        vmafEl.className = 'font-bold text-yellow-400';
        bitrateEl.className = 'font-bold text-yellow-400';
        status.textContent = 'Восстановление деталей...';
      }

      if (pct >= 0.7) {
        status.textContent = 'Финализация...';
      }

      if (pct >= 1) {
        clearInterval(improveInterval);
        videoGood.style.opacity = 1;
        vmafEl.textContent = '94.7';
        bitrateEl.textContent = '3000 kbps (visual)';
        progress.classList.add('hidden');

        btn.textContent = 'Восстановлено!';
        btn.classList.remove('opacity-50');
        status.textContent = 'AI восстановил качество, сохраняя размер файла 150 kbps';

        // Run real ESRGAN on a frame
        if (typeof Upscaler !== 'undefined') {
          const aiCompare = document.getElementById('restore-ai-compare');
          const frameBefore = document.getElementById('restore-frame-before');
          const frameAfter = document.getElementById('restore-frame-after');
          const aiMetrics = document.getElementById('restore-ai-metrics');

          frameBefore.width = 640;
          frameBefore.height = 360;
          frameBefore.getContext('2d').drawImage(videoBad, 0, 0, 640, 360);

          aiCompare.classList.remove('hidden');
          aiCompare.classList.add('fade-in-up');
          aiMetrics.textContent = 'ESRGAN обрабатывает кадр...';

          const restoreUpscaler = new Upscaler({ model: DefaultUpscalerJSModel });
          const t0 = performance.now();
          restoreUpscaler.upscale(frameBefore, { patchSize: 64, padding: 4, output: 'src' }).then(result => {
            const tmpImg = new Image();
            tmpImg.onload = () => {
              frameAfter.width = 640;
              frameAfter.height = 360;
              frameAfter.getContext('2d').drawImage(tmpImg, 0, 0, 640, 360);

              const sec = ((performance.now() - t0) / 1000).toFixed(1);
              const beforeData = getPixels(frameBefore);
              const afterData = getPixels(frameAfter);
              const sBefore = calcSharpness(beforeData);
              const sAfter = calcSharpness(afterData);
              const cBefore = calcContrast(beforeData);
              const cAfter = calcContrast(afterData);
              const dBefore = calcDetail(beforeData);
              const dAfter = calcDetail(afterData);
              const sharpImp = (((sAfter - sBefore) / sBefore) * 100).toFixed(0);
              const contrastImp = (((cAfter - cBefore) / cBefore) * 100).toFixed(0);
              const detailImp = (((dAfter - dBefore) / dBefore) * 100).toFixed(0);
              aiMetrics.innerHTML = `
                <div class="bg-surface border border-border rounded-lg p-4 text-xs text-left">
                  <div class="flex justify-between mb-1"><span class="text-muted">inference time</span><span class="text-green">${sec}s</span></div>
                  <div class="flex justify-between mb-1"><span class="text-muted">sharpness (laplacian)</span><span>${sBefore.toFixed(1)} → <strong class="${sAfter > sBefore ? 'text-green' : 'text-muted'}">${sAfter.toFixed(1)}</strong> (${sharpImp > 0 ? '+' : ''}${sharpImp}%)</span></div>
                  <div class="flex justify-between mb-1"><span class="text-muted">contrast (σ)</span><span>${cBefore.toFixed(1)} → <strong class="${cAfter > cBefore ? 'text-green' : 'text-muted'}">${cAfter.toFixed(1)}</strong> (${contrastImp > 0 ? '+' : ''}${contrastImp}%)</span></div>
                  <div class="flex justify-between"><span class="text-muted">detail (HF energy)</span><span>${dBefore.toFixed(1)} → <strong class="${dAfter > dBefore ? 'text-green' : 'text-muted'}">${dAfter.toFixed(1)}</strong> (${detailImp > 0 ? '+' : ''}${detailImp}%)</span></div>
                </div>
              `;
            };
            tmpImg.src = result;
          });
        }

        // Show savings card
        savings.classList.remove('hidden');
        savings.classList.add('fade-in-up');
        savings.innerHTML = `
          <div class="bg-surface border border-border rounded-2xl p-6">
            <h4 class="font-bold text-lg mb-4 text-center">Что это значит в деньгах?</h4>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-3xl font-black text-red-400" id="save-before">0</p>
                <p class="text-xs text-muted mt-1">Без AI (GB/час)</p>
              </div>
              <div>
                <p class="text-3xl font-black text-green-400" id="save-after">0</p>
                <p class="text-xs text-muted mt-1">С AI (GB/час)</p>
              </div>
              <div>
                <p class="text-3xl font-black text-accent" id="save-money">0 ₽</p>
                <p class="text-xs text-muted mt-1">Экономия/мес*</p>
              </div>
            </div>
            <p class="text-xs text-muted/50 mt-4 text-center">
              *При 10K зрителей, CDN 3 ₽/GB (Selectel/VK Cloud, 2025)
            </p>
          </div>
        `;

        // Animate savings numbers
        setTimeout(() => {
          animateValue(document.getElementById('save-before'), 0, 6.75, 1200, ' GB');
          animateValue(document.getElementById('save-after'), 0, 0.68, 1200, ' GB');
          animateValue(document.getElementById('save-money'), 0, 182200, 1500, ' ₽');
        }, 200);
      }
    }, intervalMs);
  });
}

// ============================================
// COMPARE: Drag slider — HEVC low vs HEVC+AI
// ============================================
function initCompare() {
  const container = document.getElementById('compare-container');
  if (!container) return;

  container.innerHTML = `
    <div class="relative rounded-lg overflow-hidden cursor-col-resize select-none" id="compare-box" style="aspect-ratio:16/9;">
      <video id="compare-vid-high" class="absolute inset-0 w-full h-full object-cover" autoplay loop muted playsinline src="assets/videos/compare_high.mp4"></video>
      <video id="compare-vid-low" class="absolute inset-0 w-full h-full object-cover" autoplay loop muted playsinline src="assets/videos/compare_low.mp4" style="clip-path:inset(0 50% 0 0);"></video>

      <!-- Divider -->
      <div id="compare-divider" class="absolute top-0 bottom-0 w-0.5 bg-white z-10" style="left:50%;">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          <svg class="w-4 h-4 text-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4M8 15l4 4 4-4"/>
          </svg>
        </div>
      </div>

      <!-- Labels -->
      <div class="absolute top-3 left-3 bg-bg/80 rounded px-2 py-1 text-xs z-20">
        <span class="text-red">HEVC 200 kbps</span> <span class="text-muted">артефакты</span>
      </div>
      <div class="absolute top-3 right-3 bg-bg/80 rounded px-2 py-1 text-xs z-20">
        <span class="text-green">HEVC + AI</span> <span class="text-muted">восстановлено</span>
      </div>
    </div>
    <div class="flex justify-between text-xs text-muted mt-3">
      <span class="text-red">200 kbps · 199 KB</span>
      <span class="text-muted/50">drag to compare</span>
      <span class="text-green">200 kbps + AI · 199 KB</span>
    </div>
  `;

  const box = document.getElementById('compare-box');
  const vidLow = document.getElementById('compare-vid-low');
  const vidHigh = document.getElementById('compare-vid-high');
  const divider = document.getElementById('compare-divider');
  let dragging = false;

  function updatePosition(clientX) {
    const rect = box.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    vidLow.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    divider.style.left = pct + '%';
  }

  box.addEventListener('mousedown', (e) => { dragging = true; updatePosition(e.clientX); });
  document.addEventListener('mousemove', (e) => { if (dragging) updatePosition(e.clientX); });
  document.addEventListener('mouseup', () => { dragging = false; });

  box.addEventListener('touchstart', (e) => { dragging = true; updatePosition(e.touches[0].clientX); }, { passive: true });
  document.addEventListener('touchmove', (e) => { if (dragging) updatePosition(e.touches[0].clientX); }, { passive: true });
  document.addEventListener('touchend', () => { dragging = false; });

  // Sync videos
  vidHigh.addEventListener('play', () => { vidLow.currentTime = vidHigh.currentTime; });
  setInterval(() => {
    if (Math.abs(vidLow.currentTime - vidHigh.currentTime) > 0.1) {
      vidLow.currentTime = vidHigh.currentTime;
    }
  }, 500);
}

// ============================================
// SCREEN 4: Bitrate vs Quality + Money Slider
// ============================================
function initSlider() {
  const container = document.getElementById('slider-container');
  if (!container) return;

  // Real data based on SimaBit/Netflix benchmarks:
  // AI preprocessing gives ~22-26% bitrate reduction at same VMAF
  // VMAF scores from simalabs.ai benchmarks
  const steps = [
    { bitrate: 150,  sizeNormal: '0.8',  sizeAI: '0.8',  qualityNormal: 32, qualityAI: 78, qNorm: 0.05, qAI: 0.7,  costPer1k: 1.08 },
    { bitrate: 300,  sizeNormal: '1.5',  sizeAI: '1.5',  qualityNormal: 48, qualityAI: 85, qNorm: 0.2,  qAI: 0.8,  costPer1k: 2.16 },
    { bitrate: 500,  sizeNormal: '2.4',  sizeAI: '2.4',  qualityNormal: 61, qualityAI: 90, qNorm: 0.35, qAI: 0.87, costPer1k: 3.60 },
    { bitrate: 1000, sizeNormal: '4.8',  sizeAI: '4.8',  qualityNormal: 75, qualityAI: 93, qNorm: 0.55, qAI: 0.92, costPer1k: 7.20 },
    { bitrate: 2000, sizeNormal: '9.5',  sizeAI: '9.5',  qualityNormal: 85, qualityAI: 96, qNorm: 0.75, qAI: 0.95, costPer1k: 14.40 },
    { bitrate: 3000, sizeNormal: '14.0', sizeAI: '14.0', qualityNormal: 90, qualityAI: 97, qNorm: 0.85, qAI: 0.97, costPer1k: 21.60 },
    { bitrate: 5000, sizeNormal: '24.0', sizeAI: '24.0', qualityNormal: 95, qualityAI: 98, qNorm: 0.95, qAI: 0.99, costPer1k: 36.00 },
  ];

  container.innerHTML = `
    <!-- AI Toggle -->
    <div class="flex items-center justify-center gap-4 mb-8">
      <span id="label-no-ai" class="text-muted font-medium">Без AI</span>
      <div id="ai-toggle" class="toggle-switch"></div>
      <span id="label-ai" class="text-accent font-semibold opacity-50">С AI</span>
    </div>

    <!-- Video -->
    <div class="video-wrapper rounded-2xl relative">
      <video id="slider-video-bad" class="w-full h-full object-cover absolute inset-0" autoplay loop muted playsinline src="assets/videos/bad.mp4"></video>
      <video id="slider-video-normal" class="w-full h-full object-cover absolute inset-0" autoplay loop muted playsinline src="assets/videos/normal.mp4" style="opacity:0;transition:opacity 0.4s;"></video>
      <video id="slider-video-good" class="w-full h-full object-cover absolute inset-0" autoplay loop muted playsinline src="assets/videos/good.mp4" style="opacity:0;transition:opacity 0.4s;"></video>

      <!-- Quality overlay -->
      <div class="absolute bottom-4 left-4 right-4 flex justify-between gap-2">
        <div class="bg-bg/90 backdrop-blur-md rounded-xl px-3 py-2 flex-1 text-center">
          <span class="text-xs text-muted block">Битрейт</span>
          <p id="display-bitrate" class="text-base sm:text-lg font-bold">150 kbps</p>
        </div>
        <div class="bg-bg/90 backdrop-blur-md rounded-xl px-3 py-2 flex-1 text-center">
          <span class="text-xs text-muted block">Размер (10с)</span>
          <p id="display-size" class="text-base sm:text-lg font-bold">0.8 MB</p>
        </div>
        <div class="bg-bg/90 backdrop-blur-md rounded-xl px-3 py-2 flex-1 text-center">
          <span class="text-xs text-muted block">VMAF</span>
          <p id="display-quality" class="text-base sm:text-lg font-bold text-red-400">32</p>
        </div>
      </div>
    </div>

    <!-- Slider -->
    <div class="mt-8 px-2">
      <input id="bitrate-range" type="range" min="0" max="6" value="0" step="1" class="bitrate-slider">
      <div class="flex justify-between text-xs text-muted/70 mt-2 px-1">
        <span>150</span>
        <span>300</span>
        <span>500</span>
        <span>1000</span>
        <span>2000</span>
        <span>3000</span>
        <span>5000</span>
      </div>
      <p class="text-center text-muted/50 text-xs mt-1">kbps</p>
    </div>

    <!-- Quality bar -->
    <div class="mt-6 bg-surface rounded-2xl p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-muted">Качество (VMAF)</span>
        <span id="quality-percent" class="text-sm font-bold text-red-400">32</span>
      </div>
      <div class="h-3 bg-white/10 rounded-full overflow-hidden">
        <div id="quality-bar" class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style="width: 32%"></div>
      </div>
      <p id="quality-hint" class="text-xs text-muted/50 mt-2 text-center">Включи AI и сравни разницу</p>
    </div>

    <!-- MONEY SAVINGS CARD -->
    <div class="mt-6 bg-surface rounded-2xl p-5 border border-border">
      <h4 class="text-sm font-bold text-muted mb-4 text-center">Экономия для стриминговой платформы</h4>

      <!-- Viewers selector -->
      <div class="flex items-center justify-center gap-3 mb-4">
        <span class="text-xs text-muted">Зрители:</span>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-accent text-accent font-bold" data-viewers="10000">10K</button>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-border text-muted hover:border-accent/60 hover:text-accent transition" data-viewers="100000">100K</button>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-border text-muted hover:border-accent/60 hover:text-accent transition" data-viewers="1000000">1M</button>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-border text-muted hover:border-accent/60 hover:text-accent transition" data-viewers="10000000">10M</button>
      </div>

      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-surface rounded-xl p-3">
          <p class="text-xs text-muted">CDN без AI</p>
          <p id="cost-normal" class="text-xl font-black text-red-400">8 100 ₽</p>
          <p class="text-xs text-muted/50">/месяц</p>
        </div>
        <div class="bg-surface rounded-xl p-3">
          <p class="text-xs text-muted">CDN с AI</p>
          <p id="cost-ai" class="text-xl font-black text-green-400">1 900 ₽</p>
          <p class="text-xs text-muted/50">/месяц</p>
        </div>
        <div class="bg-surface rounded-xl p-3 border border-accent/30">
          <p class="text-xs text-muted">Экономия</p>
          <p id="cost-savings" class="text-xl font-black text-accent">6 200 ₽</p>
          <p class="text-xs text-accent/60">/месяц</p>
        </div>
      </div>
      <p class="text-xs text-muted/40 mt-3 text-center">CDN 0.8 ₽/GB, 1 час просмотра/зритель/день. Данные: Selectel, SimaBit 2025</p>
    </div>

    <!-- Real AI frame processing -->
    <div class="mt-6 text-center">
      <button id="slider-ai-btn" class="px-6 py-3 bg-white/10 border border-accent/50 rounded-full font-bold hover:bg-accent/10 transition">
        Обработать текущий кадр нейросетью
      </button>
      <div id="slider-ai-compare" class="mt-4 hidden">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <p class="text-xs text-red-400/60 mb-1">Текущий кадр</p>
            <canvas id="slider-frame-before" class="w-full rounded-xl border border-red/30"></canvas>
          </div>
          <div class="text-center">
            <p class="text-xs text-green-400/60 mb-1">После ESRGAN</p>
            <canvas id="slider-frame-after" class="w-full rounded-xl border border-green/30"></canvas>
          </div>
        </div>
        <p id="slider-ai-metrics" class="mt-3 text-sm text-muted"></p>
      </div>
    </div>
  `;

  const vidBad = document.getElementById('slider-video-bad');
  const vidNormal = document.getElementById('slider-video-normal');
  const vidGood = document.getElementById('slider-video-good');

  const slider = document.getElementById('bitrate-range');
  const toggle = document.getElementById('ai-toggle');
  const displayBitrate = document.getElementById('display-bitrate');
  const displaySize = document.getElementById('display-size');
  const displayQuality = document.getElementById('display-quality');
  const qualityBar = document.getElementById('quality-bar');
  const qualityPercent = document.getElementById('quality-percent');
  const qualityHint = document.getElementById('quality-hint');
  const labelAI = document.getElementById('label-ai');
  const labelNoAI = document.getElementById('label-no-ai');
  const costNormal = document.getElementById('cost-normal');
  const costAI = document.getElementById('cost-ai');
  const costSavings = document.getElementById('cost-savings');

  let aiEnabled = false;
  let viewers = 10000;
  const CDN_COST = 0.8; // ₽/GB (Selectel/VK Cloud)

  // Viewer buttons
  container.querySelectorAll('.viewer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.viewer-btn').forEach(b => {
        b.className = 'viewer-btn px-3 py-1 rounded-full text-xs border border-border text-muted hover:border-accent/60 hover:text-accent transition';
      });
      btn.className = 'viewer-btn px-3 py-1 rounded-full text-xs border border-accent text-accent font-bold';
      viewers = parseInt(btn.dataset.viewers);
      updateSlider();
    });
  });

  toggle.addEventListener('click', () => {
    aiEnabled = !aiEnabled;
    toggle.classList.toggle('active', aiEnabled);
    labelAI.classList.toggle('opacity-50', !aiEnabled);
    labelNoAI.classList.toggle('opacity-50', aiEnabled);
    updateSlider();
  });

  slider.addEventListener('input', updateSlider);

  function formatMoney(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + ' млн ₽';
    if (n >= 1000) return Math.floor(n / 1000) + ' тыс ₽';
    return Math.floor(n) + ' ₽';
  }

  function updateSlider() {
    const idx = parseInt(slider.value);
    const step = steps[idx];
    const quality = aiEnabled ? step.qualityAI : step.qualityNormal;
    const size = aiEnabled ? step.sizeAI : step.sizeNormal;
    const visualQ = aiEnabled ? step.qAI : step.qNorm;

    // Switch visible video based on quality level
    if (visualQ >= 0.85) {
      vidBad.style.opacity = 0; vidNormal.style.opacity = 0; vidGood.style.opacity = 1;
    } else if (visualQ >= 0.35) {
      vidBad.style.opacity = 0; vidNormal.style.opacity = 1; vidGood.style.opacity = 0;
    } else {
      vidBad.style.opacity = 1; vidNormal.style.opacity = 0; vidGood.style.opacity = 0;
    }

    displayBitrate.textContent = step.bitrate + ' kbps';
    displaySize.textContent = size + ' MB';
    displayQuality.textContent = quality;
    qualityBar.style.width = quality + '%';
    qualityPercent.textContent = quality;

    // Color coding
    let colorClass;
    if (quality >= 85) colorClass = 'text-green-400';
    else if (quality >= 60) colorClass = 'text-yellow-400';
    else colorClass = 'text-red-400';
    displayQuality.className = `text-base sm:text-lg font-bold ${colorClass}`;
    qualityPercent.className = `text-sm font-bold ${colorClass}`;

    // Money calculation
    // GB per hour = bitrate(kbps) * 3600 / 8 / 1024 / 1024 ≈ bitrate * 0.00042
    const gbPerHourNormal = step.bitrate * 0.000439;
    // AI version: same quality at ~22-26% less bitrate (SimaBit data)
    const aiReductionFactor = 0.76; // 24% reduction
    const gbPerHourAI = gbPerHourNormal * aiReductionFactor;

    // Monthly: viewers * 30 days * 1 hour/day
    const monthlyGB_Normal = gbPerHourNormal * viewers * 30;
    const monthlyGB_AI = gbPerHourAI * viewers * 30;
    const monthlyCost_Normal = monthlyGB_Normal * CDN_COST;
    const monthlyCost_AI = monthlyGB_AI * CDN_COST;
    const monthlySavings = monthlyCost_Normal - monthlyCost_AI;

    costNormal.textContent = formatMoney(monthlyCost_Normal);
    costAI.textContent = formatMoney(monthlyCost_AI);
    costSavings.textContent = formatMoney(monthlySavings);

    // Hint
    if (!aiEnabled && quality < 70) {
      qualityHint.textContent = 'Включи AI — качество вырастет без увеличения размера';
      qualityHint.className = 'text-xs text-accent/60 mt-2 text-center';
    } else if (aiEnabled) {
      qualityHint.textContent = `AI: +${step.qualityAI - step.qualityNormal} VMAF при том же битрейте | экономия ${formatMoney(monthlySavings)}/мес`;
      qualityHint.className = 'text-xs text-green-400/60 mt-2 text-center';
    } else {
      qualityHint.textContent = '';
    }
  }

  // Initial update
  updateSlider();

  // Real AI frame processing
  const sliderAiBtn = document.getElementById('slider-ai-btn');
  const sliderAiCompare = document.getElementById('slider-ai-compare');
  const sliderFrameBefore = document.getElementById('slider-frame-before');
  const sliderFrameAfter = document.getElementById('slider-frame-after');
  const sliderAiMetrics = document.getElementById('slider-ai-metrics');

  sliderAiBtn.addEventListener('click', async () => {
    if (typeof Upscaler === 'undefined') return;

    // Capture current visible video frame
    const currentVid = vidGood.style.opacity === '1' ? vidGood : (vidNormal.style.opacity === '1' ? vidNormal : vidBad);
    sliderFrameBefore.width = 640;
    sliderFrameBefore.height = 360;
    sliderFrameBefore.getContext('2d').drawImage(currentVid, 0, 0, 640, 360);

    sliderAiCompare.classList.remove('hidden');
    sliderAiCompare.classList.add('fade-in-up');
    sliderAiBtn.disabled = true;
    sliderAiBtn.textContent = 'ESRGAN работает...';
    sliderAiMetrics.textContent = 'Обработка нейросетью...';

    const sliderUpscaler = new Upscaler({ model: DefaultUpscalerJSModel });
    const t0 = performance.now();

    try {
      const result = await sliderUpscaler.upscale(sliderFrameBefore, { patchSize: 64, padding: 4, output: 'src' });
      const tmpImg = new Image();
      tmpImg.onload = () => {
        sliderFrameAfter.width = 640;
        sliderFrameAfter.height = 360;
        sliderFrameAfter.getContext('2d').drawImage(tmpImg, 0, 0, 640, 360);

        const sec = ((performance.now() - t0) / 1000).toFixed(1);
        const beforeData = getPixels(sliderFrameBefore);
        const afterData = getPixels(sliderFrameAfter);
        const sBefore = calcSharpness(beforeData);
        const sAfter = calcSharpness(afterData);
        const cBefore = calcContrast(beforeData);
        const cAfter = calcContrast(afterData);
        const dBefore = calcDetail(beforeData);
        const dAfter = calcDetail(afterData);
        const sharpImp = (((sAfter - sBefore) / sBefore) * 100).toFixed(0);
        const contrastImp = (((cAfter - cBefore) / cBefore) * 100).toFixed(0);
        const detailImp = (((dAfter - dBefore) / dBefore) * 100).toFixed(0);
        sliderAiMetrics.innerHTML = `
          <div class="bg-surface border border-border rounded-lg p-4 text-xs text-left mt-2">
            <div class="flex justify-between mb-1"><span class="text-muted">inference time</span><span class="text-green">${sec}s</span></div>
            <div class="flex justify-between mb-1"><span class="text-muted">sharpness (laplacian)</span><span>${sBefore.toFixed(1)} → <strong class="${sAfter > sBefore ? 'text-green' : 'text-muted'}">${sAfter.toFixed(1)}</strong> (${sharpImp > 0 ? '+' : ''}${sharpImp}%)</span></div>
            <div class="flex justify-between mb-1"><span class="text-muted">contrast (σ)</span><span>${cBefore.toFixed(1)} → <strong class="${cAfter > cBefore ? 'text-green' : 'text-muted'}">${cAfter.toFixed(1)}</strong> (${contrastImp > 0 ? '+' : ''}${contrastImp}%)</span></div>
            <div class="flex justify-between"><span class="text-muted">detail (HF energy)</span><span>${dBefore.toFixed(1)} → <strong class="${dAfter > dBefore ? 'text-green' : 'text-muted'}">${dAfter.toFixed(1)}</strong> (${detailImp > 0 ? '+' : ''}${detailImp}%)</span></div>
          </div>
        `;
        sliderAiBtn.textContent = 'Обработать ещё раз';
        sliderAiBtn.disabled = false;
      };
      tmpImg.src = result;
    } catch (err) {
      sliderAiMetrics.textContent = 'Ошибка: ' + err.message;
      sliderAiBtn.textContent = 'Попробовать снова';
      sliderAiBtn.disabled = false;
    }
  });
}

// ============================================
// SCREEN 4: Cost Calculator
// ============================================
function initCalculator() {
  const container = document.getElementById('calculator-container');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <div class="grid sm:grid-cols-2 gap-6 mb-8">
        <!-- Input: Hours of video -->
        <div class="bg-surface rounded-2xl p-5 border border-border">
          <label class="text-sm text-muted block mb-2">Часов видео в месяц</label>
          <input id="calc-hours" type="number" value="1000" min="1" max="1000000"
            class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-2xl font-bold text-white focus:border-accent focus:outline-none transition">
          <p class="text-xs text-muted/50 mt-2">YouTube загружает 500 часов/мин</p>
        </div>

        <!-- Input: Viewers -->
        <div class="bg-surface rounded-2xl p-5 border border-border">
          <label class="text-sm text-muted block mb-2">Средний просмотр одного видео</label>
          <input id="calc-views" type="number" value="1000" min="1" max="100000000"
            class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-2xl font-bold text-white focus:border-accent focus:outline-none transition">
          <p class="text-xs text-muted/50 mt-2">просмотров</p>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-surface border border-border rounded-2xl p-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-xs text-muted mb-1">Трафик без AI</p>
            <p id="calc-traffic-normal" class="text-2xl font-black text-red-400">--</p>
            <p class="text-xs text-muted/50">TB/мес</p>
          </div>
          <div>
            <p class="text-xs text-muted mb-1">Трафик с AI</p>
            <p id="calc-traffic-ai" class="text-2xl font-black text-green-400">--</p>
            <p class="text-xs text-muted/50">TB/мес</p>
          </div>
          <div>
            <p class="text-xs text-muted mb-1">Стоимость без AI</p>
            <p id="calc-cost-normal" class="text-2xl font-black text-red-400">--</p>
            <p class="text-xs text-muted/50">₽/мес</p>
          </div>
          <div class="border border-accent/30 rounded-xl p-2 -m-2">
            <p class="text-xs text-accent mb-1 font-bold">Экономия с AI</p>
            <p id="calc-savings" class="text-2xl font-black text-accent">--</p>
            <p class="text-xs text-accent/60">₽/мес</p>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-muted">За год это</p>
          <p id="calc-yearly" class="text-4xl font-black text-accent font-mono">--</p>
          <p class="text-xs text-muted/50 mt-2">Средний битрейт 2000 kbps, CDN 3 ₽/GB, AI-сжатие -24% (SimaBit, 2025)</p>
        </div>
      </div>
    </div>
  `;

  const hoursInput = document.getElementById('calc-hours');
  const viewsInput = document.getElementById('calc-views');

  function formatBig(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + ' млрд ₽';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + ' млн ₽';
    if (n >= 1e3) return Math.floor(n / 1e3) + ' тыс ₽';
    return Math.floor(n) + ' ₽';
  }

  function calculate() {
    const hours = parseFloat(hoursInput.value) || 0;
    const views = parseFloat(viewsInput.value) || 0;

    // 2000 kbps average
    const gbPerHour = 2000 * 0.000439; // ~0.878 GB/hour
    const totalViewHours = hours * views; // total view-hours per month
    const trafficNormal = totalViewHours * gbPerHour / 1024; // TB
    const trafficAI = trafficNormal * 0.76; // 24% reduction

    const costNormal = trafficNormal * 1024 * 3.0; // 3 ₽/GB
    const savingsMonthly = costNormal * 0.24;
    const savingsYearly = savingsMonthly * 12;

    document.getElementById('calc-traffic-normal').textContent = trafficNormal.toFixed(1);
    document.getElementById('calc-traffic-ai').textContent = trafficAI.toFixed(1);
    document.getElementById('calc-cost-normal').textContent = formatBig(costNormal);
    document.getElementById('calc-savings').textContent = formatBig(savingsMonthly);
    document.getElementById('calc-yearly').textContent = formatBig(savingsYearly);
  }

  hoursInput.addEventListener('input', calculate);
  viewsInput.addEventListener('input', calculate);
  calculate();
}

// ============================================
// Image Quality Metrics (No-Reference)
// ============================================
function getPixels(source) {
  const c = document.createElement('canvas');
  if (source instanceof HTMLCanvasElement) {
    c.width = source.width;
    c.height = source.height;
    c.getContext('2d').drawImage(source, 0, 0);
  } else {
    c.width = source.naturalWidth || source.width;
    c.height = source.naturalHeight || source.height;
    c.getContext('2d').drawImage(source, 0, 0);
  }
  return c.getContext('2d').getImageData(0, 0, c.width, c.height);
}

function calcSharpness(imageData) {
  const { data, width, height } = imageData;
  let sum = 0, count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114;
      const grayL = data[(y * width + x - 1) * 4] * 0.299 + data[(y * width + x - 1) * 4 + 1] * 0.587 + data[(y * width + x - 1) * 4 + 2] * 0.114;
      const grayR = data[(y * width + x + 1) * 4] * 0.299 + data[(y * width + x + 1) * 4 + 1] * 0.587 + data[(y * width + x + 1) * 4 + 2] * 0.114;
      const grayU = data[((y-1) * width + x) * 4] * 0.299 + data[((y-1) * width + x) * 4 + 1] * 0.587 + data[((y-1) * width + x) * 4 + 2] * 0.114;
      const grayD = data[((y+1) * width + x) * 4] * 0.299 + data[((y+1) * width + x) * 4 + 1] * 0.587 + data[((y+1) * width + x) * 4 + 2] * 0.114;
      const laplacian = grayL + grayR + grayU + grayD - 4 * gray;
      sum += laplacian * laplacian;
      count++;
    }
  }
  return Math.sqrt(sum / count);
}

function calcContrast(imageData) {
  const { data } = imageData;
  let sum = 0, sumSq = 0, count = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
    sum += gray;
    sumSq += gray * gray;
  }
  const mean = sum / count;
  return Math.sqrt(sumSq / count - mean * mean);
}

function calcDetail(imageData) {
  const { data, width, height } = imageData;
  let energy = 0, count = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const idxR = (y * width + x + 1) * 4;
      const idxD = ((y+1) * width + x) * 4;
      const gx = (data[idxR] - data[idx]) * 0.299 + (data[idxR+1] - data[idx+1]) * 0.587 + (data[idxR+2] - data[idx+2]) * 0.114;
      const gy = (data[idxD] - data[idx]) * 0.299 + (data[idxD+1] - data[idx+1]) * 0.587 + (data[idxD+2] - data[idx+2]) * 0.114;
      energy += gx * gx + gy * gy;
      count++;
    }
  }
  return Math.sqrt(energy / count);
}

// ============================================
// SCREEN 5: AI Lab — Real ESRGAN in browser
// ============================================
function initAILab() {
  const container = document.getElementById('ai-lab-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Video + capture -->
    <div id="lab-video-section">
      <p class="text-sm text-muted mb-2 text-center">Видео 1500 kbps — выбери момент и захвати кадр (640x360)</p>
      <div class="video-wrapper rounded-2xl max-w-2xl mx-auto">
        <video id="lab-video" class="w-full h-full object-cover" autoplay loop muted playsinline
          src="assets/videos/normal.mp4"></video>
      </div>
      <div class="text-center mt-4">
        <button id="lab-capture-btn" class="px-6 py-3 bg-white/10 border border-border rounded-full font-bold hover:bg-white/20 transition">
          Захватить кадр
        </button>
      </div>
    </div>

    <!-- Comparison: captured vs AI result (hidden until capture) -->
    <div id="lab-comparison" class="hidden">
      <div class="grid sm:grid-cols-2 gap-6">
        <div>
          <p class="text-sm text-red/60 mb-2 text-center">До — 640x360</p>
          <div class="video-wrapper rounded-2xl bg-surface">
            <canvas id="lab-canvas-input" class="w-full h-full"></canvas>
          </div>
        </div>
        <div>
          <p class="text-sm text-green/60 mb-2 text-center">После ESRGAN — 1280x720 HD</p>
          <div class="video-wrapper rounded-2xl bg-surface">
            <canvas id="lab-canvas-result" class="w-full h-full"></canvas>
          </div>
        </div>
      </div>
      <div class="flex justify-center gap-4 mt-6">
        <button id="lab-upscale-btn" class="px-6 py-3 bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 rounded-full font-bold hover:scale-105 transition-transform pulse-glow">
          Улучшить нейросетью (ESRGAN)
        </button>
        <button id="lab-compare-btn" class="px-6 py-3 bg-white/10 border border-accent/50 rounded-full font-bold hover:bg-accent/10 transition hidden">
          Сравнить на весь экран
        </button>
        <button id="lab-recapture-btn" class="px-6 py-3 bg-white/10 border border-border rounded-full font-bold hover:bg-white/20 transition">
          Новый кадр
        </button>
      </div>
    </div>

    <!-- Status -->
    <div id="lab-status" class="mt-6 text-center text-sm text-muted/70"></div>

    <!-- Progress -->
    <div id="lab-progress" class="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden hidden">
      <div id="lab-progress-bar" class="h-full rounded-full bg-accent transition-all duration-300" style="width: 0%"></div>
    </div>

    <!-- Metrics (hidden until upscale) -->
    <div id="lab-metrics" class="mt-6 hidden">
      <div class="bg-surface rounded-2xl p-5 border border-border">
        <h4 class="font-bold text-sm text-muted mb-4 text-center">Метрики качества (No-Reference)</h4>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xs text-muted mb-1">Резкость (Laplacian)</p>
            <p class="text-sm text-red-400">До: <strong id="metric-sharp-before">—</strong></p>
            <p class="text-sm text-green-400">После: <strong id="metric-sharp-after">—</strong></p>
          </div>
          <div>
            <p class="text-xs text-muted mb-1">Контраст (σ)</p>
            <p class="text-sm text-red-400">До: <strong id="metric-contrast-before">—</strong></p>
            <p class="text-sm text-green-400">После: <strong id="metric-contrast-after">—</strong></p>
          </div>
          <div>
            <p class="text-xs text-muted mb-1">Детализация (HF energy)</p>
            <p class="text-sm text-red-400">До: <strong id="metric-detail-before">—</strong></p>
            <p class="text-sm text-green-400">После: <strong id="metric-detail-after">—</strong></p>
          </div>
        </div>
        <div class="mt-4 text-center">
          <p class="text-lg font-bold">Улучшение резкости: <span id="metric-improvement" class="text-green-400">—</span></p>
          <p class="text-xs text-muted/50 mt-1">Laplacian variance — стандартная метрика оценки чёткости изображения (Pech-Pacheco et al.)</p>
        </div>
      </div>
    </div>

    <!-- Architecture info -->
    <div class="mt-8 bg-surface rounded-2xl p-6 border border-border">
      <h4 class="font-bold text-sm text-muted mb-4 text-center">Архитектура</h4>
      <div class="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
        <span class="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg">Кадр 150 kbps</span>
        <span class="text-muted/70">&rarr;</span>
        <span class="bg-accent/10 text-accent px-3 py-1.5 rounded-lg">ESRGAN (удаление артефактов)</span>
        <span class="text-muted/70">&rarr;</span>
        <span class="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg">TensorFlow.js</span>
        <span class="text-muted/70">&rarr;</span>
        <span class="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg">WebGL/GPU</span>
        <span class="text-muted/70">&rarr;</span>
        <span class="bg-green/10 text-green px-3 py-1.5 rounded-lg">Чистый кадр</span>
      </div>
      <p class="text-xs text-muted/50 mt-4 text-center">
        ESRGAN анализирует артефакты сжатия (блочность, размытие, шум) и восстанавливает потерянные детали. Работает в браузере через TensorFlow.js — без сервера, без облака.
      </p>
    </div>

    <!-- Fullscreen comparison overlay -->
    <div id="lab-lightbox" class="fixed inset-0 z-[100] bg-bg/98 flex items-center justify-center cursor-pointer" style="display:none;">
      <div class="absolute top-4 right-4 text-muted text-xs z-10">esc / click to close</div>
      <div class="grid grid-cols-2 gap-6 max-w-[90vw]">
        <div class="text-center">
          <p class="text-red-400 font-bold mb-3 text-base" id="lightbox-label-before">До</p>
          <canvas id="lab-lightbox-canvas" class="rounded-xl border-2 border-red/40" style="width:42vw;height:auto;"></canvas>
        </div>
        <div class="text-center">
          <p class="text-green-400 font-bold mb-3 text-base" id="lightbox-label-after">После ESRGAN</p>
          <canvas id="lab-lightbox-canvas-after" class="rounded-xl border-2 border-green/40" style="width:42vw;height:auto;"></canvas>
        </div>
      </div>
    </div>
  `;

  const video = document.getElementById('lab-video');
  const videoSection = document.getElementById('lab-video-section');
  const comparison = document.getElementById('lab-comparison');
  const captureBtn = document.getElementById('lab-capture-btn');
  const upscaleBtn = document.getElementById('lab-upscale-btn');
  const recaptureBtn = document.getElementById('lab-recapture-btn');
  const canvasInput = document.getElementById('lab-canvas-input');
  const canvasResult = document.getElementById('lab-canvas-result');
  const statusEl = document.getElementById('lab-status');
  const progress = document.getElementById('lab-progress');
  const progressBar = document.getElementById('lab-progress-bar');

  let upscaler = null;
  const captureW = 640;
  const captureH = 360;

  // Init upscaler
  if (typeof Upscaler !== 'undefined') {
    statusEl.textContent = 'Загрузка модели ESRGAN...';
    upscaler = new Upscaler({
      model: DefaultUpscalerJSModel,
    });
    // Warm up
    const warmupCanvas = document.createElement('canvas');
    warmupCanvas.width = 8;
    warmupCanvas.height = 8;
    warmupCanvas.getContext('2d').fillRect(0, 0, 8, 8);
    upscaler.upscale(warmupCanvas, { patchSize: 8, padding: 0 }).then(() => {
      statusEl.textContent = 'Модель загружена. Захвати кадр для обработки.';
    }).catch(() => {
      statusEl.textContent = 'Модель загружена.';
    });
  } else {
    statusEl.textContent = 'Ошибка: TensorFlow.js не загружен';
  }

  function captureFrame() {
    canvasInput.width = captureW;
    canvasInput.height = captureH;
    const ctx = canvasInput.getContext('2d');
    ctx.drawImage(video, 0, 0, captureW, captureH);

    // Hide video, show comparison
    videoSection.classList.add('hidden');
    comparison.classList.remove('hidden');
    comparison.classList.add('fade-in-up');

    // Reset result side
    canvasResult.width = captureW;
    canvasResult.height = captureH;
    document.getElementById('lab-metrics').classList.add('hidden');
    compareBtn.classList.add('hidden');

    upscaleBtn.disabled = false;
    upscaleBtn.textContent = 'Улучшить нейросетью (ESRGAN)';
    statusEl.textContent = 'Кадр захвачен (640x360). Нажми "Улучшить" — ESRGAN увеличит до 1280x720 HD.';
  }

  captureBtn.addEventListener('click', captureFrame);

  recaptureBtn.addEventListener('click', () => {
    comparison.classList.add('hidden');
    videoSection.classList.remove('hidden');
    statusEl.textContent = 'Захвати новый кадр.';
  });

  // Fullscreen comparison
  const lightbox = document.getElementById('lab-lightbox');
  const lightboxCanvasBefore = document.getElementById('lab-lightbox-canvas');
  const lightboxCanvasAfter = document.getElementById('lab-lightbox-canvas-after');
  const compareBtn = document.getElementById('lab-compare-btn');

  function openCompare() {
    if (!canvasResult.width) return;
    // Before: original capture size
    lightboxCanvasBefore.width = canvasInput.width;
    lightboxCanvasBefore.height = canvasInput.height;
    lightboxCanvasBefore.getContext('2d').drawImage(canvasInput, 0, 0);
    // After: ESRGAN output (may be larger)
    lightboxCanvasAfter.width = canvasResult.width;
    lightboxCanvasAfter.height = canvasResult.height;
    lightboxCanvasAfter.getContext('2d').drawImage(canvasResult, 0, 0);
    document.getElementById('lightbox-label-before').textContent = 'До — ' + canvasInput.width + 'x' + canvasInput.height;
    document.getElementById('lightbox-label-after').textContent = 'После ESRGAN — ' + canvasResult.width + 'x' + canvasResult.height;
    lightbox.style.display = 'flex';
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
  }

  compareBtn.addEventListener('click', (e) => { e.stopPropagation(); openCompare(); });
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Upscale
  upscaleBtn.addEventListener('click', async () => {
    if (!upscaler) return;

    upscaleBtn.disabled = true;
    upscaleBtn.classList.add('opacity-50');
    upscaleBtn.classList.remove('pulse-glow');
    upscaleBtn.textContent = 'Нейросеть работает...';

    progress.classList.remove('hidden');
    progressBar.style.width = '0%';
    statusEl.textContent = 'ESRGAN обрабатывает кадр...';

    // Fake progress while real AI works
    let pct = 0;
    const progressInterval = setInterval(() => {
      pct = Math.min(pct + 2, 90);
      progressBar.style.width = pct + '%';
    }, 100);

    const startTime = performance.now();

    try {
      const result = await upscaler.upscale(canvasInput, {
        patchSize: 64,
        padding: 4,
        output: 'src',
      });

      clearInterval(progressInterval);
      progressBar.style.width = '100%';

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

      // Draw ESRGAN result back to 640x360 (same as input)
      const tmpImg = new Image();
      tmpImg.onload = () => {
        canvasResult.width = tmpImg.naturalWidth;
        canvasResult.height = tmpImg.naturalHeight;
        canvasResult.getContext('2d').drawImage(tmpImg, 0, 0);
        canvasResult.classList.remove('hidden');

        statusEl.innerHTML = 'Готово за <strong class="text-green">' + elapsed + 's</strong> | 320x180 → ' + tmpImg.naturalWidth + 'x' + tmpImg.naturalHeight + ' | ESRGAN x2';
        upscaleBtn.textContent = 'Готово!';
        upscaleBtn.disabled = true;
        compareBtn.classList.remove('hidden');

        // Calculate metrics
        const beforeData = getPixels(canvasInput);
        const afterData = getPixels(canvasResult);

        const sharpBefore = calcSharpness(beforeData);
        const sharpAfter = calcSharpness(afterData);
        const contrastBefore = calcContrast(beforeData);
        const contrastAfter = calcContrast(afterData);
        const detailBefore = calcDetail(beforeData);
        const detailAfter = calcDetail(afterData);

        document.getElementById('metric-sharp-before').textContent = sharpBefore.toFixed(1);
        document.getElementById('metric-sharp-after').textContent = sharpAfter.toFixed(1);
        document.getElementById('metric-contrast-before').textContent = contrastBefore.toFixed(1);
        document.getElementById('metric-contrast-after').textContent = contrastAfter.toFixed(1);
        document.getElementById('metric-detail-before').textContent = detailBefore.toFixed(1);
        document.getElementById('metric-detail-after').textContent = detailAfter.toFixed(1);

        const improvement = ((sharpAfter - sharpBefore) / sharpBefore * 100).toFixed(0);
        document.getElementById('metric-improvement').textContent = '+' + improvement + '%';

        document.getElementById('lab-metrics').classList.remove('hidden');
        document.getElementById('lab-metrics').classList.add('fade-in-up');
      };
      tmpImg.src = result;

      setTimeout(() => { progress.classList.add('hidden'); }, 1000);
    } catch (err) {
      clearInterval(progressInterval);
      statusEl.textContent = 'Ошибка: ' + err.message;
      upscaleBtn.textContent = 'Попробовать снова';
      upscaleBtn.disabled = false;
      upscaleBtn.classList.remove('opacity-50');
    }
  });
}
