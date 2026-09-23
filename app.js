
const PASSCODE = "0925";

// ---------- Firebase (wrapped so a Firebase problem never kills the page) ----------
let db = null;
try {
  firebase.initializeApp(window.firebaseConfig);
  db = firebase.firestore();
} catch (err) {
  console.error("Firebase init failed:", err);
}

// ================= Ambient stars =================
function createAmbientStars(count = 40) {
  const layer = document.getElementById("ambientStars");
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "ambient-star";
    const size = Math.random() * 2.2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    layer.appendChild(star);
  }
}
createAmbientStars();

// ================= Ambient floating balloons (so the screen never feels empty) =================
const balloonsLayer = document.getElementById("ambientBalloons");
const BALLOON_COLORS = [
  ["#6FAE8B", "#4C8768"],
  ["#BFE3D0", "#9CCBB3"],
  ["#D9A94F", "#B8863A"],
  ["#F3F7F0", "#DCE8DD"],
];
function spawnBalloon() {
  const balloon = document.createElement("div");
  balloon.className = "balloon";
  const [top, bottom] = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
  balloon.style.background = `radial-gradient(circle at 35% 30%, ${top}, ${bottom})`;
  const size = Math.random() * 20 + 36;
  balloon.style.width = `${size}px`;
  balloon.style.height = `${size * 1.25}px`;
  balloon.style.left = `${Math.random() * 92}%`;
  const duration = Math.random() * 7 + 12;
  balloon.style.animationDuration = `${duration}s`;
  balloonsLayer.appendChild(balloon);
  balloon.addEventListener("animationend", () => balloon.remove());
}
setInterval(spawnBalloon, 1800);
for (let i = 0; i < 3; i++) setTimeout(spawnBalloon, i * 700);

// ================= Drifting clouds (extra life behind the cake/gift stage) =================
const cloudsLayer = document.getElementById("ambientClouds");
function spawnCloud() {
  const cloud = document.createElement("div");
  cloud.className = "cloud";
  const w = Math.random() * 60 + 70;
  const h = w * 0.4;
  cloud.style.width = `${w}px`;
  cloud.style.height = `${h}px`;
  cloud.style.top = `${Math.random() * 26 + 4}%`;
  cloud.style.setProperty("--puff1-size", `${h * 1.1}px`);
  cloud.style.setProperty("--puff2-size", `${h * 0.85}px`);
  cloud.style.opacity = String(Math.random() * 0.25 + 0.4);
  const duration = Math.random() * 30 + 40;
  cloud.style.animationDuration = `${duration}s`;
  cloud.style.left = "-140px";

  // two extra puffs to make a fluffier cloud silhouette
  const puff1 = document.createElement("span");
  puff1.style.width = puff1.style.height = `${h * 1.1}px`;
  puff1.style.left = `${w * 0.18}px`;
  puff1.style.top = `-${h * 0.5}px`;
  const puff2 = document.createElement("span");
  puff2.style.width = puff2.style.height = `${h * 0.85}px`;
  puff2.style.left = `${w * 0.55}px`;
  puff2.style.top = `-${h * 0.35}px`;
  cloud.appendChild(puff1);
  cloud.appendChild(puff2);

  cloudsLayer.appendChild(cloud);
  cloud.addEventListener("animationend", () => cloud.remove());
}
setInterval(spawnCloud, 9000);
for (let i = 0; i < 3; i++) setTimeout(spawnCloud, i * 3500);

// ================= FX canvas: confetti + fireworks =================
const fxCanvas = document.getElementById("fx-canvas");
const fxCtx = fxCanvas.getContext("2d");
let fxParticles = [];

function resizeFxCanvas() {
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeFxCanvas);
resizeFxCanvas();

const FX_COLORS = ["#6FAE8B", "#D9A94F", "#BFE3D0", "#F3F7F0", "#4C8768"];
const FX_SHAPES = ["circle", "ribbon", "star", "heart"];

