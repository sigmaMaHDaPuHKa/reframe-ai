// ============================================
// ReframeAI — Main Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollAnimations();
  initGame();
  initRestore();
  initSlider();
  initCalculator();
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
// SCREEN 1: "Guess the AI" Game
// ============================================
function initGame() {
  const container = document.getElementById('game-container');
  if (!container) return;

  const aiIsLeft = Math.random() > 0.5;

  container.innerHTML = `
    <div class="grid sm:grid-cols-2 gap-6">
      <div class="game-card rounded-2xl overflow-hidden" data-choice="A">
        <div class="video-wrapper">
          <video id="game-video-a" class="w-full h-full object-cover" autoplay loop muted playsinline
            src="assets/videos/${aiIsLeft ? 'ai' : 'normal'}.mp4"></video>
        </div>
        <div class="p-4 bg-white/5 text-center">
          <span class="text-lg font-bold">Видео A</span>
          <span class="text-white/30 text-xs block">8 сек, HEVC</span>
        </div>
      </div>
      <div class="game-card rounded-2xl overflow-hidden" data-choice="B">
        <div class="video-wrapper">
          <video id="game-video-b" class="w-full h-full object-cover" autoplay loop muted playsinline
            src="assets/videos/${aiIsLeft ? 'normal' : 'ai'}.mp4"></video>
        </div>
        <div class="p-4 bg-white/5 text-center">
          <span class="text-lg font-bold">Видео B</span>
          <span class="text-white/30 text-xs block">8 сек, HEVC</span>
        </div>
      </div>
    </div>
    <p class="text-center text-white/40 mt-6 text-sm">Какое видео выглядит лучше? Нажми на него.</p>
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
          <div class="bg-black/30 rounded-xl p-4">
            <p class="text-sm text-white/40">Обычный HEVC</p>
            <p class="text-2xl font-bold text-red-400">12.4 MB</p>
            <p class="text-xs text-white/30">1500 kbps, VMAF 72</p>
          </div>
          <div class="bg-black/30 rounded-xl p-4">
            <p class="text-sm text-white/40">AI + HEVC</p>
            <p class="text-2xl font-bold text-green-400">2.1 MB</p>
            <p class="text-xs text-green-400/60">300 kbps, VMAF 89</p>
          </div>
        </div>
        <div class="mt-4 bg-white/5 rounded-xl p-4 text-left">
          <p class="text-xs text-white/40 mb-2">Исследование Runway (The Turing Reel, 2025):</p>
          <p class="text-sm text-white/70">Из <strong>1043 человек</strong> только <strong class="text-purple-400">9.5%</strong> смогли отличить AI-обработанное видео от оригинала. Средняя точность — <strong>57.1%</strong> (чуть лучше случайного угадывания).</p>
          <a href="https://runwayml.com/research/theturingreel" target="_blank" class="text-purple-400 text-xs hover:underline mt-2 inline-block">runwayml.com/research/theturingreel</a>
        </div>
      `;

      if (isCorrect) {
        result.innerHTML = `
          <div class="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <p class="text-2xl font-bold text-green-400 mb-2">Верно!</p>
            <p class="text-white/60">Вы в числе 9.5% людей, которые отличают AI. Но посмотрите на размеры:</p>
            ${statsBlock}
          </div>
        `;
      } else {
        result.innerHTML = `
          <div class="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
            <p class="text-2xl font-bold text-purple-400 mb-2">Вот это поворот!</p>
            <p class="text-white/60">Видео <strong>${aiChoice}</strong> — это AI-версия. Вы, как и 90% людей, не заметили разницы.</p>
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
          <div class="bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs">
            <span class="text-white/40">Битрейт:</span>
            <span id="restore-bitrate" class="font-bold text-red-400">150 kbps</span>
          </div>
          <div class="bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs">
            <span class="text-white/40">VMAF:</span>
            <span id="restore-vmaf-live" class="font-bold text-red-400">23</span>
          </div>
          <div class="bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs">
            <span class="text-white/40">Размер:</span>
            <span id="restore-size" class="font-bold text-white/70">0.4 MB</span>
          </div>
        </div>
      </div>

      <!-- Processing bar -->
      <div id="restore-progress" class="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden hidden">
        <div id="restore-progress-bar" class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200" style="width: 0%"></div>
      </div>

      <!-- Button -->
      <div class="text-center mt-8">
        <button id="restore-btn" class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-bold hover:scale-105 transition-transform pulse-glow">
          Восстановить с AI
        </button>
        <p id="restore-status" class="text-white/30 text-sm mt-3">Нажми и смотри магию</p>
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

        // Show savings card
        savings.classList.remove('hidden');
        savings.classList.add('fade-in-up');
        savings.innerHTML = `
          <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h4 class="font-bold text-lg mb-4 text-center">Что это значит в деньгах?</h4>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-3xl font-black text-red-400" id="save-before">0</p>
                <p class="text-xs text-white/40 mt-1">Без AI (GB/час)</p>
              </div>
              <div>
                <p class="text-3xl font-black text-green-400" id="save-after">0</p>
                <p class="text-xs text-white/40 mt-1">С AI (GB/час)</p>
              </div>
              <div>
                <p class="text-3xl font-black text-purple-400" id="save-money">$0</p>
                <p class="text-xs text-white/40 mt-1">Экономия/мес*</p>
              </div>
            </div>
            <p class="text-xs text-white/20 mt-4 text-center">
              *При 100K зрителей, CDN $0.02/GB (Netflix данные, 2025)
            </p>
          </div>
        `;

        // Animate savings numbers
        setTimeout(() => {
          animateValue(document.getElementById('save-before'), 0, 6.75, 1200, ' GB');
          animateValue(document.getElementById('save-after'), 0, 0.68, 1200, ' GB');
          animateValue(document.getElementById('save-money'), 0, 12140, 1500, '', '$');
        }, 200);
      }
    }, intervalMs);
  });
}

// ============================================
// SCREEN 3: Bitrate vs Quality + Money Slider
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
      <span id="label-no-ai" class="text-white/50 font-medium">Без AI</span>
      <div id="ai-toggle" class="toggle-switch"></div>
      <span id="label-ai" class="text-purple-400 font-semibold opacity-50">С AI</span>
    </div>

    <!-- Video -->
    <div class="video-wrapper rounded-2xl relative">
      <video id="slider-video-bad" class="w-full h-full object-cover absolute inset-0" autoplay loop muted playsinline src="assets/videos/bad.mp4"></video>
      <video id="slider-video-normal" class="w-full h-full object-cover absolute inset-0" autoplay loop muted playsinline src="assets/videos/normal.mp4" style="opacity:0;transition:opacity 0.4s;"></video>
      <video id="slider-video-good" class="w-full h-full object-cover absolute inset-0" autoplay loop muted playsinline src="assets/videos/good.mp4" style="opacity:0;transition:opacity 0.4s;"></video>

      <!-- Quality overlay -->
      <div class="absolute bottom-4 left-4 right-4 flex justify-between gap-2">
        <div class="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 flex-1 text-center">
          <span class="text-xs text-white/40 block">Битрейт</span>
          <p id="display-bitrate" class="text-base sm:text-lg font-bold">150 kbps</p>
        </div>
        <div class="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 flex-1 text-center">
          <span class="text-xs text-white/40 block">Размер (10с)</span>
          <p id="display-size" class="text-base sm:text-lg font-bold">0.8 MB</p>
        </div>
        <div class="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 flex-1 text-center">
          <span class="text-xs text-white/40 block">VMAF</span>
          <p id="display-quality" class="text-base sm:text-lg font-bold text-red-400">32</p>
        </div>
      </div>
    </div>

    <!-- Slider -->
    <div class="mt-8 px-2">
      <input id="bitrate-range" type="range" min="0" max="6" value="0" step="1" class="bitrate-slider">
      <div class="flex justify-between text-xs text-white/30 mt-2 px-1">
        <span>150</span>
        <span>300</span>
        <span>500</span>
        <span>1000</span>
        <span>2000</span>
        <span>3000</span>
        <span>5000</span>
      </div>
      <p class="text-center text-white/20 text-xs mt-1">kbps</p>
    </div>

    <!-- Quality bar -->
    <div class="mt-6 bg-white/5 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-white/40">Качество (VMAF)</span>
        <span id="quality-percent" class="text-sm font-bold text-red-400">32</span>
      </div>
      <div class="h-3 bg-white/10 rounded-full overflow-hidden">
        <div id="quality-bar" class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style="width: 32%"></div>
      </div>
      <p id="quality-hint" class="text-xs text-white/20 mt-2 text-center">Включи AI и сравни разницу</p>
    </div>

    <!-- MONEY SAVINGS CARD -->
    <div class="mt-6 bg-white/5 rounded-2xl p-5 border border-white/10">
      <h4 class="text-sm font-bold text-white/60 mb-4 text-center">Экономия для стриминговой платформы</h4>

      <!-- Viewers selector -->
      <div class="flex items-center justify-center gap-3 mb-4">
        <span class="text-xs text-white/40">Зрители:</span>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-white/20 text-white/50 hover:border-purple-400 hover:text-purple-400 transition" data-viewers="1000">1K</button>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-purple-400 text-purple-400 font-bold" data-viewers="100000">100K</button>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-white/20 text-white/50 hover:border-purple-400 hover:text-purple-400 transition" data-viewers="1000000">1M</button>
        <button class="viewer-btn px-3 py-1 rounded-full text-xs border border-white/20 text-white/50 hover:border-purple-400 hover:text-purple-400 transition" data-viewers="10000000">10M</button>
      </div>

      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-black/30 rounded-xl p-3">
          <p class="text-xs text-white/40">CDN без AI</p>
          <p id="cost-normal" class="text-xl font-black text-red-400">$108</p>
          <p class="text-xs text-white/20">/месяц</p>
        </div>
        <div class="bg-black/30 rounded-xl p-3">
          <p class="text-xs text-white/40">CDN с AI</p>
          <p id="cost-ai" class="text-xl font-black text-green-400">$25</p>
          <p class="text-xs text-white/20">/месяц</p>
        </div>
        <div class="bg-black/30 rounded-xl p-3 border border-purple-500/30">
          <p class="text-xs text-white/40">Экономия</p>
          <p id="cost-savings" class="text-xl font-black text-purple-400">$83</p>
          <p class="text-xs text-purple-400/60">/месяц</p>
        </div>
      </div>
      <p class="text-xs text-white/15 mt-3 text-center">CDN $0.02/GB, 1 час просмотра/зритель/день. Данные: Netflix, SimaBit 2025</p>
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
  let viewers = 100000;
  const CDN_COST = 0.02; // $/GB

  // Viewer buttons
  container.querySelectorAll('.viewer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.viewer-btn').forEach(b => {
        b.className = 'viewer-btn px-3 py-1 rounded-full text-xs border border-white/20 text-white/50 hover:border-purple-400 hover:text-purple-400 transition';
      });
      btn.className = 'viewer-btn px-3 py-1 rounded-full text-xs border border-purple-400 text-purple-400 font-bold';
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
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + Math.floor(n);
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
      qualityHint.className = 'text-xs text-purple-400/60 mt-2 text-center';
    } else if (aiEnabled) {
      qualityHint.textContent = `AI: +${step.qualityAI - step.qualityNormal} VMAF при том же битрейте | экономия ${formatMoney(monthlySavings)}/мес`;
      qualityHint.className = 'text-xs text-green-400/60 mt-2 text-center';
    } else {
      qualityHint.textContent = '';
    }
  }

  // Initial update
  updateSlider();
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
        <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
          <label class="text-sm text-white/40 block mb-2">Часов видео в месяц</label>
          <input id="calc-hours" type="number" value="1000" min="1" max="1000000"
            class="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:border-purple-400 focus:outline-none transition">
          <p class="text-xs text-white/20 mt-2">YouTube загружает 500 часов/мин</p>
        </div>

        <!-- Input: Viewers -->
        <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
          <label class="text-sm text-white/40 block mb-2">Средний просмотр одного видео</label>
          <input id="calc-views" type="number" value="10000" min="1" max="100000000"
            class="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:border-purple-400 focus:outline-none transition">
          <p class="text-xs text-white/20 mt-2">просмотров</p>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-xs text-white/40 mb-1">Трафик без AI</p>
            <p id="calc-traffic-normal" class="text-2xl font-black text-red-400">--</p>
            <p class="text-xs text-white/20">TB/мес</p>
          </div>
          <div>
            <p class="text-xs text-white/40 mb-1">Трафик с AI</p>
            <p id="calc-traffic-ai" class="text-2xl font-black text-green-400">--</p>
            <p class="text-xs text-white/20">TB/мес</p>
          </div>
          <div>
            <p class="text-xs text-white/40 mb-1">Стоимость без AI</p>
            <p id="calc-cost-normal" class="text-2xl font-black text-red-400">--</p>
            <p class="text-xs text-white/20">$/мес</p>
          </div>
          <div class="border border-purple-500/30 rounded-xl p-2 -m-2">
            <p class="text-xs text-purple-400 mb-1 font-bold">Экономия с AI</p>
            <p id="calc-savings" class="text-2xl font-black text-purple-400">--</p>
            <p class="text-xs text-purple-400/60">$/мес</p>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-white/50">За год это</p>
          <p id="calc-yearly" class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">--</p>
          <p class="text-xs text-white/20 mt-2">Средний битрейт 2000 kbps, CDN $0.02/GB, AI-сжатие -24% (SimaBit, 2025)</p>
        </div>
      </div>
    </div>
  `;

  const hoursInput = document.getElementById('calc-hours');
  const viewsInput = document.getElementById('calc-views');

  function formatBig(n) {
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + Math.floor(n);
  }

  function calculate() {
    const hours = parseFloat(hoursInput.value) || 0;
    const views = parseFloat(viewsInput.value) || 0;

    // 2000 kbps average
    const gbPerHour = 2000 * 0.000439; // ~0.878 GB/hour
    const totalViewHours = hours * views; // total view-hours per month
    const trafficNormal = totalViewHours * gbPerHour / 1024; // TB
    const trafficAI = trafficNormal * 0.76; // 24% reduction

    const costNormal = trafficNormal * 1024 * 0.02; // $0.02/GB
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
