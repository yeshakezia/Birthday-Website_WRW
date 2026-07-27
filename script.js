// ---------- Confetti ----------
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confetti = [];
const colors = ['#ff6b9d', '#ffd166', '#4ecdc4', '#fff8f0'];

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
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 10,
      gravity: 0.25 + Math.random() * 0.1,
      life: 0,
    });
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confetti.forEach((p) => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life += 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, 1 - p.life / 200);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });
  confetti = confetti.filter((p) => p.life < 200 && p.y < canvas.height + 50);
  requestAnimationFrame(animateConfetti);
}
animateConfetti();

// ---------- Candles ----------
const cake = document.getElementById('cake');
const hint = document.getElementById('hint');
let allBlown = false;

cake.addEventListener('click', () => {
  const candles = cake.querySelectorAll('.candle[data-lit="true"]');
  if (candles.length === 0) return;

  candles.forEach((candle) => {
    candle.dataset.lit = 'false';
  });

  const rect = cake.getBoundingClientRect();
  spawnConfetti(rect.left + rect.width / 2, rect.top + 30, 120);

  hint.classList.add('done');
  hint.textContent = 'yay! 🎉 wish sent 🎉';
  hint.classList.remove('done');
  allBlown = true;
});

// ---------- Birthday song (Web Audio API, plays the classic melody) ----------
const songBtn = document.getElementById('songBtn');
const songBtnLabel = document.getElementById('songBtnLabel');
let audioCtx = null;
let isPlaying = false;

// Notes as [frequency, durationInBeats]. Rests are 0 frequency.
const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
  D5: 587.33, E5: 659.25,
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
  if (!allBlown) {
    const rect = songBtn.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top, 40);
  }
});