function drawStarShape(size) {
  const spikes = 5;
  const outerR = size;
  const innerR = size * 0.45;
  fxCtx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) fxCtx.moveTo(px, py);
    else fxCtx.lineTo(px, py);
  }
  fxCtx.closePath();
  fxCtx.fill();
}
function drawHeartShape(size) {
  const s = size * 0.9;
  fxCtx.beginPath();
  fxCtx.moveTo(0, s * 0.3);
  fxCtx.bezierCurveTo(0, -s * 0.3, -s, -s * 0.3, -s, s * 0.05);
  fxCtx.bezierCurveTo(-s, s * 0.5, -s * 0.4, s * 0.8, 0, s * 1.1);
  fxCtx.bezierCurveTo(s * 0.4, s * 0.8, s, s * 0.5, s, s * 0.05);
  fxCtx.bezierCurveTo(s, -s * 0.3, 0, -s * 0.3, 0, s * 0.3);
  fxCtx.closePath();
  fxCtx.fill();
}

// paper-sprinkle moment when the candles get blown out.
function spawnConfettiBurst(x, y, count = 90, spread = 8) {
  for (let i = 0; i < count; i++) {
    fxParticles.push({
      type: "confetti",
      shape: FX_SHAPES[Math.floor(Math.random() * FX_SHAPES.length)],
      x, y,
      vx: (Math.random() - 0.5) * spread,
      vy: Math.random() * -spread - 4,
      size: Math.random() * 7 + 5,
      color: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 14,
      gravity: 0.2 + Math.random() * 0.14,
      life: 0,
    });
  }
}

function spawnFireworks(originX, originY, bursts = 5) {
  for (let b = 0; b < bursts; b++) {
    setTimeout(() => {
      const cx = originX + (Math.random() - 0.5) * 220;
      const cy = originY - Math.random() * 160;
      const color = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
      const sparkCount = 40;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount;
        const speed = Math.random() * 4 + 2;
        fxParticles.push({
          type: "spark",
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.5 + 1.5,
          color,
          gravity: 0.06,
          life: 0,
          maxLife: 70,
        });
      }
    }, b * 260);
  }
}

function animateFx() {
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  fxParticles.forEach((p) => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.life += 1;
    if (p.type === "confetti") {
      p.rotation += p.spin;
      fxCtx.save();
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate((p.rotation * Math.PI) / 180);
      fxCtx.globalAlpha = Math.max(0, 1 - p.life / 200);
      fxCtx.fillStyle = p.color;
      switch (p.shape) {
        case "circle":
          fxCtx.beginPath();
          fxCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          fxCtx.fill();
          break;
        case "ribbon":
          fxCtx.fillRect(-p.size * 0.9, -p.size * 0.22, p.size * 1.8, p.size * 0.44);
          break;
        case "star":
          drawStarShape(p.size * 0.6);
          break;
        case "heart":
          drawHeartShape(p.size * 0.5);
          break;
      }
      fxCtx.restore();
    } else {
      fxCtx.save();
      fxCtx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      fxCtx.fillStyle = p.color;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.restore();
    }
  });
  fxParticles = fxParticles.filter((p) =>
    p.type === "confetti" ? p.life < 200 && p.y < fxCanvas.height + 50 : p.life < p.maxLife
  );
  requestAnimationFrame(animateFx);
}
animateFx();

// ================= Lock screen =================
const lockScreen = document.getElementById("lockScreen");
const lockDotsWrap = document.getElementById("lockDots");
const lockDots = Array.from(lockDotsWrap.querySelectorAll(".lock-dot"));
const lockSub = document.getElementById("lockSub");
let enteredCode = "";

function renderDots() {
  lockDots.forEach((dot, i) => dot.classList.toggle("filled", i < enteredCode.length));
}

function resetLock() {
  enteredCode = "";
  renderDots();
}

function checkPasscode() {
  if (enteredCode === PASSCODE) {
    lockScreen.classList.add("unlocked");
    // stays scroll-locked until the gift is opened later in the sequence
  } else {
    lockSub.textContent = "That's not quite right — try again";
    lockDotsWrap.classList.remove("shake");
    void lockDotsWrap.offsetWidth;
    lockDotsWrap.classList.add("shake");
    setTimeout(resetLock, 350);
  }
}

document.getElementById("lockKeypad").addEventListener("click", (e) => {
  const keyBtn = e.target.closest(".key[data-key]");
  if (keyBtn) {
    if (enteredCode.length >= 4) return;
    enteredCode += keyBtn.dataset.key;
    renderDots();
    if (enteredCode.length === 4) setTimeout(checkPasscode, 150);
  }
});
document.getElementById("keyDelete").addEventListener("click", () => {
  enteredCode = enteredCode.slice(0, -1);
  renderDots();
});

