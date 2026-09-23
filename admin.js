// ============================================================
// Admin dashboard — Birthday Surprise project
// Requires a Firebase Authentication (Email/Password) user
// created manually in the Firebase Console.
// ============================================================

let auth = null;
let db = null;
try {
  firebase.initializeApp(window.firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (err) {
  console.error("Firebase init failed:", err);
}

function createAmbientStars(count = 30) {
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

function formatDate(ts) {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatTime(ts) {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === id));
}

if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      document.getElementById("signedInAs").textContent = `Signed in as: ${user.email}`;
      showView("viewDashboard");
      loadAllWishes();
    } else {
      showView("viewLogin");
    }
  });
} else {
  document.getElementById("loginError").textContent = "Firebase not connected — check firebase-config.js and reload.";
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";
  if (!auth) {
    errorEl.textContent = "Firebase not connected.";
    return;
  }
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Login failed — check your admin email/password.";
  }
});

document.getElementById("btnLogout").addEventListener("click", () => auth?.signOut());

let allWishes = [];

async function loadAllWishes() {
  const listEl = document.getElementById("adminWishList");
  listEl.innerHTML = '<p class="empty-note">Loading...</p>';
  try {
    const snap = await db.collection("birthdayWishes").get();
    allWishes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    allWishes.sort((a, b) => (b.createdTime?.toMillis?.() || 0) - (a.createdTime?.toMillis?.() || 0));
    document.getElementById("wishCount").textContent = `Total wishes: ${allWishes.length}`;
    renderList();
  } catch (err) {
    console.error(err);
    listEl.innerHTML = '<p class="empty-note">Couldn\'t load data — check Firestore rules / connection.</p>';
  }
}

function renderList() {
  const listEl = document.getElementById("adminWishList");
  if (allWishes.length === 0) {
    listEl.innerHTML = '<p class="empty-note">No wishes yet.</p>';
    return;
  }
  listEl.innerHTML = "";
  allWishes.forEach((w) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "wish-item";
    el.innerHTML = `
      <span class="wish-item-title">${formatDate(w.createdTime)} • ${formatTime(w.createdTime)}</span>
      <span class="wish-item-preview">${escapeHtml((w.message || "").slice(0, 70))}</span>
    `;
    el.addEventListener("click", () => openDetail(w.id));
    listEl.appendChild(el);
  });
}

const detailModal = document.getElementById("detailModal");
let activeId = null;

function openDetail(id) {
  const w = allWishes.find((x) => x.id === id);
  if (!w) return;
  activeId = id;
  document.getElementById("detailMeta").textContent =
    `${formatDate(w.createdTime)} • ${formatTime(w.createdTime)}`;
  document.getElementById("detailCode").textContent = `Code: ${w.code || "-"}`;
  document.getElementById("detailContent").textContent = w.message;
  detailModal.classList.add("active");
}

document.getElementById("btnCloseDetail").addEventListener("click", () => {
  detailModal.classList.remove("active");
});

document.getElementById("btnAdminDelete").addEventListener("click", async () => {
  if (!activeId) return;
  if (!confirm("Delete this wish? This can't be undone.")) return;
  try {
    await db.collection("birthdayWishes").doc(activeId).delete();
    detailModal.classList.remove("active");
    loadAllWishes();
  } catch (err) {
    console.error(err);
  }
});
