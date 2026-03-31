// ============================================
// Demo Video Generator
// Uses canvas to create fake "compressed" and "clean" video frames
// Replace with real videos when ready
// ============================================

class DemoVideo {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = options.width || 640;
    this.height = options.height || 360;
    this.quality = options.quality !== undefined ? options.quality : 1; // 0 = worst, 1 = best
    this.running = false;
    this.frame = 0;
    this.speed = options.speed || 1;

    canvas.width = this.width;
    canvas.height = this.height;
  }

  start() {
    this.running = true;
    this._animate();
  }

  stop() {
    this.running = false;
  }

  setQuality(q) {
    this.quality = Math.max(0, Math.min(1, q));
  }

  _animate() {
    if (!this.running) return;
    this._drawFrame();
    this.frame += this.speed;
    requestAnimationFrame(() => this._animate());
  }

  _drawFrame() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const t = this.frame * 0.02;

    // Background gradient (sky)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a0533');
    grad.addColorStop(0.5, '#2d1b69');
    grad.addColorStop(1, '#0f0f23');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 137.5 + t * 5) % w);
      const sy = ((i * 97.3) % (h * 0.5));
      const size = (Math.sin(t + i) * 0.5 + 1) * 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountains
    ctx.fillStyle = '#1a1a3e';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const y = h * 0.55 + Math.sin(x * 0.008 + 1) * 40 + Math.sin(x * 0.02) * 15;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.fill();

    // Water reflection
    const waterGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
    waterGrad.addColorStop(0, '#0d0d2b');
    waterGrad.addColorStop(1, '#05051a');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    // Water ripples
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const ry = h * 0.75 + i * 12;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = ry + Math.sin(x * 0.03 + t + i) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Moon
    const moonX = w * 0.7 + Math.sin(t * 0.1) * 10;
    const moonY = h * 0.2;
    const moonGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 50);
    moonGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
    moonGrad.addColorStop(0.5, 'rgba(200,180,255,0.3)');
    moonGrad.addColorStop(1, 'rgba(147,51,234,0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Moving particles (like fireflies)
    for (let i = 0; i < 12; i++) {
      const px = (i * 67 + t * 20 * (0.5 + i * 0.1)) % w;
      const py = h * 0.3 + Math.sin(t * 0.5 + i * 2) * h * 0.2;
      const alpha = Math.sin(t + i * 1.5) * 0.3 + 0.4;
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text overlay
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('ReframeAI Demo', 10, h - 10);

    // === QUALITY DEGRADATION ===
    if (this.quality < 1) {
      this._applyDegradation();
    }
  }

  _applyDegradation() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const degradation = 1 - this.quality; // 0 = none, 1 = max

    // Pixelation effect
    if (degradation > 0.2) {
      const blockSize = Math.floor(2 + degradation * 14);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      for (let y = 0; y < h; y += blockSize) {
        for (let x = 0; x < w; x += blockSize) {
          // Average the block
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = 0; dy < blockSize && y + dy < h; dy++) {
            for (let dx = 0; dx < blockSize && x + dx < w; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              count++;
            }
          }
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);

          // Fill the block
          for (let dy = 0; dy < blockSize && y + dy < h; dy++) {
            for (let dx = 0; dx < blockSize && x + dx < w; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Block artifacts (HEVC-like macro blocks)
    if (degradation > 0.3) {
      const numBlocks = Math.floor(degradation * 15);
      for (let i = 0; i < numBlocks; i++) {
        const bx = Math.floor(((i * 173 + this.frame * 3) % w) / 16) * 16;
        const by = Math.floor(((i * 211 + this.frame * 7) % h) / 16) * 16;
        const bw = 16 + Math.floor(degradation * 32);
        const bh = 16 + Math.floor(degradation * 32);
        ctx.fillStyle = `rgba(${80 + i * 10}, ${40 + i * 5}, ${100 + i * 8}, ${degradation * 0.3})`;
        ctx.fillRect(bx, by, bw, bh);
      }
    }

    // Color banding
    if (degradation > 0.5) {
      ctx.fillStyle = `rgba(0, 0, 0, ${degradation * 0.15})`;
      for (let y = 0; y < h; y += 8) {
        if (y % 16 === 0) {
          ctx.fillRect(0, y, w, 2);
        }
      }
    }

    // Noise
    if (degradation > 0.1) {
      const noiseAmount = degradation * 0.08;
      ctx.fillStyle = `rgba(255,255,255,${noiseAmount})`;
      for (let i = 0; i < degradation * 80; i++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        ctx.fillRect(nx, ny, 1, 1);
      }
    }
  }
}

// Make globally available
window.DemoVideo = DemoVideo;