// ================= Cake -> gift -> fireworks -> reveal =================
const cakeEl = document.getElementById("cake");
const giftEl = document.getElementById("gift");
const heroHint = document.getElementById("heroHint");
const heroReveal = document.getElementById("heroReveal");
let cakeBlown = false;
let giftOpened = false;

cakeEl.addEventListener("click", () => {
  if (cakeBlown) return;
  cakeBlown = true;

  cakeEl.querySelectorAll(".candle").forEach((candle) => {
    candle.classList.add("blown");
    const spot = candle.querySelector(".smoke-spot");
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const puff = document.createElement("span");
        puff.className = "smoke";
        puff.style.left = `${(Math.random() - 0.5) * 10}px`;
        spot.appendChild(puff);
        puff.addEventListener("animationend", () => puff.remove());
      }, i * 100);
    }
  });

  // big, "heboh" paper-sprinkle burst right when the candles go out
  const cakeRect = cakeEl.getBoundingClientRect();
  spawnConfettiBurst(cakeRect.left + cakeRect.width / 2, cakeRect.top + 90, 150, 11);

  cakeEl.classList.add("shake");
  heroHint.textContent = "making a wish for you... 🕯️";

  setTimeout(() => {
    cakeEl.classList.add("hidden-state");
    giftEl.hidden = false;
    requestAnimationFrame(() => giftEl.classList.add("showing"));
    heroHint.textContent = "點一下禮物，打開它 🎁";
  }, 1100);
});

giftEl.addEventListener("click", () => {
  if (giftOpened) return;
  giftOpened = true;

  giftEl.classList.add("opened");
  heroHint.style.opacity = "0";

  const rect = giftEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  spawnConfettiBurst(cx, cy, 70);
  spawnFireworks(cx, cy, 5);

  setTimeout(() => {
    giftEl.classList.add("gone"); // gift fades out completely
    buildCalendar();
    heroReveal.hidden = false;
    setTimeout(() => {
      giftEl.hidden = true;
      document.body.classList.remove("no-scroll");
    }, 500);
  }, 700);
});

// ---------- Mini calendar: dynamically finds the next Sept 25 ----------
function buildCalendar() {
  const now = new Date();
  let year = now.getFullYear();
  const sept25ThisYear = new Date(year, 8, 25);
  if (now > sept25ThisYear && (now - sept25ThisYear) / 86400000 > 1) {
    year += 1;
  }

  const monthLabel = new Date(year, 8, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  document.getElementById("calendarMonth").textContent = monthLabel;

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  ["S", "M", "T", "W", "T", "F", "S"].forEach((d) => {
    const head = document.createElement("span");
    head.className = "cal-day cal-header";
    head.style.fontWeight = "800";
    head.style.opacity = "0.5";
    head.textContent = d;
    grid.appendChild(head);
  });

  const firstWeekday = new Date(year, 8, 1).getDay();
  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("span");
    empty.className = "cal-day cal-empty";
    grid.appendChild(empty);
  }
  for (let day = 1; day <= 30; day++) {
    const cell = document.createElement("span");
    const isToday = day === 25;
    cell.className = "cal-day cal-clickable" + (isToday ? " cal-today" : "");

    const num = document.createElement("span");
    num.className = "cal-num";
    num.textContent = String(day);
    cell.appendChild(num);

    if (isToday) {
      const heart = document.createElement("span");
      heart.className = "cal-heart";
      heart.innerHTML =
        '<svg viewBox="0 0 32 28">' +
        '<path d="M16 26.5C16 26.5 2.5 18.8 2.5 9.8 2.5 5 6.2 2 10.2 2c2.6 0 4.7 1.3 5.8 3.4C17.1 3.3 19.2 2 21.8 2c4 0 7.7 3 7.7 7.8 0 9-13.5 16.7-13.5 16.7z"/>' +
        '</svg>';
      cell.appendChild(heart);
      cell.addEventListener("click", () => openDay25());
    }

    grid.appendChild(cell);
  }
}

function openDay25() {
  const cellRect = document.getElementById("calendarGrid").getBoundingClientRect();
  spawnFireworks(cellRect.left + cellRect.width / 2, cellRect.top, 3);
  spawnConfettiBurst(cellRect.left + cellRect.width / 2, cellRect.top, 60);
  document.getElementById("reminderModal").classList.add("active");
}

document.getElementById("btnCloseReminder").addEventListener("click", () => {
  document.getElementById("reminderModal").classList.remove("active");
});

