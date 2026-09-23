// ============================================================
// My Wishes — view / edit / delete your own saved wishes by code.
// Classic script (no import/export) so this works via file:// too.
// ============================================================

let db = null;
try {
  firebase.initializeApp(window.firebaseConfig);
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
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
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
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function ensureDb(errorEl) {
  if (db) return true;
  const msg = "Not connected to the database right now. Check your connection and reload.";
  if (errorEl) errorEl.textContent = msg;
  return false;
}

// ---------- Code entry -> list ----------
let currentCode = null;
let currentWishes = [];

const codeForm = document.getElementById("codeForm");
codeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = document.getElementById("codeInput").value.trim();
  const errorEl = document.getElementById("codeError");
  errorEl.textContent = "";
  errorEl.className = "form-note";

  if (!code) {
    errorEl.textContent = "Enter your code first.";
    errorEl.classList.add("error");
    return;
  }
  if (!ensureDb(errorEl)) return;

  try {
    const snap = await db.collection("birthdayWishes").where("code", "==", code).get();
    if (snap.empty) {
      errorEl.textContent = "No wishes found with that code.";
      errorEl.classList.add("error");
      return;
    }
    currentCode = code;
    currentWishes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    currentWishes.sort((a, b) => (b.createdTime?.toMillis?.() || 0) - (a.createdTime?.toMillis?.() || 0));
    renderList();
    showView("viewList");
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Something went wrong looking that up. Try again.";
    errorEl.classList.add("error");
  }
});

document.getElementById("btnBackToCode").addEventListener("click", () => {
  document.getElementById("codeInput").value = "";
  document.getElementById("codeError").textContent = "";
  showView("viewCode");
});

function renderList() {
  const listEl = document.getElementById("wishList");
  if (currentWishes.length === 0) {
    listEl.innerHTML = '<p class="empty-note">No wishes yet.</p>';
    return;
  }
  listEl.innerHTML = "";
  currentWishes.forEach((w) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "wish-item";
    el.innerHTML = `
      <span class="wish-item-title">${formatDate(w.createdTime)} • ${formatTime(w.createdTime)}</span>
      <span class="wish-item-preview">${escapeHtml((w.message || "").slice(0, 60))}</span>
    `;
    el.addEventListener("click", () => openRead(w.id));
    listEl.appendChild(el);
  });
}

// ---------- Read (opened letter) ----------
let currentWishId = null;

function openRead(id) {
  const w = currentWishes.find((x) => x.id === id);
  if (!w) return;
  currentWishId = id;

  const updated = w.updatedTime && w.updatedTime.toMillis?.() !== w.createdTime?.toMillis?.();
  document.getElementById("readMeta").textContent = updated
    ? `Written ${formatDate(w.createdTime)} • Last edited ${formatDate(w.updatedTime)}`
    : `Written ${formatDate(w.createdTime)} at ${formatTime(w.createdTime)}`;
  document.getElementById("readContent").textContent = w.message;

  showView("viewRead");
}

document.getElementById("btnBackToList").addEventListener("click", () => showView("viewList"));

// ---------- Edit ----------
document.getElementById("btnGoEdit").addEventListener("click", () => {
  const w = currentWishes.find((x) => x.id === currentWishId);
  if (!w) return;
  document.getElementById("editContent").value = w.message;
  document.getElementById("editError").textContent = "";
  showView("viewEdit");
});

document.getElementById("btnCancelEdit").addEventListener("click", () => showView("viewRead"));

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = document.getElementById("editContent").value.trim();
  const errorEl = document.getElementById("editError");
  errorEl.textContent = "";
  errorEl.className = "form-note";

  if (!content) {
    errorEl.textContent = "This can't be empty.";
    errorEl.classList.add("error");
    return;
  }
  if (!ensureDb(errorEl)) return;

  try {
    await db.collection("birthdayWishes").doc(currentWishId).update({
      message: content,
      updatedTime: firebase.firestore.FieldValue.serverTimestamp(),
    });
    const snap = await db.collection("birthdayWishes").doc(currentWishId).get();
    const idx = currentWishes.findIndex((x) => x.id === currentWishId);
    currentWishes[idx] = { id: currentWishId, ...snap.data() };
    openRead(currentWishId);
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Couldn't save that just now. Try again.";
    errorEl.classList.add("error");
  }
});

// ---------- Delete ----------
const deleteModal = document.getElementById("deleteModal");
document.getElementById("btnGoDelete").addEventListener("click", () => {
  deleteModal.classList.add("active");
});
document.getElementById("btnCancelDelete").addEventListener("click", () => {
  deleteModal.classList.remove("active");
});
document.getElementById("btnConfirmDelete").addEventListener("click", async () => {
  if (!ensureDb()) return;
  try {
    await db.collection("birthdayWishes").doc(currentWishId).delete();
    currentWishes = currentWishes.filter((x) => x.id !== currentWishId);
    deleteModal.classList.remove("active");
    renderList();
    showView("viewList");
  } catch (err) {
    console.error(err);
    deleteModal.classList.remove("active");
  }
});
