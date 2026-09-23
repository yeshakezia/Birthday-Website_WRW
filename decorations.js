// ============================================================
// Birthday decorations — stars, balloons, confetti, cake candles,
// smoke, and the birthday song. Plain classic script (no imports),
// so it runs fine even opened directly via file://.
// ============================================================

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