// ================= Letter: tap the closed letter to open it =================
const letterClosed = document.getElementById("letterClosed");
const letterFoldFx = document.getElementById("letterFoldFx");
const letterOpen = document.getElementById("letterOpen");

letterClosed.addEventListener("click", () => {
  const rect = letterClosed.getBoundingClientRect();
  letterFoldFx.style.left = `${rect.left + rect.width / 2}px`;
  letterFoldFx.style.top = `${rect.top + rect.height / 2}px`;
  letterFoldFx.hidden = false;
  requestAnimationFrame(() => letterFoldFx.classList.add("flying"));

  letterClosed.classList.add("opening");

  setTimeout(() => {
    letterClosed.hidden = true;
    letterFoldFx.hidden = true;
    letterFoldFx.classList.remove("flying");
    letterOpen.hidden = false;
  }, 550);
});

// ================= Scroll reveal for the sections below the hero =================
const revealTargets = document.querySelectorAll(".reveal-on-scroll");
let revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// ================= Music: real <audio> files you provide =================
// Song 1 "Lalala" (The Toys) and Song 2 "討厭紅樓夢" (陶喆) are real,
// copyrighted songs — I can't include the actual audio or lyrics. Drop
// your own legally-obtained MP3s at audio/song1.mp3 and audio/song2.mp3
// (paths are already wired to the <audio> tags in index.html). The third
// slot is intentionally left empty for now.
const SONGS = [
  { name: "Lalala", artist: "The Toys", icon: "🎵", audioId: "audio0" },
  { name: "討厭紅樓夢", artist: "陶喆", icon: "🎶", audioId: "audio1" },
  { name: "昨夜風今宵月", artist: "庄淇珉29", icon: "🎶", audioId: "audio2" },
];

let currentSongIndex = null;
let progressTimer = null;

const playerArt = document.getElementById("playerArt");
const playerName = document.getElementById("playerName");
const playerArtist = document.getElementById("playerArtist");
const playerProgress = document.getElementById("playerProgress");
const playerToggle = document.getElementById("playerToggle");
const songRows = document.querySelectorAll(".song-row");

function getAudioEl(index) {
  const song = SONGS[index];
  return song.audioId ? document.getElementById(song.audioId) : null;
}

function stopAllAudio() {
  SONGS.forEach((song) => {
    if (!song.audioId) return;
    const el = document.getElementById(song.audioId);
    el.pause();
    el.currentTime = 0;
  });
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
  playerToggle.textContent = "▶";
  playerProgress.style.width = "0%";
}

function playSong(index) {
  const song = SONGS[index];
  if (!song.audioId) {
    showToast("No song added here yet — add one in index.html / app.js.");
    return;
  }

  stopAllAudio();
  currentSongIndex = index;
  const audioEl = getAudioEl(index);

  songRows.forEach((row) => row.classList.toggle("active", Number(row.dataset.song) === index));
  playerArt.textContent = song.icon;
  playerName.textContent = song.name;
  playerArtist.textContent = song.artist;

  audioEl.currentTime = 0;
  const playPromise = audioEl.play();
  if (playPromise) {
    playPromise
      .then(() => { playerToggle.textContent = "⏸"; })
      .catch(() => {
        showToast(`Couldn't find the audio file for "${song.name}" — add it at audio/`);
        playerToggle.textContent = "▶";
      });
  }

  progressTimer = setInterval(() => {
    if (!audioEl.duration) return;
    const pct = (audioEl.currentTime / audioEl.duration) * 100;
    playerProgress.style.width = `${pct}%`;
    if (audioEl.ended) {
      clearInterval(progressTimer);
      progressTimer = null;
      playerToggle.textContent = "▶";
    }
  }, 150);
}

songRows.forEach((row) => {
  row.addEventListener("click", () => playSong(Number(row.dataset.song)));
});

playerToggle.addEventListener("click", () => {
  if (currentSongIndex === null) return;
  const audioEl = getAudioEl(currentSongIndex);
  if (!audioEl) return;
  if (audioEl.paused) {
    audioEl.play();
    playerToggle.textContent = "⏸";
  } else {
    audioEl.pause();
    playerToggle.textContent = "▶";
  }
});

