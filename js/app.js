/* 華語 B2 Flashcard — main app (vanilla JS, classic script) */
(function () {
  "use strict";
  var W = window, D = document;
  var VERSION = "1.2.0";
  var KEY = "mb2.v1";

  /* =========================================================
   * 1. Helpers
   * ========================================================= */
  function $(s, el) { return (el || D).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || D).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function hasCJK(s) { return /[㐀-鿿]/.test(s || ""); }
  function plain(s) { return String(s || "").replace(/[^㐀-鿿A-Za-z0-9]/g, ""); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function today() { return SRS.today(); }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function tcolor(zh, py) { return S.settings.toneColors ? Pinyin.colorize(zh, py) : esc(zh); }
  function playBtn(text, cls) {
    return '<button type="button" class="icon-btn ' + (cls || "") + '" data-act="speak" data-t="' + esc(text) + '" aria-label="Putar audio">' + I("vol") + '</button>';
  }
  function head(title, sub, right) {
    return '<header class="screen-head"><div><h1>' + title + "</h1>" + (sub ? '<div class="sub">' + sub + "</div>" : "") + "</div>" +
      (right === undefined ? '<a class="icon-btn head-nav" href="#/settings" aria-label="Pengaturan">' + ICON_GEAR + "</a>" : right) + "</header>";
  }
  // ikon SVG yang sama dengan navigasi (bukan emoji) supaya konsisten di semua platform
  var ICON_GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg>';
  var ICON_HOME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10"/></svg>';

  /* ikon garis (pengganti emoji) — satu gaya untuk semua platform */
  var ICONS = {
    vol: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    volx: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/>',
    play: '<path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
    down: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    up: '<path d="M12 20V9M7 13.5l5-5 5 5M5 4h14"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    spark: '<path d="M12 3.5 13.8 9l5.7 1.9-5.7 1.9L12 18.5l-1.8-5.7-5.7-1.9L10.2 9z"/><path d="M19 3v3.5M17.25 4.75h3.5"/>',
    head: '<path d="M4 18v-5a8 8 0 0 1 16 0v5"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/>',
    users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.4A6 6 0 0 1 21 20"/>',
    repeat: '<path d="M17 3l3 3-3 3"/><path d="M4 11.5V10a4 4 0 0 1 4-4h12"/><path d="M7 21l-3-3 3-3"/><path d="M20 12.5V14a4 4 0 0 1-4 4H4"/>',
    bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    flame: '<path d="M12 3c.6 3.2 4.5 5.2 4.5 10a4.5 4.5 0 0 1-9 0c0-1.9.8-3.2 1.8-4.2.3 1.3.9 2.2 1.9 2.7C11 8.6 10.6 5.8 12 3z"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    share: '<path d="M12 15V3.5M8 7.5l4-4 4 4"/><path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16"/>'
  };
  function I(name, cls) { return '<svg class="i' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>"; }
  // tanda hanzi per dek (視/銷/攝/…) menggantikan emoji — sekaligus jadi materi hafalan
  function deckMark(d, size) { return '<span class="deck-mark' + (size ? " " + size : "") + '" aria-hidden="true">' + esc(d.mark || (d.zh || "?").charAt(0)) + "</span>"; }
  // perayaan berupa ungkapan Mandarin + pinyin + arti (bukan emoji)
  function cheer(zh, py, idm) { return '<div class="cheer"><div class="cheer-zh">' + zh + '</div><div class="cheer-py">' + py + " · " + idm + "</div></div>"; }
  function okTag(t) { return '<span class="fb-tag good">' + I("check") + " " + t + "</span>"; }
  function noTag(t) { return '<span class="fb-tag bad">' + I("x") + " " + t + "</span>"; }
  function playAllLabel() { return I("play", "fill") + " Putar semua"; }
  function view(html) { $("#view").innerHTML = html; }

  /* toast + modal */
  function toast(msg) {
    var root = $("#toast-root");
    var el = D.createElement("div");
    el.className = "toast"; el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3200);
  }
  var modalOnClose = null;
  function openModal(html, opts) {
    opts = opts || {};
    closeModal();
    var root = $("#modal-root");
    root.innerHTML = '<div class="overlay ' + (opts.sheet ? "bottom" : "") + '" data-act="modal-bg"><div class="sheet" role="dialog" aria-modal="true">' + html + "</div></div>";
    modalOnClose = opts.onClose || null;
    var f = $("#modal-root [autofocus], #modal-root .btn.primary");
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} }
  }
  function closeModal() {
    var root = $("#modal-root");
    if (root && root.firstChild) {
      root.innerHTML = "";
      if (modalOnClose) { var f = modalOnClose; modalOnClose = null; f(); }
    }
  }
  var confirmCb = null;
  function confirmModal(msg, okLabel, cb, danger) {
    confirmCb = cb;
    openModal("<h2>Konfirmasi</h2><p>" + esc(msg) + '</p><div class="actions"><button type="button" class="btn" data-act="modal-close">Batal</button>' +
      '<button type="button" class="btn ' + (danger ? "danger" : "primary") + '" data-act="confirm-ok">' + esc(okLabel || "Ya") + "</button></div>");
  }
  function copyText(t) {
    function fallback() {
      var ta = D.createElement("textarea");
      ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;font-size:16px";
      D.body.appendChild(ta); ta.focus(); ta.select();
      try { ta.setSelectionRange(0, t.length); } catch (e) {}
      var ok = false;
      try { ok = D.execCommand("copy"); } catch (e) {}
      D.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText && W.isSecureContext) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
  }

  /* =========================================================
   * 2. State (localStorage with in-memory fallback)
   * ========================================================= */
  function defaults() {
    return {
      v: 1, srs: {},
      settings: { showPinyin: true, showEnglish: true, toneColors: true, rate: 0.85, newPerDay: 15, theme: "auto", dir: "zh2id" },
      daily: {}, streak: { count: 0, last: "" }, custom: [], grammar: {}, dialogues: {}, hints: {}
    };
  }
  function normalizeState(o) {
    var d = defaults();
    if (!o || typeof o !== "object") return d;
    var k;
    for (k in (o.settings || {})) d.settings[k] = o.settings[k];
    d.srs = o.srs && typeof o.srs === "object" ? o.srs : {};
    d.daily = o.daily && typeof o.daily === "object" ? o.daily : {};
    d.streak = o.streak && typeof o.streak === "object" ? { count: +o.streak.count || 0, last: o.streak.last || "" } : d.streak;
    d.custom = arr(o.custom);
    d.grammar = o.grammar && typeof o.grammar === "object" ? o.grammar : {};
    d.dialogues = o.dialogues && typeof o.dialogues === "object" ? o.dialogues : {};
    d.hints = o.hints && typeof o.hints === "object" ? o.hints : {};
    return d;
  }
  function loadState() {
    try { var r = W.localStorage.getItem(KEY); if (r) return normalizeState(JSON.parse(r)); } catch (e) {}
    return defaults();
  }
  var S = loadState();
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function day(date) {
    date = date || today();
    var d = S.daily[date];
    if (!d) d = S.daily[date] = { reviewed: 0, newSeen: 0, phraseRated: 0, sessionDone: { cards: false, dialogue: false, phrases: false } };
    if (!d.sessionDone) d.sessionDone = { cards: false, dialogue: false, phrases: false };
    return d;
  }
  function pruneDaily() {
    var keys = Object.keys(S.daily).sort();
    while (keys.length > 60) delete S.daily[keys.shift()];
  }
  function applyTheme() {
    var t = S.settings.theme, root = D.documentElement;
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    D.body.classList.toggle("no-tone", !S.settings.toneColors);
  }

  /* =========================================================
   * 3. Normalised cards
   * ========================================================= */
  var CARDS = [], CARD = {}, DECKS = [];
  function buildDecks() {
    DECKS = arr(W.DECKS).slice();
    if (!DECKS.length) {
      DECKS = [{ id: "phrases", kind: "phrase", icon: "💬", mark: "話", zh: "會話句型", name: "Kalimat Percakapan" }, { id: "claude", kind: "custom", icon: "🤖", mark: "我", zh: "我的卡片", name: "Dari Claude" }];
    }
  }
  function rebuildCards() {
    buildDecks();
    CARDS = []; CARD = {};
    function add(c) { if (c.key && !CARD[c.key] && c.zh) { CARD[c.key] = c; CARDS.push(c); } }
    arr(W.VOCAB).forEach(function (v) {
      if (!v) return;
      add({ key: "v:" + v.id, deck: v.deck, kind: "vocab", zh: v.hanzi, py: v.pinyin, id_meaning: v.id_meaning, en: v.en, pos: v.pos, level: v.level,
        breakdown: v.breakdown, mnemonic: v.mnemonic, example: v.example });
    });
    arr(W.PHRASES).forEach(function (p) {
      if (!p) return;
      add({ key: "p:" + p.id, deck: "phrases", kind: "phrase", zh: p.zh, py: p.py, id_meaning: p.id_meaning, en: p.en, register: p.register, note: p.note, group: p.group });
    });
    arr(S.custom).forEach(function (c) {
      if (!c) return;
      add({ key: "c:" + c.id, deck: "claude", kind: "custom", zh: c.zh, py: c.py, id_meaning: c.id_meaning });
    });
  }
  function deckById(id) { for (var i = 0; i < DECKS.length; i++) if (DECKS[i].id === id) return DECKS[i]; return null; }
  function cardsOf(deckIds) {
    if (!deckIds || !deckIds.length) return CARDS;
    return CARDS.filter(function (c) { return deckIds.indexOf(c.deck) >= 0; });
  }
  function findByZh(zh) {
    for (var i = 0; i < CARDS.length; i++) if (CARDS[i].zh === zh) return CARDS[i];
    return null;
  }

  /* =========================================================
   * 4. Router + event delegation
   * ========================================================= */
  var ACT = {}, CHG = {}, SCREENS = {}, CUR = { name: "", args: [] }, cleanups = [];
  var CS = { tapped: false };
  function onLeave(fn) { cleanups.push(fn); }
  function runCleanups() {
    var c = cleanups; cleanups = [];
    c.forEach(function (f) { try { f(); } catch (e) {} });
    TTS.stop();
  }
  function parseHash() {
    var h = (location.hash || "").replace(/^#\/?/, "");
    var parts = h.split("/").map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    return { name: parts[0] || "home", args: parts.slice(1) };
  }
  function route() {
    runCleanups();
    var r = parseHash();
    if (!SCREENS[r.name]) { r = { name: "home", args: [] }; }
    CUR = r;
    $$("#nav a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-nav") === r.name); });
    try { SCREENS[r.name](r.args); }
    catch (e) {
      view('<div class="panel"><h2>Terjadi kesalahan</h2><p class="muted">' + esc(e && e.message) + '</p><a class="btn" href="#/home">Ke beranda</a></div>');
      if (W.console) console.error(e);
    }
    W.scrollTo(0, 0);
  }
  function rerender() {
    var y = W.pageYOffset;
    try { SCREENS[CUR.name](CUR.args); } catch (e) { if (W.console) console.error(e); }
    W.scrollTo(0, y);
  }
  function go(h) { if (location.hash === h) route(); else location.hash = h; }

  D.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!el) return;
    var name = el.getAttribute("data-act");
    if (name === "modal-bg") { if (e.target !== el) return; closeModal(); return; }
    CS.tapped = true;
    if (ACT[name]) ACT[name](el, e);
  });
  D.addEventListener("change", function (e) {
    var el = e.target.closest ? e.target.closest("[data-chg]") : null;
    if (el && CHG[el.getAttribute("data-chg")]) CHG[el.getAttribute("data-chg")](el, e);
  });
  D.addEventListener("input", function (e) {
    var el = e.target.closest ? e.target.closest("[data-inp]") : null;
    if (el && CHG[el.getAttribute("data-inp")]) CHG[el.getAttribute("data-inp")](el, e);
  });
  D.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (CUR.name === "cards" && !$("#modal-root").firstChild) cardsKey(e);
  });
  ACT["modal-close"] = function () { closeModal(); };
  ACT["confirm-ok"] = function () { var cb = confirmCb; confirmCb = null; closeModal(); if (cb) cb(); };
  ACT.speak = function (el) { TTS.speak(el.getAttribute("data-t"), { rate: +el.getAttribute("data-r") || S.settings.rate }); };
  ACT.nav = function (el) { go(el.getAttribute("data-h")); };
  ACT.copy = function (el) {
    var t = el.getAttribute("data-t") || (($(el.getAttribute("data-from")) || {}).value) || "";
    copyText(t).then(function (ok) { toast(ok ? "Disalin" : "Gagal menyalin — salin manual"); });
  };

  /* =========================================================
   * 5. Progress helpers + Home screen
   * ========================================================= */
  function stOf(key) { return S.srs[key] || null; }
  function isLearned(st) { return !!st && (st.reps >= 1 || st.interval > 0); }
  function dueList(cards) {
    var t = today();
    return cards.filter(function (c) { var st = S.srs[c.key]; return st && st.due && st.due <= t; })
      .sort(function (a, b) { return S.srs[a.key].due < S.srs[b.key].due ? -1 : S.srs[a.key].due > S.srs[b.key].due ? 1 : 0; });
  }
  function newList(cards) { return cards.filter(function (c) { return !S.srs[c.key]; }); }
  function newRemaining(extra) { return Math.max(0, (S.settings.newPerDay || 15) + (extra || 0) - day().newSeen); }
  function streakNow() {
    var l = S.streak.last;
    if (!l) return 0;
    if (l === today() || l === SRS.addDays(today(), -1)) return S.streak.count;
    return 0;
  }
  function bumpStreak() {
    var t = today();
    if (S.streak.last === t) return;
    S.streak.count = S.streak.last === SRS.addDays(t, -1) ? S.streak.count + 1 : 1;
    S.streak.last = t;
  }
  function suggestDialogue() {
    var ds = arr(W.DIALOGUES);
    for (var i = 0; i < ds.length; i++) if (!(S.dialogues[ds[i].id] && S.dialogues[ds[i].id].done)) return ds[i];
    return ds[0] || null;
  }
  var dismissedInstall = false, deferredPrompt = null;
  function isStandalone() {
    return navigator.standalone === true || (W.matchMedia && W.matchMedia("(display-mode: standalone)").matches);
  }
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }
  W.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferredPrompt = e;
    if (CUR.name === "home") rerender();
  });
  W.addEventListener("appinstalled", function () { deferredPrompt = null; if (CUR.name === "home") rerender(); });

  function ttsHelpHtml() {
    // ringkas: satu baris, instruksi hanya untuk platform yang sedang dipakai
    var how = isIOS() ? "Settings → Accessibility → Spoken Content → Voices → Chinese (Taiwan) → unduh Meijia."
      : "Settings → Time &amp; language → Language &amp; region → tambah 中文(台灣) lalu pasang paket Speech.";
    return '<details class="panel tip warn"><summary><b>' + I("volx") + " " + (TTS.status() === "none" ? "Suara Mandarin belum terpasang" : "Suara Mandarin Taiwan belum terpasang") +
      '</b> <span class="small muted">· cara pasang</span></summary><p class="small mt">' + how + "</p></details>";
  }
  TTS.onChange(function () { if (CUR.name === "home" || CUR.name === "settings") rerender(); });

  SCREENS.home = function () {
    var t = today(), dy = day();
    var dueN = dueList(CARDS).length;
    var newN = Math.min(newRemaining(), newList(CARDS).length);
    var learned = CARDS.filter(function (c) { return isLearned(S.srs[c.key]); }).length;
    var dateStr = "";
    try { dateStr = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }); } catch (e) { dateStr = t; }
    var dl = suggestDialogue();
    var sd = dy.sessionDone;
    var h = head("華語 B2", esc(dateStr) + " &nbsp;·&nbsp; " + I("flame", "flame") + " " + streakNow() + " hari",
      '<div class="head-actions"><a class="icon-btn head-nav" href="#/share" aria-label="Bagikan app">' + I("share") + '</a><a class="icon-btn head-nav" href="#/settings" aria-label="Pengaturan">' + ICON_GEAR + "</a></div>");
    h += '<div class="stack">';

    function step(n, done, label, sub, act, extra) {
      return '<li><button type="button" class="step ' + (done ? "done" : "") + '" data-act="' + act + '"' + (extra || "") + '><span class="num">' + (done ? "✓" : n) + '</span><span class="grow"><span class="st">' + label +
        '</span><br><span class="muted small">' + sub + '</span></span><span aria-hidden="true">›</span></button></li>';
    }
    // satu tombol utama yang selalu menunjuk langkah berikutnya
    var cta;
    if (!sd.cards && dueN + newN > 0) cta = '<button type="button" class="btn primary block lg" data-act="home-cards">Mulai: review ' + (dueN + newN) + " kartu</button>";
    else if (!sd.dialogue && dl) cta = '<button type="button" class="btn primary block lg" data-act="home-talk" data-id="' + esc(dl.id) + '">Lanjut: roleplay ' + esc(dl.title_zh) + "</button>";
    else if (!sd.phrases) cta = '<button type="button" class="btn primary block lg" data-act="home-phr">Lanjut: 5 kalimat percakapan</button>';
    else cta = '<a class="btn soft block lg" href="#/quiz">Sesi hari ini selesai ✓ · Latihan tambahan: kuis</a>';
    h += '<section class="panel today"><h2>Sesi hari ini <span class="muted small">±15 menit</span></h2>' + cta + '<ol class="steps mt">' +
      step(1, sd.cards, "Review kartu", dueN + " jatuh tempo + " + newN + " baru", "home-cards") +
      step(2, sd.dialogue, "Roleplay 1 skenario", dl ? esc(dl.title_zh + " · " + dl.title_id) : "Belum ada skenario", "home-talk", dl ? ' data-id="' + esc(dl.id) + '"' : "") +
      step(3, sd.phrases, "5 kalimat percakapan", Math.min(5, dy.phraseRated || 0) + " / 5 hari ini", "home-phr") +
      '</ol><p class="stat-line small muted"><b>' + dueN + "</b> jatuh tempo · <b>" + newN + "</b> kartu baru · <b>" + learned + "</b> sudah dipelajari</p></section>";

    /* per deck progress */
    h += '<section class="panel"><h2>Progres per dek</h2>';
    DECKS.forEach(function (d) {
      var cs = CARDS.filter(function (c) { return c.deck === d.id; });
      var l = cs.filter(function (c) { return isLearned(S.srs[c.key]); }).length;
      var m = cs.filter(function (c) { var st = S.srs[c.key]; return st && st.interval >= 21; }).length;
      var inner = deckMark(d, "lg") + '<div class="grow"><div class="row between"><span><b>' + esc(d.name) +
        '</b> <span class="zh muted small">' + esc(d.zh) + '</span></span><span class="small muted">' + (cs.length ? l + " / " + cs.length + (m ? " · " + m + " dikuasai" : "") : "belum ada kartu") + '</span></div>' +
        '<div class="bar"><i style="width:' + pct(l, cs.length) + '%"></i></div></div>';
      // baris dek = pintasan langsung ke latihan dek itu
      h += cs.length ? '<button type="button" class="deck-row tap" data-act="home-deck" data-d="' + esc(d.id) + '" aria-label="Latih dek ' + esc(d.name) + '">' + inner + '<span class="chev" aria-hidden="true">›</span></button>'
        : '<div class="deck-row">' + inner + "</div>";
    });
    h += "</section>";

    if (isIOS() && !isStandalone() && !dismissedInstall && !S.hints.install) {
      h += '<section class="panel tip"><div class="row between"><b>' + I("phone") + ' Pasang di Home Screen</b><button class="btn sm" data-act="hint-install-x">Tutup</button></div>' +
        '<p class="small mb" style="margin-top:6px">Buka lewat Safari, tap Share ' + I("share") + ' → <b>Add to Home Screen</b>. Setelah itu app bisa dipakai offline layaknya aplikasi biasa.</p></section>';
    } else if (deferredPrompt) {
      h += '<section class="panel tip row between"><span><b>' + I("phone") + ' Pasang aplikasi</b><br><span class="small">Pakai offline dari desktop / layar utama.</span></span><button class="btn primary" data-act="install">Install app</button></section>';
    }
    if (TTS.status() !== "tw") h += ttsHelpHtml();
    h += "</div>";
    view(h);
  };
  // jarang dipakai → tinggal di Pengaturan, bukan di Beranda
  function transferHtml() {
    return '<section class="panel"><h2>Pindah progres antar-perangkat</h2>' +
      '<p class="small muted">Progres tersimpan di perangkat ini saja. Salin kode (atau unduh file) lalu impor di perangkat lain.</p>' +
      '<div class="row wrap"><button class="btn soft" data-act="xfer-copy">' + I("copy") + ' Salin kode progres</button><button class="btn" data-act="xfer-download">' + I("down") + ' Unduh file .json</button></div>' +
      '<textarea id="code-out" class="mono mt" readonly hidden aria-label="Kode progres"></textarea>' +
      '<label class="small muted mt" style="display:block" for="code-in">Tempel kode dari perangkat lain</label>' +
      '<textarea id="code-in" class="mono" placeholder="MB2G:… atau MB2P:…"></textarea>' +
      '<div class="row wrap mt"><button class="btn primary" data-act="xfer-import">Impor</button>' +
      '<label class="btn" style="cursor:pointer">' + I("up") + ' Unggah file<input type="file" accept=".json,application/json,text/plain" data-chg="xfer-file" hidden></label></div></section>';
  }
  ACT["home-cards"] = function () { CS.decks = []; CS.fresh = true; go("#/cards"); };
  ACT["home-talk"] = function (el) { var id = el.getAttribute("data-id"); go(id ? "#/talk/" + encodeURIComponent(id) : "#/talk"); };
  ACT["home-deck"] = function (el) {
    var id = el.getAttribute("data-d"), dk = deckById(id);
    CS.decks = [id]; CS.dir = dk && dk.kind === "phrase" ? "id2zh" : (S.settings.dir || "zh2id"); CS.fresh = true; go("#/cards");
  };
  ACT["home-phr"] = function () { CS.decks = ["phrases"]; CS.dir = "id2zh"; CS.fresh = true; go("#/cards"); };
  ACT["hint-install-x"] = function () { dismissedInstall = true; S.hints.install = true; save(); rerender(); };
  ACT.install = function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () { deferredPrompt = null; if (CUR.name === "home") rerender(); }, function () {});
  };

  /* ---- progress transfer ---- */
  function bytesToB64(u8) {
    var s = "", n = 0x8000;
    for (var i = 0; i < u8.length; i += n) s += String.fromCharCode.apply(null, u8.subarray(i, i + n));
    return btoa(s);
  }
  function b64ToBytes(b) {
    var s = atob(b.replace(/\s+/g, "")), u = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  }
  function encodeProgress() {
    var bytes = new TextEncoder().encode(JSON.stringify(S));
    if (W.CompressionStream && W.Response && W.Blob) {
      try {
        var stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
        return new Response(stream).arrayBuffer().then(function (buf) { return "MB2G:" + bytesToB64(new Uint8Array(buf)); },
          function () { return "MB2P:" + bytesToB64(bytes); });
      } catch (e) {}
    }
    return Promise.resolve("MB2P:" + bytesToB64(bytes));
  }
  function decodeProgress(code) {
    code = String(code || "").trim();
    try {
      if (code.charAt(0) === "{") return Promise.resolve(JSON.parse(code));
      if (code.indexOf("MB2P:") === 0) return Promise.resolve(JSON.parse(new TextDecoder().decode(b64ToBytes(code.slice(5)))));
      if (code.indexOf("MB2G:") === 0) {
        if (!W.DecompressionStream) return Promise.reject(new Error("Browser ini tidak bisa membuka kode terkompresi (MB2G). Pakai file .json."));
        var stream = new Blob([b64ToBytes(code.slice(5))]).stream().pipeThrough(new DecompressionStream("gzip"));
        return new Response(stream).text().then(function (t) { return JSON.parse(t); });
      }
    } catch (e) { return Promise.reject(e); }
    return Promise.reject(new Error("Format kode tidak dikenali."));
  }
  function validProgress(o) { return !!o && typeof o === "object" && o.v === 1 && o.srs && typeof o.srs === "object" && o.settings && typeof o.settings === "object"; }
  function importProgress(code) {
    decodeProgress(code).then(function (o) {
      if (!validProgress(o)) throw new Error("Data progres tidak valid.");
      confirmModal("Ganti progres di perangkat ini?", "Ganti", function () {
        S = normalizeState(o); save(); applyTheme(); rebuildCards(); CS.fresh = true;
        toast("Progres berhasil diimpor"); rerender();
      }, true);
    }).catch(function (e) { toast("Gagal impor: " + (e && e.message ? e.message : "kode rusak")); });
  }
  ACT["xfer-copy"] = function () {
    encodeProgress().then(function (code) {
      var ta = $("#code-out");
      if (ta) { ta.hidden = false; ta.value = code; ta.focus(); ta.select(); }
      return copyText(code);
    }).then(function (ok) { toast(ok ? "Kode progres disalin" : "Salin kode dari kotak di bawah"); });
  };
  ACT["xfer-import"] = function () {
    var v = ($("#code-in") || {}).value || "";
    if (!v.trim()) { toast("Tempel kode dulu"); return; }
    importProgress(v);
  };
  ACT["xfer-download"] = function () {
    try {
      var blob = new Blob([JSON.stringify(S)], { type: "application/json" });
      var url = URL.createObjectURL(blob), a = D.createElement("a");
      a.href = url; a.download = "mb2-progres-" + today() + ".json";
      D.body.appendChild(a); a.click(); D.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    } catch (e) { toast("Gagal membuat file"); }
  };
  CHG["xfer-file"] = function (el) {
    var f = el.files && el.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () { importProgress(String(r.result || "")); };
    r.onerror = function () { toast("Gagal membaca file"); };
    r.readAsText(f);
    el.value = "";
  };

  /* =========================================================
   * 6. Cards screen (flashcards, swipe, SRS)
   * ========================================================= */
  CS.decks = []; CS.dir = null; CS.queue = null; CS.done = 0; CS.total = 0; CS.flipped = false; CS.extra = 0; CS.fresh = true;

  function buildQueue() {
    var cs = cardsOf(CS.decks);
    var due = dueList(cs);
    var nw = newList(cs).slice(0, newRemaining(CS.extra));
    CS.queue = due.concat(nw).map(function (c) { return c.key; });
    CS.done = 0; CS.total = CS.queue.length; CS.flipped = false;
  }

  SCREENS.cards = function () {
    if (!CS.dir) CS.dir = S.settings.dir || "zh2id";
    if (CS.fresh || !CS.queue) { buildQueue(); CS.fresh = false; }
    var h = head("Kartu", "", undefined);
    var allOn = !CS.decks.length;
    var chips = '<button type="button" class="chip ' + (allOn ? "on" : "") + '" data-act="deck-chip" data-d="all">Semua</button>';
    DECKS.forEach(function (d) {
      var n = CARDS.filter(function (c) { return c.deck === d.id; }).length;
      if (!n) return;
      chips += '<button type="button" class="chip ' + (CS.decks.indexOf(d.id) >= 0 ? "on" : "") + '" data-act="deck-chip" data-d="' + esc(d.id) + '">' + deckMark(d) + esc(d.name) + "</button>";
    });
    h += '<div class="chips mb scroll-x" role="group" aria-label="Pilih dek">' + chips + "</div>";
    h += '<div class="seg" role="group" aria-label="Arah kartu" style="max-width:560px;margin:0 auto">' +
      [["zh2id", "中文→Arti"], ["id2zh", "Arti→中文"], ["listen", I("vol") + "→Arti"]].map(function (x) {
        return '<button type="button" class="' + (CS.dir === x[0] ? "on" : "") + '" data-act="dir" data-v="' + x[0] + '">' + x[1] + "</button>";
      }).join("") + "</div>";
    h += '<div id="cardarea"></div>';
    view(h);
    drawCard();
  };
  ACT["deck-chip"] = function (el) {
    var d = el.getAttribute("data-d");
    if (d === "all") CS.decks = [];
    else {
      var i = CS.decks.indexOf(d);
      if (i >= 0) CS.decks.splice(i, 1); else CS.decks.push(d);
    }
    if (CS.decks.length === 1 && CS.decks[0] === "phrases") { CS.dir = "id2zh"; S.settings.dir = "id2zh"; }
    CS.fresh = true; rerender();
  };
  ACT.dir = function (el) {
    CS.dir = el.getAttribute("data-v"); S.settings.dir = CS.dir; save();
    $$(".seg button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-v") === CS.dir); });
    drawCard();
  };

  function curCard() { return CS.queue && CS.queue.length ? CARD[CS.queue[0]] : null; }

  function cardFront(c) {
    var db = deckById(c.deck);
    var badge = '<span class="badge deck-badge">' + (db ? deckMark(db) + esc(db.name) : "") + "</span>";
    var long = Array.from(c.zh).length > 6 ? " long" : "";
    if (CS.dir === "listen") {
      return '<div class="face front" aria-label="Sisi depan">' + badge +
        '<button type="button" class="listen-btn" data-act="speak" data-t="' + esc(c.zh) + '" aria-label="Putar audio">' + I("vol") + '</button>' +
        '<div class="hint">Dengarkan, lalu ingat artinya</div></div>';
    }
    if (CS.dir === "id2zh") {
      return '<div class="face front">' + badge + '<div class="front-mean">' + esc(c.id_meaning || c.en || "") + "</div>" +
        (S.settings.showEnglish && c.en ? '<div class="muted">' + esc(c.en) + "</div>" : "") +
        '<div class="hint">Ucapkan dalam bahasa Mandarin</div></div>';
    }
    return '<div class="face front">' + badge + '<div class="big-hanzi' + long + '">' + tcolor(c.zh, c.py) + "</div>" +
      (S.settings.showPinyin && c.py ? '<div class="muted">' + esc(c.py) + "</div>" : "") +
      playBtn(c.zh, "ghost") + "</div>";
  }
  function cardBack(c) {
    var long = Array.from(c.zh).length > 6 ? " long" : "";
    var h = '<div class="face back"><div class="hz' + long + '">' + tcolor(c.zh, c.py) + '</div>';
    h += '<div class="py">' + esc(c.py || "") + "</div>";
    h += '<div class="center">' + playBtn(c.zh) + "</div>";
    var b = "";
    if (c.pos) b += '<span class="badge">' + esc(c.pos) + "</span>";
    if (c.level) b += '<span class="badge brand">' + esc(c.level) + "</span>";
    if (c.register) b += '<span class="badge">' + esc(c.register) + "</span>";
    if (b) h += '<div class="badges">' + b + "</div>";
    if (c.id_meaning) h += '<div class="mean">' + esc(c.id_meaning) + "</div>";
    if (S.settings.showEnglish && c.en) h += '<div class="en">' + esc(c.en) + "</div>";
    if (c.breakdown) h += '<div class="blk"><h4>Pecah kata</h4>' + esc(c.breakdown) + "</div>";
    if (c.mnemonic) h += '<div class="blk"><h4>Jembatan ingatan</h4>' + esc(c.mnemonic) + "</div>";
    if (c.note) h += '<div class="blk"><h4>Catatan</h4>' + esc(c.note) + "</div>";
    var ex = c.example;
    if (ex && ex.zh) {
      var zhHtml = esc(ex.zh).split(esc(c.zh)).join("<mark>" + esc(c.zh) + "</mark>");
      h += '<div class="blk"><h4>Contoh</h4><div class="row"><div class="grow"><div class="ex-zh">' + zhHtml + "</div>" +
        (S.settings.showPinyin && ex.py ? '<div class="muted">' + esc(ex.py) + "</div>" : "") +
        (ex.id ? "<div>" + esc(ex.id) + "</div>" : "") +
        (S.settings.showEnglish && ex.en ? '<div class="muted small">' + esc(ex.en) + "</div>" : "") +
        "</div>" + playBtn(ex.zh) + "</div></div>";
    }
    return h + "</div>";
  }

  function drawCard() {
    var area = $("#cardarea");
    if (!area) return;
    if (!CARDS.length) {
      area.innerHTML = '<div class="celebrate">' + cheer("空", "kōng", "kosong") + '<h2>Belum ada kartu</h2><p class="muted">Data kosakata belum termuat. Pastikan folder <code>data/</code> ada.</p></div>';
      return;
    }
    var c = curCard();
    if (!c) {
      if (CS.queue && CS.queue.length) { CS.queue.shift(); return drawCard(); }
      var dy = day();
      if (!dy.sessionDone.cards) { dy.sessionDone.cards = true; save(); }
      var more = newList(cardsOf(CS.decks)).length;
      area.innerHTML = '<div class="celebrate">' + cheer("完成", "wánchéng", "selesai") + '<h2>Selesai untuk sekarang!</h2><p class="muted">' +
        (CS.done ? "Kamu mereview " + CS.done + " kartu. " : "Tidak ada kartu yang jatuh tempo. ") + 'Lanjutkan besok untuk menjaga streak.</p>' +
        (more ? '<button type="button" class="btn primary block" data-act="more-new">Belajar kartu baru tambahan (+10)</button>' : "") +
        '<a class="btn block" href="#/quiz" style="margin-top:10px">Ke kuis</a></div>';
      return;
    }
    CS.flipped = false;
    var st = stOf(c.key);
    var h = '<div class="progress-line"><span>' + CS.done + " / " + (CS.done + CS.queue.length) + '</span><div class="bar"><i style="width:' + pct(CS.done, CS.done + CS.queue.length) + '%"></i></div>' +
      '<span>' + (st ? "review" : "baru") + "</span></div>";
    h += '<div class="cardwrap" id="cardwrap"><div class="card" id="card" role="button" tabindex="0" aria-label="Balik kartu">' + cardFront(c) + cardBack(c) + "</div></div>";
    h += '<div class="reveal-wrap" id="flip-hint"><button type="button" class="btn primary block lg" data-act="reveal">Lihat jawaban <kbd class="kbd-hint">Spasi</kbd></button></div>';
    h += '<p class="center small muted swipe-hint" id="swipe-hint" hidden>Geser kartu: kiri = Lagi · kanan = Bisa</p>';
    h += '<div class="rate-bar" id="ratebar" hidden>' + [["Lagi", 0], ["Sulit", 1], ["Bisa", 2], ["Mudah", 3]].map(function (x) {
      return '<button type="button" class="r' + x[1] + '" data-act="rate" data-g="' + x[1] + '" aria-label="' + x[0] + '">' + x[0] + "<small>" + SRS.nextIntervalLabel(st, x[1]) + "</small></button>";
    }).join("") + "</div>";
    area.innerHTML = h;
    var backFace = $(".face.back", area);
    if (backFace) backFace.setAttribute("aria-hidden", "true");
    bindCard();
    if (CS.dir === "listen" && CS.tapped) TTS.speak(c.zh, { rate: S.settings.rate });
  }
  ACT["more-new"] = function () { CS.extra += 10; buildQueue(); drawCard(); };

  function flip() {
    var card = $("#card"), rb = $("#ratebar");
    if (!card) return;
    CS.flipped = !CS.flipped;
    var flipped = CS.flipped;
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) card.classList.toggle("flipped", flipped);
    else {
      card.classList.remove("flipping"); void card.offsetWidth; card.classList.add("flipping");
      setTimeout(function () { card.classList.toggle("flipped", flipped); }, 170);
      setTimeout(function () { card.classList.remove("flipping"); }, 360);
    }
    if (rb) rb.hidden = !CS.flipped;
    var fh = $("#flip-hint"); if (fh) fh.hidden = CS.flipped;
    var sw = $("#swipe-hint"); if (sw) sw.hidden = !CS.flipped;
    var f = $(".face.front", card), b = $(".face.back", card);
    if (f) f.setAttribute("aria-hidden", CS.flipped ? "true" : "false");
    if (b) b.setAttribute("aria-hidden", CS.flipped ? "false" : "true");
    if (CS.flipped && CS.dir === "id2zh") { var c = curCard(); if (c && CS.tapped) TTS.speak(c.zh, { rate: S.settings.rate }); }
  }

  function bindCard() {
    var w = $("#cardwrap");
    if (!w) return;
    var sx = 0, sy = 0, dx = 0, drag = false, active = false, pid = null;
    function reset() {
      w.classList.add("snap"); w.style.transform = "";
      setTimeout(function () { w.classList.remove("snap"); }, 260);
    }
    w.addEventListener("pointerdown", function (e) {
      if (e.target.closest("[data-act]")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      active = true; drag = false; dx = 0; pid = e.pointerId; sx = e.clientX; sy = e.clientY;
    });
    w.addEventListener("pointermove", function (e) {
      if (!active || e.pointerId !== pid) return;
      dx = e.clientX - sx;
      var dy = e.clientY - sy;
      if (!drag && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        drag = true; w.classList.add("dragging");
        try { w.setPointerCapture(pid); } catch (err) {}
      }
      if (drag) {
        w.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 25) + "deg)";
        w.classList.toggle("tint-r", dx > 45 && CS.flipped);
        w.classList.toggle("tint-l", dx < -45 && CS.flipped);
      }
    });
    function end(e) {
      if (!active || e.pointerId !== pid) return;
      active = false;
      w.classList.remove("dragging", "tint-l", "tint-r");
      if (drag) {
        drag = false;
        if (e.type === "pointerup" && Math.abs(dx) > 90) {
          if (!CS.flipped) { reset(); flip(); }
          else { w.style.transform = ""; rateCurrent(dx > 0 ? 2 : 0); }
        } else reset();
      } else if (e.type === "pointerup") flip();
    }
    w.addEventListener("pointerup", end);
    w.addEventListener("pointercancel", end);
    $("#card").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); flip(); } });
  }

  function rateCurrent(g) {
    var key = CS.queue && CS.queue[0];
    if (!key || !CARD[key]) return;
    CS.queue.shift();
    var old = S.srs[key], isNew = !old;
    S.srs[key] = SRS.rate(old, g);
    var dy = day();
    dy.reviewed++; if (isNew) dy.newSeen++;
    if (CARD[key].kind === "phrase") {
      dy.phraseRated = (dy.phraseRated || 0) + 1;
      if (dy.phraseRated >= 5) dy.sessionDone.phrases = true;
    }
    bumpStreak();
    if (g === 0) CS.queue.splice(Math.min(4, CS.queue.length), 0, key); else CS.done++;
    if (!CS.queue.length) dy.sessionDone.cards = true;
    pruneDaily(); save();
    drawCard();
  }
  ACT.rate = function (el) { if (CS.flipped) rateCurrent(+el.getAttribute("data-g")); };
  ACT.reveal = function () { if (!CS.flipped) { CS.tapped = true; flip(); } };
  function cardsKey(e) {
    var k = e.key;
    if (k === " " || k === "Spacebar") { if (curCard()) { e.preventDefault(); flip(); } return; }
    if (k === "p" || k === "P") { var c = curCard(); if (c) TTS.speak(c.zh, { rate: S.settings.rate }); return; }
    if (!CS.flipped) return;
    if (k === "1" || k === "ArrowLeft") rateCurrent(0);
    else if (k === "2") rateCurrent(1);
    else if (k === "3" || k === "ArrowRight") rateCurrent(2);
    else if (k === "4") rateCurrent(3);
  }

  /* =========================================================
   * 7. Grammar
   * ========================================================= */
  var GL = { q: "", lvl: "", weak: false }, GA = { id: null, ans: {} }, MX = null;
  function grammarList() { return arr(W.GRAMMAR).filter(function (g) { return g && g.id; }); }
  function gById(id) { var l = grammarList(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function gDot(id) {
    var r = S.grammar[id];
    if (!r || !(r.right + r.wrong)) return '<span class="dot" title="Belum dilatih"></span>';
    var ratio = r.right / (r.right + r.wrong);
    return '<span class="dot ' + (ratio >= 0.75 ? "good" : ratio >= 0.5 ? "warn" : "bad") + '" title="Benar ' + r.right + ", salah " + r.wrong + '"></span>';
  }
  function gGist(g) {
    var t = String(g.id_explain || "");
    var mm = /^[\s\S]*?[.!?](?:\s|$)/.exec(t);
    var m = mm ? mm[0].trim() : t;
    return m.length > 100 ? m.slice(0, 98) + "…" : m;
  }
  function gRows() {
    var q = GL.q.trim().toLowerCase();
    var list = grammarList().filter(function (g) {
      if (GL.lvl && g.level !== GL.lvl) return false;
      if (!q) return true;
      return [g.pattern, g.py, g.structure, g.id_explain, g.en_explain].join(" ").toLowerCase().indexOf(q) >= 0;
    });
    if (!list.length) return '<div class="panel center muted">' + (grammarList().length ? "Tidak ada pola yang cocok." : "Data grammar belum tersedia.") + "</div>";
    return list.map(function (g) {
      return '<a class="g-row" href="#/grammar/' + encodeURIComponent(g.id) + '">' + gDot(g.id) + '<div class="grow"><div class="g-pattern">' + esc(g.pattern) +
        ' <span class="badge">' + esc(g.level || "") + '</span></div><div class="small muted">' + esc(gGist(g)) + '</div></div><span aria-hidden="true">›</span></a>';
    }).join("");
  }

  SCREENS.grammar = function (args) {
    if (args[0] === "mix") return mixScreen();
    if (args[0]) return grammarDetail(args[0]);
    var n = grammarList().length;
    var h = head("Grammar", n + " pola B1–B2");
    h += '<div class="stack"><input type="search" id="gsearch" data-inp="gsearch" placeholder="Cari pola / arti…" value="' + esc(GL.q) + '" aria-label="Cari grammar">';
    h += '<div class="row wrap"><div class="chips">' + [["", "Semua"], ["B1", "B1"], ["B2", "B2"]].map(function (x) {
      return '<button type="button" class="chip small ' + (GL.lvl === x[0] ? "on" : "") + '" data-act="glvl" data-v="' + x[0] + '">' + x[1] + "</button>";
    }).join("") + '</div><span class="grow"></span></div>';
    h += '<div class="panel row between wrap"><div><b>Latihan campuran</b><div class="small muted">10 soal cloze dari berbagai pola</div></div>' +
      '<div class="row wrap"><label class="check small"><input type="checkbox" data-chg="gweak" ' + (GL.weak ? "checked" : "") + '> Fokus yang lemah</label>' +
      '<button type="button" class="btn primary" data-act="gmix-start"' + (n ? "" : " disabled") + ">Mulai</button></div></div>";
    h += '<div id="gl-list">' + gRows() + "</div></div>";
    view(h);
  };
  CHG.gsearch = function (el) { GL.q = el.value; var l = $("#gl-list"); if (l) l.innerHTML = gRows(); };
  CHG.gweak = function (el) { GL.weak = el.checked; };
  ACT.glvl = function (el) { GL.lvl = el.getAttribute("data-v"); rerender(); };

  function clozeHtml(q) { return esc(q).split("___").join('<span class="gap"></span>'); }
  function quizBlock(g, qi, chosen, opts, act, extraAttr) {
    var q = g.quiz[qi], answered = chosen != null;
    var h = '<div class="cloze-q">' + clozeHtml(q.q) + '</div><div class="opts two">';
    opts.forEach(function (o) {
      var cls = "opt";
      if (answered) { if (o === q.answer) cls += " correct"; else if (o === chosen) cls += " wrong"; }
      h += '<button type="button" class="' + cls + '" ' + (answered ? "disabled" : "") + ' data-act="' + act + '" data-g="' + esc(g.id) + '" data-qi="' + qi + '" data-v="' + esc(o) + '"' + (extraAttr || "") + ">" + esc(o) + "</button>";
    });
    h += "</div>";
    if (answered) {
      var filled = String(q.q).replace("___", q.answer);
      h += '<div class="feedback"><b>' + (chosen === q.answer ? okTag("Benar!") : noTag("Kurang tepat")) + "</b> " + esc(q.explain || "") +
        '<div class="row mt"><div class="grow ex-zh">' + esc(filled) + "</div>" + playBtn(filled) + "</div></div>";
    }
    return h;
  }
  function recordG(id, ok) {
    var r = S.grammar[id] || (S.grammar[id] = { right: 0, wrong: 0 });
    if (ok) r.right++; else r.wrong++;
    save();
  }

  function grammarDetail(id) {
    var g = gById(id);
    if (!g) { view(head("Grammar", "") + '<div class="panel center"><p>Pola tidak ditemukan.</p><a class="btn" href="#/grammar">Kembali</a></div>'); return; }
    if (GA.id !== id) GA = { id: id, ans: {} };
    var h = '<header class="screen-head"><a class="btn sm" href="#/grammar" aria-label="Kembali">‹ Grammar</a><span class="badge brand">' + esc(g.level || "") + "</span></header><div class=\"stack\">";
    h += '<section class="panel center"><div class="big-hanzi long">' + esc(g.pattern) + '</div><div class="muted">' + esc(g.py || "") + "</div>" +
      '<p class="mt"><span class="formula">' + esc(g.structure || "") + "</span></p></section>";
    h += '<section class="panel"><h2>Penjelasan</h2><p>' + esc(g.id_explain || "") + "</p>" + (S.settings.showEnglish && g.en_explain ? '<p class="muted">' + esc(g.en_explain) + "</p>" : "") + "</section>";
    var exs = arr(g.examples);
    if (exs.length) {
      h += '<section class="panel"><h2>Contoh</h2>' + exs.map(function (e) {
        return '<div class="example row"><div class="grow"><div class="ex-zh">' + esc(e.zh) + "</div>" + (S.settings.showPinyin && e.py ? '<div class="muted small">' + esc(e.py) + "</div>" : "") +
          "<div>" + esc(e.id || "") + "</div></div>" + playBtn(e.zh) + "</div>";
      }).join("") + "</section>";
    }
    if (g.mistake) {
      h += '<section class="panel mistake"><h2>Kesalahan umum</h2><p class="mk">' + I("x", "bad") + '<span class="wrong ex-zh">' + esc(g.mistake.wrong) + '</span></p><p class="mk">' + I("check", "good") + '<span class="right ex-zh">' + esc(g.mistake.right) + "</span></p>" +
        '<p class="muted small">' + esc(g.mistake.note || "") + "</p></section>";
    }
    var qs = arr(g.quiz);
    if (qs.length) {
      h += '<section class="panel"><h2>Latihan</h2>';
      qs.forEach(function (q, qi) {
        h += (qi ? '<hr style="border:0;border-top:1px solid var(--border);margin:16px 0">' : "") + quizBlock(g, qi, GA.ans[qi], arr(q.options), "g-ans");
      });
      h += "</section>";
    }
    h += "</div>";
    view(h);
  }
  ACT["g-ans"] = function (el) {
    var g = gById(el.getAttribute("data-g")), qi = +el.getAttribute("data-qi"), v = el.getAttribute("data-v");
    if (!g || !g.quiz[qi]) return;
    if (el.hasAttribute("data-mix")) { mixAnswer(g, qi, v); return; }
    if (GA.ans[qi] != null) return;
    GA.ans[qi] = v;
    recordG(g.id, v === g.quiz[qi].answer);
    rerender();
  };

  /* ---- mixed practice ---- */
  ACT["gmix-start"] = function () {
    var items = [];
    var gs = grammarList().filter(function (g) { return arr(g.quiz).length; });
    if (GL.weak) {
      var weak = gs.filter(function (g) { var r = S.grammar[g.id]; return !r || r.wrong >= r.right; });
      if (weak.length >= 3) gs = weak;
    }
    gs.forEach(function (g) { g.quiz.forEach(function (q, qi) { items.push({ gid: g.id, qi: qi, opts: shuffle(arr(q.options)) }); }); });
    items = shuffle(items).slice(0, 10);
    if (!items.length) { toast("Belum ada soal"); return; }
    MX = { items: items, i: 0, score: 0, chosen: null, miss: [] };
    go("#/grammar/mix");
  };
  function mixScreen() {
    if (!MX) { go("#/grammar"); return; }
    var h = '<header class="screen-head"><a class="btn sm" href="#/grammar">‹ Keluar</a><span class="muted">Latihan campuran</span></header>';
    if (MX.i >= MX.items.length) {
      h += '<div class="panel center stack">' + (MX.score >= MX.items.length * 0.8 ? cheer("太棒了", "tài bàng le", "luar biasa") : cheer("加油", "jiāyóu", "semangat")) + "<h2>Skor: " + MX.score + " / " + MX.items.length + "</h2>";
      if (MX.miss.length) {
        h += '<div style="text-align:left"><b>Pola yang perlu diulang</b>' + MX.miss.map(function (id) {
          var g = gById(id);
          return g ? '<a class="g-row" href="#/grammar/' + encodeURIComponent(id) + '"><div class="grow g-pattern">' + esc(g.pattern) + "</div><span>›</span></a>" : "";
        }).join("") + "</div>";
      } else h += "<p>Sempurna, tidak ada yang perlu diulang!</p>";
      h += '<button type="button" class="btn primary block" data-act="gmix-start">Main lagi</button></div>';
      view(h); return;
    }
    var it = MX.items[MX.i], g = gById(it.gid);
    h += '<div class="progress-line" style="margin-top:0"><span>' + (MX.i + 1) + " / " + MX.items.length + '</span><div class="bar"><i style="width:' + pct(MX.i, MX.items.length) + '%"></i></div></div>';
    h += '<section class="panel mt">' + quizBlock(g, it.qi, MX.chosen, it.opts, "g-ans", " data-mix=\"1\"");
    if (MX.chosen != null) h += '<button type="button" class="btn primary block mt" data-act="gmix-next">' + (MX.i + 1 >= MX.items.length ? "Lihat skor" : "Lanjut") + "</button>";
    h += "</section>";
    view(h);
  }
  function mixAnswer(g, qi, v) {
    if (MX.chosen != null) return;
    MX.chosen = v;
    var ok = v === g.quiz[qi].answer;
    if (ok) MX.score++; else if (MX.miss.indexOf(g.id) < 0) MX.miss.push(g.id);
    recordG(g.id, ok);
    mixScreen();
  }
  ACT["gmix-next"] = function () { MX.i++; MX.chosen = null; mixScreen(); W.scrollTo(0, 0); };

  /* =========================================================
   * 8. Talk (Percakapan): list, read, roleplay, shadowing, Claude
   * ========================================================= */
  var TK = { id: null, mode: "read", py: null, tr: true, rate: 0.85, claudePy: true };
  var RP = null, SH = { i: 0, auto: false, tok: 0, timer: null }, PLAYING = false;

  function dlById(id) { var l = arr(W.DIALOGUES); for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i]; return null; }
  function learnerTurns(d) { return arr(d.lines).filter(function (l) { return l.who === d.learner; }); }
  function ftById(id) { var l = arr(W.FREE_TALK_TOPICS); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  /* ---- Claude panel (shared by dialogues and free talk) ---- */
  function promptFor(ctx) {
    var p = String(ctx || "").split(":"), pid = p.slice(1).join(":");
    var o = { pinyin: TK.claudePy };
    try {
      if (p[0] === "dl" && dlById(pid) && W.buildClaudePrompt) return W.buildClaudePrompt(dlById(pid), o);
      if (p[0] === "ft" && ftById(pid) && W.buildFreeTalkPrompt) return W.buildFreeTalkPrompt(ftById(pid), o);
    } catch (e) {}
    return "";
  }
  function claudePanel(ctx, role) {
    return '<div class="claude-panel stack" data-ctx="' + esc(ctx) + '">' +
      '<p>Pakai akun Claude-mu sendiri. Prompt di bawah berisi skenario ini + aturan koreksi. Claude akan memerankan ' + esc(role || "lawan bicaramu") + " dan mengoreksi setiap jawabanmu.</p>" +
      '<label class="check"><input type="checkbox" data-chg="claude-py" ' + (TK.claudePy ? "checked" : "") + "> Claude menulis pinyin</label>" +
      '<div class="row wrap"><button type="button" class="btn primary" data-act="claude-open">' + I("copy") + ' Salin prompt &amp; buka Claude</button>' +
      '<button type="button" class="btn" data-act="claude-view">' + I("eye") + ' Lihat prompt</button></div>' +
      '<div class="tip small"><b>' + I("bulb") + ' Tips menjawab:</b><br>• iPhone/iPad: tambah keyboard 中文(台灣)–拼音 atau 注音, lalu tekan ' + I("mic") + ' di keyboard untuk dikte.<br>• Windows: tekan <b>Win+H</b> untuk dikte suara (pilih bahasa Mandarin Taiwan).<br>• Ucapkan jawabanmu, jangan hanya mengetik.</div>' +
      '<div><h3>Impor kartu dari Claude</h3><p class="small muted">Di akhir sesi Claude memberi blok 【KARTU】. Tempel di sini (format: 中文 | pinyin | arti).</p>' +
      '<textarea class="imp" placeholder="【KARTU】&#10;我這邊沒問題 | wǒ zhèbiān méi wèntí | Dari sisi saya tidak ada masalah&#10;【/KARTU】" aria-label="Tempel kartu"></textarea>' +
      '<button type="button" class="btn soft mt" data-act="import-cards">Tambahkan ke dek \'Dari Claude\'</button></div></div>';
  }
  CHG["claude-py"] = function (el) { TK.claudePy = el.checked; $$('[data-chg="claude-py"]').forEach(function (x) { x.checked = TK.claudePy; }); };
  ACT["claude-open"] = function (el) {
    var ctx = el.closest(".claude-panel").getAttribute("data-ctx"), p = promptFor(ctx);
    if (!p) { toast("Prompt belum tersedia"); return; }
    var pr = copyText(p);
    try { W.open("https://claude.ai/new?q=" + encodeURIComponent(p), "_blank"); } catch (e) {}
    pr.then(function (ok) { toast(ok ? "Prompt disalin — kalau belum terisi otomatis, tempel di chat baru" : "Gagal menyalin — pakai 'Lihat prompt'"); });
  };
  ACT["claude-view"] = function (el) {
    var ctx = el.closest(".claude-panel").getAttribute("data-ctx"), p = promptFor(ctx);
    openModal("<h2>Prompt untuk Claude</h2><textarea id=\"prompt-view\" class=\"mono\" readonly style=\"min-height:280px\">" + esc(p) + "</textarea>" +
      '<div class="actions"><button type="button" class="btn" data-act="modal-close">Tutup</button><button type="button" class="btn primary" data-act="copy" data-from="#prompt-view">Salin</button></div>');
  };
  ACT["ft-open"] = function (el) {
    var t = ftById(el.getAttribute("data-id"));
    if (!t) return;
    openModal('<h2 class="zh">' + esc(t.zh) + '</h2><p class="muted small">' + esc(t.name) + " — " + esc(t.goal_id) + "</p>" + claudePanel("ft:" + t.id, t.ai_role.split(",")[0]) +
      '<div class="actions"><button type="button" class="btn" data-act="modal-close">Tutup</button></div>', { sheet: true });
  };

  function parseCards(text) {
    var m = /【KARTU】([\s\S]*?)【\/KARTU】/.exec(text), body = m ? m[1] : text, out = [];
    String(body).split(/\r?\n/).forEach(function (raw) {
      var line = raw.replace(/\*\*/g, "").replace(/`/g, "").trim();
      line = line.replace(/^(?:[-*•·]|\d+[.)、])\s*/, "").replace(/^[|｜]\s*/, "").replace(/\s*[|｜]$/, "");
      if (/^[-:|｜\s]+$/.test(line)) return;
      var parts = line.split(/[|｜]/).map(function (x) { return x.trim(); });
      if (parts.length < 2 || !parts[0] || !hasCJK(parts[0])) return;
      var zh = parts[0], py = "", mean = "";
      if (parts.length >= 3) { py = parts[1]; mean = parts.slice(2).join(" | "); }
      else if (!hasCJK(parts[1]) && /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(parts[1])) py = parts[1];
      else mean = parts[1];
      out.push({ zh: zh, py: py, id_meaning: mean });
    });
    return out;
  }
  ACT["import-cards"] = function (el) {
    var ta = el.closest(".claude-panel").querySelector("textarea.imp");
    var found = parseCards(ta ? ta.value : "");
    var seen = {}, n = 0;
    S.custom.forEach(function (c) { seen[c.zh] = true; });
    found.forEach(function (c) {
      if (seen[c.zh]) return;
      seen[c.zh] = true; n++;
      S.custom.push({ id: "c-" + Date.now().toString(36) + "-" + n, zh: c.zh, py: c.py, id_meaning: c.id_meaning, created: Date.now() });
    });
    if (n) { save(); rebuildCards(); CS.fresh = true; if (ta) ta.value = ""; }
    toast(n ? n + " kartu ditambahkan" : (found.length ? "Semua kartu sudah ada" : "Tidak ada kartu yang terbaca — cek format"));
  };

  /* ---- list ---- */
  function talkList() {
    var h = head("Bicara", arr(W.DIALOGUES).length + " skenario kerja · ngobrol bebas dengan Claude");
    // skenario (latihan utama, offline) dulu; free talk dengan Claude sesudahnya
    var ds = arr(W.DIALOGUES);
    h += '<div class="stack"><section><h2 style="margin-bottom:10px;font-size:1.05rem">Skenario kerja</h2>';
    if (!ds.length) h += '<div class="panel center muted">Skenario dialog belum tersedia.</div>';
    ds.forEach(function (d) {
      var done = S.dialogues[d.id] && S.dialogues[d.id].done;
      var other = d.roles && d.roles[d.learner === "A" ? "B" : "A"];
      h += '<a class="d-card" href="#/talk/' + encodeURIComponent(d.id) + '"><div class="grow"><div class="zh">' + esc(d.title_zh) + '</div><div class="small muted">' + esc(d.title_id) +
        (other ? " · dengan " + esc(other.id) : "") + '</div></div>' + (done ? '<span class="badge good">' + I("check") + ' selesai</span>' : "") + "<span aria-hidden=\"true\">›</span></a>";
    });
    h += '</section><section class="panel"><h2>' + I("spark") + ' Free talk dengan Claude</h2><p class="small muted">Pilih topik, lalu ngobrol bebas dengan Claude memakai akunmu sendiri (perlu internet).</p><div class="ft-grid">';
    arr(W.FREE_TALK_TOPICS).forEach(function (t) {
      h += '<button type="button" class="ft-item" data-act="ft-open" data-id="' + esc(t.id) + '"><span class="zh">' + esc(t.zh) + '</span><span class="small muted">' + esc(t.name) + "</span></button>";
    });
    h += "</div></section></div>";
    view(h);
  }

  /* ---- detail ---- */
  SCREENS.talk = function (args) {
    if (!args[0]) { talkList(); return; }
    var d = dlById(args[0]);
    if (!d) { view(head("Bicara", "") +'<div class="panel center"><p>Skenario tidak ditemukan.</p><a class="btn" href="#/talk">Kembali</a></div>'); return; }
    if (TK.id !== d.id) { TK.id = d.id; TK.mode = "read"; RP = null; SH = { i: 0, auto: false, tok: 0, timer: null }; }
    if (TK.py == null) TK.py = S.settings.showPinyin;
    onLeave(function () { shStop(); PLAYING = false; });

    var wide = W.matchMedia && W.matchMedia("(min-width: 1100px)").matches;
    var gOf = function (pat) { var l = grammarList(); for (var i = 0; i < l.length; i++) if (l[i].pattern === pat) return l[i]; return null; };
    var info = '<details class="panel info side mb" ' + (wide ? "open" : "") + "><summary><b>Situasi &amp; target</b></summary>" +
      '<p class="mt">' + esc(d.setting_id) + '</p><p><b>Tujuan:</b> ' + esc(d.goal_id) + "</p>";
    if (arr(d.vocab).length) {
      info += '<h3>Kosakata</h3><div class="chips vocab-chips">' + d.vocab.map(function (z) {
        return '<button type="button" class="chip small" data-act="vocab-sheet" data-z="' + esc(z) + '">' + esc(z) + "</button>";
      }).join("") + "</div>";
    }
    if (arr(d.grammar).length) {
      info += '<h3 class="mt">Grammar</h3><div class="chips vocab-chips">' + d.grammar.map(function (p) {
        var g = gOf(p);
        return g ? '<a class="chip small" href="#/grammar/' + encodeURIComponent(g.id) + '">' + esc(p) + "</a>" : '<span class="chip small">' + esc(p) + "</span>";
      }).join("") + "</div>";
    }
    info += "</details>";

    var h = '<header class="screen-head"><div><a class="btn sm" href="#/talk">‹ Bicara</a></div></header>';
    h += '<div class="mb"><h1 class="zh" style="font-size:1.6rem">' + esc(d.title_zh) + '</h1><div class="muted">' + esc(d.title_id) + "" + "</div></div>";
    h += '<div class="seg tabs mb" role="tablist" aria-label="Mode latihan">' + [["read", I("head") + "<span>Dengar</span>"], ["role", I("users") + "<span>Roleplay</span>"], ["shadow", I("repeat") + "<span>Shadowing</span>"], ["claude", I("spark") + "<span>Claude</span>"]].map(function (x) {
      return '<button type="button" role="tab" class="' + (TK.mode === x[0] ? "on" : "") + '" data-act="tmode" data-v="' + x[0] + '">' + x[1] + "</button>";
    }).join("") + "</div>";
    var main;
    if (TK.mode === "role") main = roleHtml(d);
    else if (TK.mode === "shadow") main = shadowHtml(d);
    else if (TK.mode === "claude") main = '<section class="panel"><h2>' + I("spark") + ' Latihan dengan Claude</h2>' + claudePanel("dl:" + d.id, (d.ai_role || "").split(",")[0]) + "</section>";
    else main = readHtml(d);
    // info (situasi & target) duluan di DOM: di HP/iPad portrait tampil di atas; di layar lebar dipindah ke kolom kanan lewat grid
    h += '<div class="two-col">' + info + '<div class="main stack">' + main + "</div></div>";
    view(h);
    if (TK.mode === "shadow") shDraw(d);
  };
  ACT.tmode = function (el) {
    shStop(); PLAYING = false;
    TK.mode = el.getAttribute("data-v");
    if (TK.mode === "role" && !RP) { var d = dlById(TK.id); if (d) rpStart(d, false); }
    rerender();
  };
  ACT["vocab-sheet"] = function (el) {
    var z = el.getAttribute("data-z"), c = findByZh(z);
    var h;
    if (c) {
      h = '<div class="center"><div class="big-hanzi long">' + tcolor(c.zh, c.py) + '</div><div class="muted">' + esc(c.py || "") + "</div>" + playBtn(c.zh) +
        '<p class="mean mt"><b>' + esc(c.id_meaning || "") + "</b></p>" + (c.en ? '<p class="muted">' + esc(c.en) + "</p>" : "") + "</div>" +
        '<div class="actions"><button type="button" class="btn" data-act="modal-close">Tutup</button>' +
        (S.srs[c.key] ? '<button type="button" class="btn" data-act="to-review" data-k="' + esc(c.key) + '">Jadwalkan ulang hari ini</button>' : '<button type="button" class="btn primary" data-act="to-review" data-k="' + esc(c.key) + '">Tambah ke review</button>') + "</div>";
    } else {
      h = '<div class="center"><div class="big-hanzi long">' + esc(z) + "</div>" + playBtn(z) + '<p class="muted mt">Kata ini belum ada di dek kartu.</p></div><div class="actions"><button type="button" class="btn" data-act="modal-close">Tutup</button></div>';
    }
    openModal(h, { sheet: true });
  };
  ACT["to-review"] = function (el) {
    var k = el.getAttribute("data-k");
    if (!CARD[k]) return;
    var st = S.srs[k] || SRS.fresh();
    st.due = today(); S.srs[k] = st; save(); CS.fresh = true; closeModal(); toast("Masuk antrean review");
  };

  /* ---- bubbles ---- */
  function bubbleHtml(d, l, i) {
    var role = d.roles && d.roles[l.who] ? d.roles[l.who] : { zh: l.who, id: "" };
    var me = l.who === d.learner;
    return '<div class="bubble ' + (me ? "me" : "A") + '" data-i="' + i + '"><div class="row"><div class="grow"><div class="who">' + esc(role.zh) + "</div>" +
      '<div class="b-zh">' + esc(l.zh) + '</div><div class="b-py">' + esc(l.py || "") + '</div><div class="b-id">' + esc(l.id || "") + "</div></div>" +
      playBtn(l.zh, "sm").replace('data-act="speak"', 'data-act="speak" data-r="' + TK.rate + '"') + "</div></div>";
  }
  function flagsClass() { return (TK.py ? "" : " hide-py") + (TK.tr ? "" : " hide-tr"); }
  function toggleChips() {
    return '<div class="chips"><button type="button" class="chip small ' + (TK.py ? "on" : "") + '" data-act="tk-py">Pinyin</button>' +
      '<button type="button" class="chip small ' + (TK.tr ? "on" : "") + '" data-act="tk-tr">Terjemahan</button></div>';
  }
  ACT["tk-py"] = function (el) { TK.py = !TK.py; el.classList.toggle("on", TK.py); var b = $(".bubbles"); if (b) b.classList.toggle("hide-py", !TK.py); var s = $("#sh-area"); if (s) shDrawCur(); };
  ACT["tk-tr"] = function (el) { TK.tr = !TK.tr; el.classList.toggle("on", TK.tr); var b = $(".bubbles"); if (b) b.classList.toggle("hide-tr", !TK.tr); var s = $("#sh-area"); if (s) shDrawCur(); };
  ACT["tk-rate"] = function (el) {
    TK.rate = +el.getAttribute("data-v");
    $$('[data-act="tk-rate"]').forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-v") === TK.rate); });
    $$(".bubble [data-act=\"speak\"]").forEach(function (b) { b.setAttribute("data-r", TK.rate); });
  };
  function rateSeg() {
    return '<div class="seg" style="max-width:260px" role="group" aria-label="Kecepatan">' + [0.7, 0.85, 1].map(function (r) {
      return '<button type="button" class="' + (TK.rate === r ? "on" : "") + '" data-act="tk-rate" data-v="' + r + '">' + r + "×</button>";
    }).join("") + "</div>";
  }

  /* ---- a) read & listen ---- */
  function readHtml(d) {
    var h = '<div class="toolbar"><button type="button" class="btn primary" id="playall" data-act="play-all">' + playAllLabel() + "</button>" + toggleChips() + rateSeg() + "</div>";
    h += '<div class="bubbles' + flagsClass() + '">' + arr(d.lines).map(function (l, i) { return bubbleHtml(d, l, i); }).join("") + "</div>";
    return h;
  }
  ACT["play-all"] = function () {
    var d = dlById(TK.id), btn = $("#playall");
    if (!d) return;
    if (PLAYING) { TTS.stop(); PLAYING = false; if (btn) btn.innerHTML = playAllLabel(); $$(".bubble.playing").forEach(function (b) { b.classList.remove("playing"); }); return; }
    PLAYING = true; if (btn) btn.innerHTML = I("stop", "fill") + " Stop";
    TTS.speakSeq(arr(d.lines).map(function (l) { return l.zh; }), {
      rate: TK.rate, gapMs: 450,
      onItem: function (i) {
        $$(".bubble.playing").forEach(function (b) { b.classList.remove("playing"); });
        var b = $('.bubble[data-i="' + i + '"]');
        if (b) { b.classList.add("playing"); try { b.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {} }
      },
      onDone: function () {
        PLAYING = false; var bt = $("#playall"); if (bt) bt.innerHTML = playAllLabel();
        $$(".bubble.playing").forEach(function (b) { b.classList.remove("playing"); });
      }
    });
  };

  /* ---- b) roleplay ---- */
  function similarity(text, line) {
    var a = plain(text), best = 0;
    if (!a) return 0;
    [line.zh].concat(arr(line.alts).map(function (x) { return x.zh; })).forEach(function (t) {
      var p = plain(t);
      if (!p.length) return;
      var prev = [], cur, i, j;
      for (j = 0; j <= p.length; j++) prev.push(0);
      for (i = 1; i <= a.length; i++) {
        cur = [0];
        for (j = 1; j <= p.length; j++) cur[j] = a.charAt(i - 1) === p.charAt(j - 1) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
        prev = cur;
      }
      best = Math.max(best, prev[p.length] / p.length);
    });
    return Math.round(best * 100);
  }
  function rpStart(d, speak) {
    RP = { id: d.id, shown: [], i: 0, cur: null, marks: {}, done: false };
    rpAdvance(d, speak);
  }
  function rpAdvance(d, speak) {
    var spoken = [], lines = arr(d.lines);
    while (RP.i < lines.length && lines[RP.i].who !== d.learner) { RP.shown.push(RP.i); spoken.push(lines[RP.i].zh); RP.i++; }
    if (RP.i >= lines.length) {
      RP.done = true; RP.cur = null;
      var turns = learnerTurns(d).length, good = Object.keys(RP.marks).filter(function (k) { return RP.marks[k]; }).length;
      var rec = S.dialogues[d.id] || { done: false, best: 0 };
      rec.done = true; rec.best = Math.max(rec.best || 0, pct(good, turns));
      S.dialogues[d.id] = rec; day().sessionDone.dialogue = true; save();
    } else {
      RP.cur = { idx: RP.i, revealed: false, easy: false, picked: null, opts: null, text: "" };
    }
    if (speak && spoken.length) TTS.speakSeq(spoken, { rate: TK.rate, gapMs: 350 });
  }
  function answerCard(line, text, easy) {
    var h = '<div class="answer-card stack"><div class="row"><div class="grow"><div class="ex-zh" style="font-size:1.35rem">' + esc(line.zh) + "</div>" +
      '<div class="muted">' + esc(line.py || "") + "</div><div>" + esc(line.id || "") + "</div></div>" + playBtn(line.zh) + "</div>";
    if (arr(line.alts).length) {
      h += "<div><b class=\"small\">Alternatif:</b>" + line.alts.map(function (a) {
        return '<div class="row"><div class="grow"><span class="zh">' + esc(a.zh) + '</span><div class="small muted">' + esc(a.py || "") + "</div></div>" + playBtn(a.zh, "sm") + "</div>";
      }).join("") + "</div>";
    }
    if (line.note) h += '<div class="tip small">' + I("bulb") + " " + esc(line.note) + "</div>";
    if (!easy && text) {
      var sc = similarity(text, line);
      h += '<div><span class="score-pill">' + sc + '% — ' + (sc >= 80 ? "Mantap" : sc >= 50 ? "Hampir" : "Coba lagi") + '</span> <button type="button" class="btn sm" data-act="rp-again">Ulangi</button></div>';
    }
    return h + "</div>";
  }
  function roleHtml(d) {
    if (!RP || RP.id !== d.id) rpStart(d, false);
    var lines = arr(d.lines);
    var h = '<section class="panel row between wrap">' + toggleChips() + '<button type="button" class="btn sm" data-act="rp-restart">↺ Mulai ulang</button></section>';
    h += '<div class="bubbles' + flagsClass() + '">' + RP.shown.map(function (i) { return bubbleHtml(d, lines[i], i); }).join("") + "</div>";
    if (RP.done) {
      var turns = learnerTurns(d).length, good = Object.keys(RP.marks).filter(function (k) { return RP.marks[k]; }).length;
      return h + '<section class="panel center stack">' + (good === turns ? cheer("很好", "hěn hǎo", "bagus sekali") : cheer("加油", "jiāyóu", "semangat")) + "<h2>Roleplay selesai</h2><p>Kamu menandai <b>" + good + " / " + turns +
        "</b> giliran sebagai bisa.</p><p class=\"small muted\">Ulangi sampai lancar, atau lanjut latihan bebas dengan Claude.</p>" +
        '<button type="button" class="btn primary block" data-act="tmode" data-v="claude">' + I("spark") + ' Latihan dengan Claude</button>' +
        '<button type="button" class="btn block" data-act="rp-restart">↺ Ulangi roleplay</button><a class="btn block" href="#/talk">Pilih skenario lain</a></section>';
    }
    var c = RP.cur, line = lines[c.idx];
    var role = d.roles && d.roles[d.learner] ? d.roles[d.learner].zh : "Kamu";
    h += '<section class="panel stack"><div class="task-box"><b>Giliranmu (' + esc(role) + ")</b>" + esc(line.task || "Balas lawan bicaramu.") + "</div>";
    if (!c.revealed) {
      if (!c.easy) {
        h += '<div><textarea id="rp-text" placeholder="Ketik / dikte jawabanmu (opsional)" aria-label="Jawabanmu">' + esc(c.text) + '</textarea><p class="hint">Ucapkan dengan suara keras dulu!</p></div>' +
          '<div class="row wrap"><button type="button" class="btn primary" data-act="rp-show">Lihat jawaban</button><button type="button" class="btn" data-act="rp-easy">Mode mudah (pilih)</button></div>';
      } else {
        h += '<div class="opts">' + c.opts.map(function (o, i) { return '<button type="button" class="opt" data-act="rp-pick" data-i="' + i + '">' + esc(o) + "</button>"; }).join("") + "</div>";
      }
    } else {
      if (c.easy) {
        var ok = c.opts[c.picked] === line.zh;
        h += '<div class="opts">' + c.opts.map(function (o, i) {
          return '<div class="opt ' + (o === line.zh ? "correct" : i === c.picked ? "wrong" : "") + '">' + esc(o) + "</div>";
        }).join("") + '</div><div class="feedback"><b>' + (ok ? okTag("Tepat!") : noTag("Bukan itu.")) + "</b> " + (ok ? "" : "Jawaban yang natural ada di bawah.") + "</div>";
      }
      h += answerCard(line, c.text, c.easy);
      h += '<div class="row wrap"><span class="muted small grow">Bagaimana tadi?</span><button type="button" class="btn" data-act="rp-mark" data-ok="0">' + I("repeat") + ' Belum</button><button type="button" class="btn primary" data-act="rp-mark" data-ok="1">' + I("check") + ' Bisa</button></div>';
    }
    return h + "</section>";
  }
  ACT["rp-show"] = function () { var t = $("#rp-text"); if (RP && RP.cur) { RP.cur.text = t ? t.value : ""; RP.cur.revealed = true; } rerender(); };
  ACT["rp-easy"] = function () {
    var d = dlById(TK.id), t = $("#rp-text");
    if (!RP || !RP.cur || !d) return;
    var line = d.lines[RP.cur.idx];
    RP.cur.text = t ? t.value : "";
    RP.cur.easy = true;
    RP.cur.opts = shuffle([line.zh].concat(arr(line.distractors).slice(0, 2)));
    rerender();
  };
  ACT["rp-pick"] = function (el) { if (RP && RP.cur) { RP.cur.picked = +el.getAttribute("data-i"); RP.cur.revealed = true; rerender(); } };
  ACT["rp-again"] = function () { if (RP && RP.cur) { RP.cur.revealed = false; RP.cur.easy = false; RP.cur.text = ""; RP.cur.picked = null; rerender(); } };
  ACT["rp-mark"] = function (el) {
    var d = dlById(TK.id);
    if (!d || !RP || !RP.cur) return;
    RP.marks[RP.cur.idx] = el.getAttribute("data-ok") === "1";
    RP.shown.push(RP.cur.idx); RP.i = RP.cur.idx + 1;
    rpAdvance(d, true);
    rerender();
    var bs = $$(".bubble");
    if (bs.length) { try { bs[bs.length - 1].scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {} }
  };
  ACT["rp-restart"] = function () { TTS.stop(); var d = dlById(TK.id); if (d) rpStart(d, true); TK.mode = "role"; rerender(); };

  /* ---- c) shadowing ---- */
  function shadowHtml(d) {
    return '<section class="panel stack"><div class="row between wrap">' + toggleChips() + rateSeg() + "</div></section>" +
      '<section class="panel stack" id="sh-area"></section>';
  }
  function shStop() {
    SH.tok++; SH.auto = false;
    if (SH.timer) { clearTimeout(SH.timer); SH.timer = null; }
    TTS.stop();
  }
  function shDraw(d) {
    d = d || dlById(TK.id);
    var area = $("#sh-area");
    if (!d || !area) return;
    var lines = arr(d.lines), l = lines[SH.i];
    if (!l) { area.innerHTML = '<p class="muted center">Tidak ada baris.</p>'; return; }
    var role = d.roles && d.roles[l.who] ? d.roles[l.who] : { zh: l.who, id: "" };
    area.innerHTML = '<div class="row between"><span class="badge brand">' + (SH.i + 1) + " / " + lines.length + '</span><span class="small muted">' + esc(role.zh) + " · " + esc(role.id) + "</span></div>" +
      '<div class="sh-line">' + esc(l.zh) + "</div>" +
      (TK.py ? '<div class="center muted">' + esc(l.py || "") + "</div>" : "") +
      (TK.tr ? '<div class="center small">' + esc(l.id || "") + "</div>" : "") +
      '<div class="countbar" aria-hidden="true"><i id="cbar"></i></div>' +
      '<div class="row wrap" style="justify-content:center"><button type="button" class="btn primary" data-act="sh-listen">' + I("play", "fill") + ' Dengar</button><button type="button" class="btn soft" data-act="sh-turn">' + I("mic") + ' Giliranku</button></div>' +
      '<div class="row between"><button type="button" class="btn" data-act="sh-prev"' + (SH.i ? "" : " disabled") + '>‹ Sebelumnya</button>' +
      '<button type="button" class="chip ' + (SH.auto ? "on" : "") + '" data-act="sh-auto">' + (SH.auto ? I("stop", "fill") + " Otomatis" : I("repeat") + " Otomatis") + '</button>' +
      '<button type="button" class="btn" data-act="sh-next"' + (SH.i < lines.length - 1 ? "" : " disabled") + ">Berikutnya ›</button></div>";
  }
  function shDrawCur() { shDraw(); }
  function shCountdown(l, cb) {
    var ms = Math.max(1500, 450 * Array.from(l.zh).length / TK.rate), bar = $("#cbar");
    if (bar) {
      bar.style.transition = "none"; bar.style.width = "0%";
      void bar.offsetWidth;
      bar.style.transition = "width " + ms + "ms linear"; bar.style.width = "100%";
    }
    if (SH.timer) clearTimeout(SH.timer);
    SH.timer = setTimeout(function () { SH.timer = null; if (cb) cb(); }, ms);
  }
  function shLine() { var d = dlById(TK.id); return d ? arr(d.lines)[SH.i] : null; }
  ACT["sh-listen"] = function () { var l = shLine(); if (l) { shStop(); TTS.speak(l.zh, { rate: TK.rate }); } };
  ACT["sh-turn"] = function () { var l = shLine(); if (l) { shStop(); shCountdown(l); } };
  ACT["sh-prev"] = function () { shStop(); if (SH.i > 0) SH.i--; shDraw(); };
  ACT["sh-next"] = function () { shStop(); var d = dlById(TK.id); if (d && SH.i < d.lines.length - 1) SH.i++; shDraw(); };
  ACT["sh-auto"] = function () {
    var d = dlById(TK.id);
    if (!d) return;
    if (SH.auto) { shStop(); shDraw(d); return; }
    shStop(); SH.auto = true;
    var tok = ++SH.tok;
    shDraw(d);
    (function step() {
      if (tok !== SH.tok) return;
      var l = d.lines[SH.i];
      TTS.speak(l.zh, { rate: TK.rate, onend: function () {
        if (tok !== SH.tok) return;
        shCountdown(l, function () {
          if (tok !== SH.tok) return;
          if (SH.i < d.lines.length - 1) { SH.i++; shDraw(d); step(); }
          else { SH.auto = false; shDraw(d); }
        });
      } });
    })();
  };

  /* =========================================================
   * 9. Quiz
   * ========================================================= */
  var QZ = { decks: [], type: "meaning", len: 10, qs: null, i: 0, score: 0, chosen: null, misses: [] };

  function quizPool() { return cardsOf(QZ.decks).filter(function (c) { return c.id_meaning; }); }
  function makeQ(c, type, pool) {
    var t = type === "mix" ? ["meaning", "hanzi", "listen"][Math.floor(Math.random() * 3)] : type;
    var label = function (x) { return t === "hanzi" ? x.zh : x.id_meaning; };
    var used = {}; used[label(c)] = true;
    var same = shuffle(pool.filter(function (x) { return x.key !== c.key && x.deck === c.deck; }));
    var other = shuffle(pool.filter(function (x) { return x.key !== c.key && x.deck !== c.deck; }));
    var opts = [c];
    same.concat(other).forEach(function (x) {
      if (opts.length >= 4 || used[label(x)]) return;
      used[label(x)] = true; opts.push(x);
    });
    return { key: c.key, t: t, opts: shuffle(opts).map(function (x) { return { key: x.key, label: label(x) }; }) };
  }
  SCREENS.quiz = function () {
    if (QZ.qs) return quizPlay();
    var pool = quizPool();
    var h = head("Kuis", "Uji ingatanmu dengan pilihan ganda");
    var chips = '<button type="button" class="chip ' + (!QZ.decks.length ? "on" : "") + '" data-act="qz-deck" data-d="all">Semua</button>';
    DECKS.forEach(function (d) {
      if (!CARDS.some(function (c) { return c.deck === d.id; })) return;
      chips += '<button type="button" class="chip ' + (QZ.decks.indexOf(d.id) >= 0 ? "on" : "") + '" data-act="qz-deck" data-d="' + esc(d.id) + '">' + deckMark(d) + esc(d.name) + "</button>";
    });
    h += '<div class="stack"><section class="panel"><h2>Dek</h2><div class="chips scroll-x">' + chips + "</div></section>";
    h += '<section class="panel"><h2>Jenis soal</h2><div class="seg">' + [["meaning", "Arti"], ["hanzi", "Hanzi"], ["listen", "Dengar"], ["mix", "Campur"]].map(function (x) {
      return '<button type="button" class="' + (QZ.type === x[0] ? "on" : "") + '" data-act="qz-type" data-v="' + x[0] + '">' + x[1] + "</button>";
    }).join("") + '</div><h2 class="mt">Jumlah soal</h2><div class="seg" style="max-width:240px">' + [10, 20].map(function (n) {
      return '<button type="button" class="' + (QZ.len === n ? "on" : "") + '" data-act="qz-len" data-v="' + n + '">' + n + "</button>";
    }).join("") + "</div></section>";
    h += '<button type="button" class="btn primary block" data-act="qz-start"' + (pool.length >= 4 ? "" : " disabled") + ">Mulai kuis (" + pool.length + " kartu tersedia)</button>" +
      (pool.length < 4 ? '<p class="muted center small">Butuh minimal 4 kartu di dek terpilih.</p>' : "") + "</div>";
    view(h);
  };
  ACT["qz-deck"] = function (el) {
    var d = el.getAttribute("data-d");
    if (d === "all") QZ.decks = []; else { var i = QZ.decks.indexOf(d); if (i >= 0) QZ.decks.splice(i, 1); else QZ.decks.push(d); }
    rerender();
  };
  ACT["qz-type"] = function (el) { QZ.type = el.getAttribute("data-v"); rerender(); };
  ACT["qz-len"] = function (el) { QZ.len = +el.getAttribute("data-v"); rerender(); };
  ACT["qz-start"] = function () {
    var pool = quizPool();
    if (pool.length < 4) { toast("Butuh minimal 4 kartu"); return; }
    QZ.qs = shuffle(pool).slice(0, QZ.len).map(function (c) { return makeQ(c, QZ.type, pool); });
    QZ.i = 0; QZ.score = 0; QZ.chosen = null; QZ.misses = [];
    rerender(); W.scrollTo(0, 0);
    var q = QZ.qs[0]; if (q && q.t === "listen") TTS.speak(CARD[q.key].zh, { rate: S.settings.rate });
  };
  ACT["qz-quit"] = function () { QZ.qs = null; TTS.stop(); rerender(); };
  function quizPlay() {
    var h = '<header class="screen-head"><button type="button" class="btn sm" data-act="qz-quit">‹ Keluar</button><span class="muted">Kuis</span></header>';
    if (QZ.i >= QZ.qs.length) {
      var n = QZ.qs.length;
      h += '<div class="stack"><section class="panel center">' + (QZ.score >= n * 0.8 ? cheer("太棒了", "tài bàng le", "luar biasa") : QZ.score >= n * 0.5 ? cheer("不錯", "búcuò", "lumayan") : cheer("加油", "jiāyóu", "semangat")) + "<h2>Skor " + QZ.score + " / " + n + "</h2><p class=\"muted\">" + pct(QZ.score, n) + "% benar</p></section>";
      if (QZ.misses.length) {
        h += '<section class="panel"><h2>Yang masih salah</h2>' + QZ.misses.map(function (k) {
          var c = CARD[k];
          return c ? '<div class="deck-row"><div class="grow"><div class="zh" style="font-size:1.25rem">' + tcolor(c.zh, c.py) + '</div><div class="small muted">' + esc(c.py || "") + " · " + esc(c.id_meaning || "") + "</div></div>" + playBtn(c.zh, "sm") +
            '<button type="button" class="btn sm" data-act="qz-review" data-k="' + esc(k) + '">Masukkan ke review</button></div>' : "";
        }).join("") + '<button type="button" class="btn soft block mt" data-act="qz-review" data-k="all">Masukkan semua ke review</button></section>';
      }
      h += '<button type="button" class="btn primary block" data-act="qz-again">Kuis lagi</button></div>';
      view(h); return;
    }
    var q = QZ.qs[QZ.i], c = CARD[q.key];
    h += '<div class="progress-line" style="margin-top:0"><span>' + (QZ.i + 1) + " / " + QZ.qs.length + '</span><div class="bar"><i style="width:' + pct(QZ.i, QZ.qs.length) + '%"></i></div></div>';
    h += '<section class="panel mt"><div class="quiz-q">';
    if (q.t === "meaning") h += '<div class="big-hanzi">' + tcolor(c.zh, c.py) + "</div>" + (S.settings.showPinyin && c.py ? '<div class="muted">' + esc(c.py) + "</div>" : "") + '<div class="muted small mt">Apa artinya?</div>';
    else if (q.t === "hanzi") h += '<div class="front-mean">' + esc(c.id_meaning) + '</div><div class="muted small mt">Pilih kata Mandarin yang tepat</div>';
    else h += '<button type="button" class="listen-btn" data-act="speak" data-t="' + esc(c.zh) + '" aria-label="Putar audio">' + I("vol") + '</button><div class="muted small mt">Dengar, lalu pilih artinya</div>';
    h += '</div><div class="opts">';
    q.opts.forEach(function (o, i) {
      var cls = "opt";
      if (QZ.chosen != null) { if (o.key === q.key) cls += " correct"; else if (i === QZ.chosen) cls += " wrong"; }
      h += '<button type="button" class="' + cls + '" ' + (QZ.chosen != null ? "disabled" : "") + ' data-act="qz-ans" data-i="' + i + '">' + esc(o.label) + "</button>";
    });
    h += "</div>";
    if (QZ.chosen != null) {
      var ok = q.opts[QZ.chosen].key === q.key;
      h += '<div class="feedback"><div class="row"><div class="grow"><b>' + (ok ? okTag("Benar!") : noTag("Kurang tepat")) + '</b><div class="ex-zh" style="font-size:1.3rem">' + tcolor(c.zh, c.py) + '</div><div class="muted small">' + esc(c.py || "") +
        "</div><div>" + esc(c.id_meaning || "") + "</div></div>" + playBtn(c.zh) + '</div></div><button type="button" class="btn primary block mt" data-act="qz-next">' + (QZ.i + 1 >= QZ.qs.length ? "Lihat skor" : "Lanjut") + "</button>";
    }
    h += "</section>";
    view(h);
  }
  ACT["qz-ans"] = function (el) {
    if (QZ.chosen != null) return;
    var q = QZ.qs[QZ.i], i = +el.getAttribute("data-i");
    QZ.chosen = i;
    if (q.opts[i].key === q.key) QZ.score++; else if (QZ.misses.indexOf(q.key) < 0) QZ.misses.push(q.key);
    TTS.speak(CARD[q.key].zh, { rate: S.settings.rate });
    quizPlay();
  };
  ACT["qz-next"] = function () {
    QZ.i++; QZ.chosen = null; quizPlay(); W.scrollTo(0, 0);
    var q = QZ.qs[QZ.i];
    if (q && q.t === "listen") TTS.speak(CARD[q.key].zh, { rate: S.settings.rate });
  };
  ACT["qz-again"] = function () { QZ.qs = null; rerender(); };
  ACT["qz-review"] = function (el) {
    var k = el.getAttribute("data-k"), keys = k === "all" ? QZ.misses.slice() : [k];
    keys.forEach(function (key) {
      if (!CARD[key]) return;
      var st = S.srs[key] || SRS.fresh();
      st.due = today(); S.srs[key] = st;
    });
    save(); CS.fresh = true;
    $$('[data-act="qz-review"]').forEach(function (b) { if (k === "all" || b === el) { b.disabled = true; b.textContent = "✓ Masuk review"; } });
    toast("Masuk antrean review");
  };

  /* =========================================================
   * 10. Settings
   * ========================================================= */
  function segHtml(key, vals, labels, cur) {
    return '<div class="seg">' + vals.map(function (v, i) {
      return '<button type="button" class="' + (String(cur) === String(v) ? "on" : "") + '" data-act="set" data-k="' + key + '" data-v="' + v + '">' + labels[i] + "</button>";
    }).join("") + "</div>";
  }
  function switchRow(key, label) {
    return '<label class="switch-row"><span>' + label + '</span><input type="checkbox" data-chg="set-bool" data-k="' + key + '" ' + (S.settings[key] ? "checked" : "") + "></label>";
  }
  /* =========================================================
   * Bagikan: QR statis (icons/qr-app.svg, tetap tampil offline) + link + cara pasang
   * ========================================================= */
  var APP_URL = "https://suryalim11.github.io/mandarin-b2-flashcard/";
  var SHARE_MSG = "Ini app flash card Mandarin TOCFL B2 untuk latihan kosakata kerja + percakapan:\n" + APP_URL +
    "\niPhone/iPad: buka di Safari → Share → \"Add to Home Screen\". Android: Chrome → ⋮ → Install app. Windows: Chrome/Edge → klik Install." +
    "\nSetelah dibuka sekali, app bisa dipakai offline.";
  SCREENS.share = function () {
    var h = head("Bagikan", "Scan QR atau kirim link ke teman belajar", "");
    h += '<div class="stack"><section class="panel share-hero">' +
      '<div class="qr-box"><img src="icons/qr-app.svg" width="232" height="232" alt="QR code menuju ' + esc(APP_URL) + '"></div>' +
      '<p class="share-url">' + esc(APP_URL.replace(/^https:\/\//, "").replace(/\/$/, "")) + "</p>" +
      '<div class="share-actions">' +
      (navigator.share ? '<button type="button" class="btn primary" data-act="share-native">' + I("share") + " Bagikan…</button>" : "") +
      '<button type="button" class="btn' + (navigator.share ? "" : " primary") + '" data-act="share-copy">' + I("copy") + " Salin link</button>" +
      '<a class="btn" href="icons/qr-app.png" download="qr-hua-yu-b2.png">' + I("down") + " Unduh QR</a></div></section>";
    h += '<section class="panel"><h2>Pesan siap kirim</h2><p class="share-msg">' + esc(SHARE_MSG).replace(/\n/g, "<br>") + "</p>" +
      '<button type="button" class="btn soft" data-act="share-copy-msg">' + I("copy") + " Salin pesan</button></section>";
    function stepRow(dev, how) { return '<li><b>' + dev + '</b><span class="muted">' + how + "</span></li>"; }
    h += '<section class="panel"><h2>Cara pasang</h2><ol class="install-steps">' +
      stepRow("iPhone / iPad", "Buka link di <b>Safari</b> → " + I("share") + " Share → <b>Add to Home Screen</b>") +
      stepRow("Android", "Buka di Chrome → menu ⋮ → <b>Install app</b>") +
      stepRow("Windows", "Buka di Chrome atau Edge → ikon <b>Install</b> di address bar") +
      '</ol><p class="small muted mt">Setelah dibuka sekali, app jalan offline. Progres tersimpan per perangkat; pindahkan lewat <a href="#/settings">Pengaturan → Pindah progres</a>.</p></section></div>';
    view(h);
  };
  ACT["share-copy"] = function () { copyText(APP_URL).then(function (ok) { toast(ok ? "Link disalin" : "Gagal menyalin, tahan lama link untuk menyalin"); }); };
  ACT["share-copy-msg"] = function () { copyText(SHARE_MSG).then(function (ok) { toast(ok ? "Pesan disalin, tinggal tempel di WhatsApp" : "Gagal menyalin"); }); };
  ACT["share-native"] = function () {
    if (!navigator.share) return ACT["share-copy"]();
    navigator.share({ title: "華語 B2 Flashcard", text: "Flash card Mandarin TOCFL B2 untuk kerja + latihan percakapan", url: APP_URL }).catch(function () {});
  };

  SCREENS.settings = function () {
    var st = TTS.status();
    var h = head("Pengaturan", "Versi " + VERSION, '<a class="icon-btn head-nav" href="#/home" aria-label="Beranda">' + ICON_HOME + "</a>");
    h += '<div class="stack"><a class="panel share-link" href="#/share">' + I("share") + '<span class="grow"><b>Bagikan app</b><br><span class="small muted">QR code, link, dan cara pasang</span></span><span class="chev" aria-hidden="true">›</span></a>';
    h += '<section class="panel"><h2>Tampilan kartu</h2>' + switchRow("showPinyin", "Tampilkan pinyin") + switchRow("showEnglish", "Tampilkan English") + switchRow("toneColors", "Warna nada") +
      '<p class="small mt"><span class="zh"><span class="t1">妈</span> <span class="t2">麻</span> <span class="t3">馬</span> <span class="t4">罵</span> <span class="t5">嗎</span></span> nada 1–4 &amp; netral</p></section>';
    h += '<section class="panel"><h2>Tema</h2>' + segHtml("theme", ["auto", "light", "dark"], ["Otomatis", "Terang", "Gelap"], S.settings.theme) + "</section>";
    h += '<section class="panel"><h2>Kartu baru per hari</h2>' + segHtml("newPerDay", [5, 10, 15, 20, 30], [5, 10, 15, 20, 30], S.settings.newPerDay) + "</section>";
    h += '<section class="panel"><h2>Audio</h2><p class="small muted">Kecepatan bicara</p>' + segHtml("rate", [0.6, 0.7, 0.85, 1, 1.2], ["0.6×", "0.7×", "0.85×", "1×", "1.2×"], S.settings.rate) +
      '<div class="row wrap mt"><button type="button" class="btn soft" data-act="test-voice">' + I("vol") + ' Tes suara</button><span class="small muted">' +
      (st === "none" ? "Tidak ada suara Mandarin terdeteksi" : "Suara: " + esc(TTS.voiceName())) + "</span></div>" + (st !== "tw" ? '<div class="mt">' + ttsHelpHtml().replace('class="panel tip warn"', 'class="tip warn"') + "</div>" : "") + "</section>";
    h += '<section class="panel"><h2>Kartu dari Claude (' + S.custom.length + ")</h2>";
    if (!S.custom.length) h += '<p class="small muted">Belum ada. Impor lewat tab Bicara → Claude.</p>';
    S.custom.forEach(function (c) {
      h += '<div class="deck-row"><div class="grow"><div class="zh" style="font-size:1.15rem">' + esc(c.zh) + '</div><div class="small muted">' + esc(c.py || "") + " " + esc(c.id_meaning || "") + '</div></div>' +
        '<button type="button" class="icon-btn" data-act="cc-del" data-id="' + esc(c.id) + '" aria-label="Hapus kartu">' + I("trash") + "</button></div>";
    });
    h += "</section>";
    h += transferHtml();
    h += '<section class="panel"><h2>Data</h2><button type="button" class="btn danger" data-act="reset-all">Reset semua progres</button></section>';
    h += '<p class="center muted small">華語 B2 Flashcard v' + VERSION + " · " + CARDS.length + " kartu · " + grammarList().length + " pola · " + arr(W.DIALOGUES).length + " dialog</p></div>";
    view(h);
  };
  ACT.set = function (el) {
    var k = el.getAttribute("data-k"), v = el.getAttribute("data-v");
    S.settings[k] = (k === "rate" || k === "newPerDay") ? +v : v;
    save(); applyTheme();
    if (k === "newPerDay") CS.fresh = true;
    rerender();
  };
  CHG["set-bool"] = function (el) { S.settings[el.getAttribute("data-k")] = el.checked; save(); applyTheme(); };
  ACT["test-voice"] = function () { TTS.speak("你好，歡迎來到華語課。今天我們練習開會。", { rate: S.settings.rate }); };
  ACT["cc-del"] = function (el) {
    var id = el.getAttribute("data-id");
    S.custom = S.custom.filter(function (c) { return c.id !== id; });
    delete S.srs["c:" + id];
    save(); rebuildCards(); CS.fresh = true; rerender();
  };
  ACT["reset-all"] = function () {
    confirmModal("Hapus semua progres, pengaturan, dan kartu dari Claude di perangkat ini? Tindakan ini tidak bisa dibatalkan.", "Reset", function () {
      S = defaults(); save(); applyTheme(); rebuildCards(); CS.fresh = true; QZ.qs = null; MX = null; RP = null;
      toast("Progres direset"); go("#/home");
    }, true);
  };

  /* =========================================================
   * 11. Service worker + boot
   * ========================================================= */
  function showUpdateBanner(reg) {
    var root = $("#banner-root");
    if (!root || root.firstChild) return;
    root.innerHTML = '<div class="update-banner"><span>Versi baru tersedia</span><button type="button" class="btn sm" data-act="sw-update">Perbarui</button></div>';
    ACT["sw-update"] = function () {
      var w = reg.waiting || reg.installing;
      if (w) w.postMessage({ type: "SKIP_WAITING" }); else W.location.reload();
    };
  }
  function registerSW() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    var hadController = !!navigator.serviceWorker.controller, reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || reloading) { hadController = true; return; }
      reloading = true; W.location.reload();
    });
    navigator.serviceWorker.register("./sw.js").then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg);
      reg.addEventListener("updatefound", function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", function () {
          if (nw.state === "installed" && navigator.serviceWorker.controller) showUpdateBanner(reg);
        });
      });
    }).catch(function () {});
  }

  function boot() {
    rebuildCards(); applyTheme();
    W.addEventListener("hashchange", route);
    route();
    registerSW();
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", boot); else boot();

  /* test hook (used by the Node smoke test only) */
  W.__mb2 = { parseCards: parseCards, similarity: similarity, makeQ: makeQ };
})();
