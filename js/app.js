// ============================================
// ReframeAI — Main Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initGame();
  initRestore();
  initSlider();
});

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
// SCREEN 1: "Guess the AI" Game
// ============================================
function initGame() {
  const container = document.getElementById('game-container');
  if (!container) return;

  // Randomly assign AI to left or right
  const aiIsLeft = Math.random() > 0.5;

  container.innerHTML = `
    <div class="grid sm:grid-cols-2 gap-6">
      <div class="game-card rounded-2xl overflow-hidden" data-choice="A">
        <div class="video-wrapper">
          <video src="assets/videos/${aiIsLeft ? 'ai' : 'normal'}.mp4" muted loop playsinline autoplay></video>
        </div>
        <div class="p-4 bg-white/5 text-center">
          <span class="text-lg font-bold">Видео A</span>
        </div>
      </div>
      <div class="game-card rounded-2xl overflow-hidden" data-choice="B">
        <div class="video-wrapper">
          <video src="assets/videos/${aiIsLeft ? 'normal' : 'ai'}.mp4" muted loop playsinline autoplay></video>
        </div>
        <div class="p-4 bg-white/5 text-center">
          <span class="text-lg font-bold">Видео B</span>
        </div>
      </div>
    </div>
    <p class="text-center text-white/40 mt-6 text-sm">Нажми на видео, которое выглядит лучше</p>
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

      // Highlight cards
      cards.forEach(c => {
        if (c.dataset.choice === aiChoice) {
          c.classList.add('correct');
        } else {
          c.classList.add('wrong');
        }
      });

      // Show result
      const result = document.getElementById('game-result');
      result.classList.remove('hidden');
      result.classList.add('fade-in-up');

      if (isCorrect) {
        result.innerHTML = `
          <div class="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <p class="text-2xl font-bold text-green-400 mb-2">Верно! 🎯</p>
            <p class="text-white/60">Вы нашли AI-версию. Но вот что интересно:</p>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="bg-black/30 rounded-xl p-4">
                <p class="text-sm text-white/40">Обычное сжатие</p>
                <p class="text-2xl font-bold text-red-400">12.4 MB</p>
              </div>
              <div class="bg-black/30 rounded-xl p-4">
                <p class="text-sm text-white/40">AI-сжатие</p>
                <p class="text-2xl font-bold text-green-400">2.1 MB</p>
                <p class="text-xs text-green-400/60">в 6 раз меньше!</p>
              </div>
            </div>
          </div>
        `;
      } else {
        result.innerHTML = `
          <div class="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
            <p class="text-2xl font-bold text-purple-400 mb-2">Вот это поворот! 🤯</p>
            <p class="text-white/60">Видео <strong>${aiChoice}</strong> — это AI-версия. Вы выбрали обычное сжатие!</p>
            <p class="text-white/40 mt-2">А теперь смотрите на размеры:</p>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="bg-black/30 rounded-xl p-4">
                <p class="text-sm text-white/40">Ваш выбор (обычное)</p>
                <p class="text-2xl font-bold text-red-400">12.4 MB</p>
              </div>
              <div class="bg-black/30 rounded-xl p-4">
                <p class="text-sm text-white/40">AI-версия</p>
                <p class="text-2xl font-bold text-green-400">2.1 MB</p>
                <p class="text-xs text-green-400/60">в 6 раз меньше и лучше!</p>
              </div>
            </div>
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
        <video id="restore-bad" class="restore-video" src="assets/videos/bad.mp4" muted loop playsinline autoplay></video>
        <video id="restore-good" class="restore-video absolute top-0 left-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000" src="assets/videos/good.mp4" muted loop playsinline autoplay></video>

        <!-- Overlay stats -->
        <div id="restore-stats" class="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-xl p-3 text-sm hidden">
          <div class="text-white/40">Качество (VMAF)</div>
          <div id="restore-vmaf" class="text-2xl font-bold text-green-400">—</div>
        </div>

        <!-- Degradation overlay -->
        <div id="restore-overlay" class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <p class="text-white/60 text-sm mb-2">Битрейт: <span class="text-red-400 font-bold">150 kbps</span></p>
            <p class="text-white/40 text-xs">Сжатие: 98%</p>
          </div>
        </div>
      </div>

      <!-- Processing bar -->
      <div id="restore-progress" class="mt-4 h-1 bg-white/10 rounded-full overflow-hidden hidden">
        <div class="processing-bar rounded-full"></div>
      </div>

      <!-- Button -->
      <div class="text-center mt-8">
        <button id="restore-btn" class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-bold hover:scale-105 transition-transform pulse-glow">
          ✨ Восстановить с AI
        </button>
        <p id="restore-status" class="text-white/30 text-sm mt-3">Нажми и смотри магию</p>
      </div>
    </div>
  `;

  const btn = document.getElementById('restore-btn');
  const badVideo = document.getElementById('restore-bad');
  const goodVideo = document.getElementById('restore-good');
  const overlay = document.getElementById('restore-overlay');
  const progress = document.getElementById('restore-progress');
  const status = document.getElementById('restore-status');
  const stats = document.getElementById('restore-stats');
  const vmaf = document.getElementById('restore-vmaf');

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.classList.remove('pulse-glow');
    btn.textContent = '🧠 Нейросеть работает...';
    btn.classList.add('opacity-50');
    status.textContent = 'Анализ артефактов сжатия...';

    // Show progress bar
    progress.classList.remove('hidden');
    overlay.classList.add('glitch-active');

    // Sync videos
    goodVideo.currentTime = badVideo.currentTime;

    setTimeout(() => {
      status.textContent = 'Восстановление деталей...';
    }, 800);

    setTimeout(() => {
      status.textContent = 'Финализация...';
      overlay.classList.remove('glitch-active');
    }, 1500);

    // Reveal
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.5s';
      goodVideo.style.opacity = '1';
      progress.classList.add('hidden');

      btn.textContent = '✅ Восстановлено!';
      btn.classList.remove('opacity-50');
      status.textContent = 'Качество восстановлено с 150 kbps до визуальных 3000 kbps';

      // Show stats
      stats.classList.remove('hidden');
      stats.classList.add('fade-in-up');
      let vmafVal = 0;
      const vmafInterval = setInterval(() => {
        vmafVal += 2;
        vmaf.textContent = vmafVal;
        if (vmafVal >= 94) {
          clearInterval(vmafInterval);
          vmaf.textContent = '94.7';
        }
      }, 30);
    }, 2000);
  });
}

// ============================================
// SCREEN 3: Bitrate vs Quality Slider
// ============================================
function initSlider() {
  const container = document.getElementById('slider-container');
  if (!container) return;

  // Bitrate steps with corresponding video files and sizes
  const steps = [
    { bitrate: 150,  sizeNormal: '0.8 MB', sizeAI: '0.8 MB', qualityNormal: 32, qualityAI: 78 },
    { bitrate: 300,  sizeNormal: '1.5 MB', sizeAI: '1.5 MB', qualityNormal: 48, qualityAI: 85 },
    { bitrate: 500,  sizeNormal: '2.4 MB', sizeAI: '2.4 MB', qualityNormal: 61, qualityAI: 90 },
    { bitrate: 1000, sizeNormal: '4.8 MB', sizeAI: '4.8 MB', qualityNormal: 75, qualityAI: 93 },
    { bitrate: 2000, sizeNormal: '9.5 MB', sizeAI: '9.5 MB', qualityNormal: 85, qualityAI: 96 },
    { bitrate: 3000, sizeNormal: '14 MB',  sizeAI: '14 MB',  qualityNormal: 90, qualityAI: 97 },
    { bitrate: 5000, sizeNormal: '24 MB',  sizeAI: '24 MB',  qualityNormal: 95, qualityAI: 98 },
  ];

  container.innerHTML = `
    <!-- AI Toggle -->
    <div class="flex items-center justify-center gap-4 mb-8">
      <span class="text-white/50">Без AI</span>
      <div id="ai-toggle" class="toggle-switch"></div>
      <span class="text-purple-400 font-semibold">С AI</span>
    </div>

    <!-- Video comparison -->
    <div class="comparison-container bg-gray-900 rounded-2xl" id="comparison-area">
      <video id="slider-video" class="w-full h-full object-cover rounded-2xl" muted loop playsinline autoplay
             src="assets/videos/bad.mp4"></video>

      <!-- Quality overlay -->
      <div class="absolute bottom-4 left-4 right-4 flex justify-between">
        <div class="bg-black/70 backdrop-blur-md rounded-xl px-4 py-2">
          <span class="text-xs text-white/40">Битрейт</span>
          <p id="display-bitrate" class="text-lg font-bold">150 kbps</p>
        </div>
        <div class="bg-black/70 backdrop-blur-md rounded-xl px-4 py-2">
          <span class="text-xs text-white/40">Размер</span>
          <p id="display-size" class="text-lg font-bold">0.8 MB</p>
        </div>
        <div class="bg-black/70 backdrop-blur-md rounded-xl px-4 py-2">
          <span class="text-xs text-white/40">Качество (VMAF)</span>
          <p id="display-quality" class="text-lg font-bold text-red-400">32</p>
        </div>
      </div>
    </div>

    <!-- Slider -->
    <div class="mt-8 px-4">
      <input id="bitrate-range" type="range" min="0" max="6" value="0" step="1" class="bitrate-slider">
      <div class="flex justify-between text-xs text-white/30 mt-2">
        <span>150 kbps</span>
        <span>500</span>
        <span>1000</span>
        <span>2000</span>
        <span>5000 kbps</span>
      </div>
    </div>

    <!-- Quality bar -->
    <div class="mt-8 bg-white/5 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-white/40">Качество</span>
        <span id="quality-percent" class="text-sm font-bold text-purple-400">32%</span>
      </div>
      <div class="h-3 bg-white/10 rounded-full overflow-hidden">
        <div id="quality-bar" class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style="width: 32%"></div>
      </div>
    </div>
  `;

  const slider = document.getElementById('bitrate-range');
  const toggle = document.getElementById('ai-toggle');
  const displayBitrate = document.getElementById('display-bitrate');
  const displaySize = document.getElementById('display-size');
  const displayQuality = document.getElementById('display-quality');
  const qualityBar = document.getElementById('quality-bar');
  const qualityPercent = document.getElementById('quality-percent');

  let aiEnabled = false;

  toggle.addEventListener('click', () => {
    aiEnabled = !aiEnabled;
    toggle.classList.toggle('active', aiEnabled);
    updateSlider();
  });

  slider.addEventListener('input', updateSlider);

  function updateSlider() {
    const idx = parseInt(slider.value);
    const step = steps[idx];
    const quality = aiEnabled ? step.qualityAI : step.qualityNormal;
    const size = aiEnabled ? step.sizeAI : step.sizeNormal;

    displayBitrate.textContent = step.bitrate + ' kbps';
    displaySize.textContent = size;
    displayQuality.textContent = quality;
    qualityBar.style.width = quality + '%';
    qualityPercent.textContent = quality + '%';

    // Color coding
    if (quality >= 85) {
      displayQuality.className = 'text-lg font-bold text-green-400';
    } else if (quality >= 60) {
      displayQuality.className = 'text-lg font-bold text-yellow-400';
    } else {
      displayQuality.className = 'text-lg font-bold text-red-400';
    }

    // In a real implementation, we'd switch video sources here:
    // sliderVideo.src = `assets/videos/${aiEnabled ? 'ai' : 'normal'}_${step.bitrate}.mp4`;
  }
}
