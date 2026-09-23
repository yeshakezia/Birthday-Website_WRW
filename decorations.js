// ============================================================
// Birthday decorations — stars, balloons, confetti, cake candles,
// smoke, and the birthday song. Plain classic script (no imports),
// so it runs fine even opened directly via file://.
// ============================================================

// ---------- Stars ----------
const starsBg = document.getElementById('starsBg');

function createStars(count = 70) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.4 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    starsBg.appendChild(star);
  }
}
createStars();

// ---------- Balloons ----------
const balloonsLayer = document.getElementById('balloons');
if (balloonsLayer) {
  const balloonColors = [
    ['#9CAF88', '#7E9A6B'],
    ['#C6D3B4', '#A9BB93'],
    ['#E3C173', '#C89F4C'],
    ['#D9A9A0', '#C08880'],
    ['#F6F2E7', '#D8D2C1'],
  ];

  function spawnBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';

    const [top, bottom] = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    balloon.style.background = `radial-gradient(circle at 35% 30%, ${top}, ${bottom})`;

    const size = Math.random() * 22 + 38;
    balloon.style.width = `${size}px`;
    balloon.style.height = `${size * 1.25}px`;
    balloon.style.left = `${Math.random() * 92}%`;

    const duration = Math.random() * 6 + 10;
    balloon.style.animationDuration = `${duration}s`;

    balloonsLayer.appendChild(balloon);
    balloon.addEventListener('animationend', () => balloon.remove());
  }

  setInterval(spawnBalloon, 1300);
  for (let i = 0; i < 5; i++) {
    setTimeout(spawnBalloon, i * 500);
  }
}

// ---------- Confetti (mixed shapes: circle, ribbon, star, heart) ----------
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confetti = [];
const confettiColors = ['#9CAF88', '#C6D3B4', '#E3C173', '#D9A9A0', '#F6F2E7', '#6E8158'];
const shapeTypes = ['circle', 'ribbon', 'star', 'heart'];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnConfetti(originX, originY, count = 90) {
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: originX,
      y: originY,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -8 - 4,
      size: Math.random() * 7 + 5,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 12,
      gravity: 0.22 + Math.random() * 0.12,
      life: 0,
    });
  }
}

function drawStar(size) {
  const spikes = 5;
  const outerR = size;
  const innerR = size * 0.45;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeart(size) {
  const s = size * 0.9;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(0, -s * 0.3, -s, -s * 0.3, -s, s * 0.05);
  ctx.bezierCurveTo(-s, s * 0.5, -s * 0.4, s * 0.8, 0, s * 1.1);
  ctx.bezierCurveTo(s * 0.4, s * 0.8, s, s * 0.5, s, s * 0.05);
  ctx.bezierCurveTo(s, -s * 0.3, 0, -s * 0.3, 0, s * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawConfettiPiece(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = Math.max(0, 1 - p.life / 200);

  switch (p.shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'ribbon':
      ctx.fillRect(-p.size * 0.9, -p.size * 0.22, p.size * 1.8, p.size * 0.44);
      break;
    case 'star':
      drawStar(p.size * 0.6);
      break;
    case 'heart':
      drawHeart(p.size * 0.5);
      break;
  }
  ctx.restore();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confetti.forEach((p) => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life += 1;
    drawConfettiPiece(p);
  });
  confetti = confetti.filter((p) => p.life < 200 && p.y < canvas.height + 50);
  requestAnimationFrame(animateConfetti);
}
animateConfetti();

// ---------- Smoke effect (candles) ----------
function spawnSmoke(candleEl) {
  const spot = candleEl.querySelector('.smoke-spot');
  if (!spot) return;
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const puff = document.createElement('span');
      puff.className = 'smoke';
      puff.style.left = `${(Math.random() - 0.5) * 10}px`;
      puff.style.animationDuration = `${1 + Math.random() * 0.6}s`;
      spot.appendChild(puff);
      puff.addEventListener('animationend', () => puff.remove());
    }, i * 90);
  }
}

// ---------- Candles ----------
const cake = document.getElementById('cake');
const hint = document.getElementById('hint');

if (cake) {
  cake.addEventListener('click', () => {
    const candles = cake.querySelectorAll('.candle[data-lit="true"]');
    if (candles.length === 0) return;

    candles.forEach((candle) => {
      candle.dataset.lit = 'false';
      spawnSmoke(candle);
    });

    cake.classList.remove('shake');
    void cake.offsetWidth; // restart animation
    cake.classList.add('shake');

    const rect = cake.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + 30, 130);

    if (hint) hint.textContent = 'yay! wish kamu sudah "terkirim" ke langit malam ini 🌠';
  });
}

// ---------- Birthday song (Web Audio API, plays the classic melody) ----------
const songBtn = document.getElementById('songBtn');
if (songBtn) {
  const songBtnLabel = document.getElementById('songBtnLabel');
  let audioCtx = null;
  let isPlaying = false;

  const NOTE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
  };

  // Melody for "Happy Birthday to You" (public domain tune)
  const song = [
    [NOTE.C4, 0.5], [NOTE.C4, 0.5], [NOTE.D4, 1], [NOTE.C4, 1], [NOTE.F4, 1], [NOTE.E4, 2],
    [NOTE.C4, 0.5], [NOTE.C4, 0.5], [NOTE.D4, 1], [NOTE.C4, 1], [NOTE.G4, 1], [NOTE.F4, 2],
    [NOTE.C4, 0.5], [NOTE.C4, 0.5], [NOTE.C5, 1], [NOTE.A4, 1], [NOTE.F4, 1], [NOTE.E4, 1], [NOTE.D4, 2],
    [NOTE.B4, 0.5], [NOTE.B4, 0.5], [NOTE.A4, 1], [NOTE.F4, 1], [NOTE.G4, 1], [NOTE.F4, 2],
  ];

  const BEAT_SECONDS = 0.32;

  function playSong() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;
    songBtn.classList.add('playing');
    songBtnLabel.textContent = '♪ playing…';

    let t = audioCtx.currentTime + 0.05;

    song.forEach(([freq, beats]) => {
      const duration = beats * BEAT_SECONDS;
      if (freq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.28, t + 0.03);
        gain.gain.setValueAtTime(0.28, t + duration - 0.06);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t);
        osc.stop(t + duration);
      }
      t += duration;
    });

    const totalMs = (t - audioCtx.currentTime) * 1000;
    setTimeout(() => {
      isPlaying = false;
      songBtn.classList.remove('playing');
      songBtnLabel.textContent = '▶ play the birthday song';
    }, totalMs);
  }

  songBtn.addEventListener('click', () => {
    if (isPlaying) return;
    playSong();
    const rect = songBtn.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top, 40);
  });
}