// ---------- Small toast helper (used by the music section above) ----------
function showToast(message) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
      "background:#1F3B2C;color:#fff;padding:12px 20px;border-radius:999px;" +
      "font-family:'Quicksand',sans-serif;font-size:0.85rem;font-weight:600;" +
      "z-index:500;opacity:0;transition:opacity .25s ease;pointer-events:none;";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.style.opacity = "0"; }, 2600);
}

// ================= Make a wish (saved to Firestore, with a personal code) =================
const wishForm = document.getElementById("wishForm");
wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const noteEl = document.getElementById("wishNote");
  const input = document.getElementById("wishInput");
  const codeInput = document.getElementById("wishCodeInput");
  const message = input.value.trim();
  const code = codeInput.value.trim();
  noteEl.textContent = "";
  noteEl.className = "form-note";

  if (!message) {
    noteEl.textContent = "Write something first 🙂";
    noteEl.classList.add("error");
    return;
  }
  if (!code) {
    noteEl.textContent = "Pick a code too — you'll need it to open this again later.";
    noteEl.classList.add("error");
    return;
  }
  if (!db) {
    noteEl.textContent = "Not connected to the database right now — but no worries, take your time.";
    noteEl.classList.add("error");
    return;
  }

  const btn = document.getElementById("wishSubmitBtn");
  btn.disabled = true;
  try {
    await db.collection("birthdayWishes").add({
      message,
      code,
      createdTime: firebase.firestore.FieldValue.serverTimestamp(),
      updatedTime: firebase.firestore.FieldValue.serverTimestamp(),
    });
    noteEl.textContent = "Saved 💛 thank you for sharing. Remember your code to open it again!";
    noteEl.classList.add("success");
    input.value = "";
  } catch (err) {
    console.error(err);
    noteEl.textContent = "Couldn't save that just now — but it still means a lot that you wrote it.";
    noteEl.classList.add("error");
  } finally {
    btn.disabled = false;
  }
});

// ================= Floating card + repeat =================
const floatingOverlay = document.getElementById("floatingOverlay");
document.getElementById("btnShowCard").addEventListener("click", () => {
  floatingOverlay.classList.add("active");
});

document.getElementById("btnRepeat").addEventListener("click", () => {
  floatingOverlay.classList.remove("active");

  // reset lock screen
  lockScreen.classList.remove("unlocked");
  lockSub.textContent = "This little surprise is just for you";
  resetLock();

  // reset cake / gift / hero reveal
  cakeBlown = false;
  giftOpened = false;
  cakeEl.classList.remove("hidden-state", "shake");
  cakeEl.querySelectorAll(".candle").forEach((c) => {
    c.classList.remove("blown");
    c.querySelectorAll(".smoke").forEach((s) => s.remove());
  });
  giftEl.classList.remove("showing", "opened", "gone");
  giftEl.hidden = true;
  heroHint.style.opacity = "1";
  heroHint.textContent = "tap the cake to blow out the candles 🎂";
  heroReveal.hidden = true;

  // reset letter back to closed
  letterClosed.hidden = false;
  letterClosed.classList.remove("opening");
  letterOpen.hidden = true;

  // close the day-25 reminder if it was left open
  document.getElementById("reminderModal").classList.remove("active");

  // reset scroll-reveal sections so they animate in again next time
  revealTargets.forEach((el) => {
    el.classList.remove("in-view");
    revealObserver.observe(el);
  });

  // reset music player
  stopAllAudio();
  currentSongIndex = null;
  songRows.forEach((row) => row.classList.remove("active"));
  playerName.textContent = "Song title";
  playerArtist.textContent = "Artist name";
  playerArt.textContent = "🎵";

  // lock scroll again and jump back to the very top
  document.body.classList.add("no-scroll");
  window.scrollTo(0, 0);
});

// ================= Deep-link: jump straight back to the wish-writing home =================
// Used when coming back from my-wishes.html so the person isn't forced to
// redo the passcode + cake/gift sequence every single time.
if (window.location.hash === "#wish") {
  lockScreen.classList.add("unlocked");
  cakeBlown = true;
  giftOpened = true;
  cakeEl.classList.add("hidden-state");
  giftEl.hidden = true;
  heroHint.style.opacity = "0";
  buildCalendar();
  heroReveal.hidden = false;
  document.body.classList.remove("no-scroll");
  setTimeout(() => {
    const target = document.getElementById("stageWish");
    if (target) target.scrollIntoView();
  }, 30);
} else {
  // body starts scroll-locked (lock screen + cake/gift sequence)
  document.body.classList.add("no-scroll");
}
