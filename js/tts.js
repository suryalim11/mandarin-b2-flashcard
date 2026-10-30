/* Text-to-speech wrapper: prefers Taiwan Mandarin voices, never Cantonese */
(function (W) {
  "use strict";
  var synth = W.speechSynthesis || null;
  var voice = null, cbs = [], seqToken = 0, lastError = "";
  var PREF = ["meijia", "hanhan", "yating", "zhiwei", "hsiaochen", "hsiaoyu", "mei-jia", "tracy"];

  function isCanto(v) { return /zh[-_]hk|yue|cantonese|sinji|tingting.*hk/i.test((v.lang || "") + " " + (v.name || "")); }
  function norm(l) { return String(l || "").replace(/_/g, "-").toLowerCase(); }
  // Android (Google TTS) melaporkan Mandarin Taiwan sebagai "cmn-TW"; browser lain "zh-TW", "zh-Hant-TW", "zh_TW"
  function isTw(v) {
    var l = norm(v.lang);
    if (l === "zh-tw" || l === "cmn-tw" || l === "cmn-hant-tw" || l === "zh-hant-tw" || l === "zh-hant") return true;
    return (l === "zh" || l === "cmn") && /taiwan|台灣|臺灣|國語/i.test(v.name || "");
  }
  function isMandarin(v) { var l = norm(v.lang); return (l.indexOf("zh") === 0 || l.indexOf("cmn") === 0) && !isCanto(v); }

  function pick() {
    if (!synth) { voice = null; return; }
    var vs = [];
    try { vs = synth.getVoices() || []; } catch (e) {}
    var found = null, i;
    var tw = vs.filter(function (x) { return isTw(x) && !isCanto(x); });
    if (tw.length) {
      for (i = 0; i < PREF.length && !found; i++) {
        for (var j = 0; j < tw.length; j++) if (tw[j].name.toLowerCase().indexOf(PREF[i]) >= 0) { found = tw[j]; break; }
      }
      // utamakan suara lokal (offline) bila ada
      found = found || tw.filter(function (x) { return x.localService; })[0] || tw[0];
    }
    if (!found) found = vs.filter(isMandarin)[0] || null;
    voice = found;
    for (i = 0; i < cbs.length; i++) { try { cbs[i](); } catch (e) {} }
  }
  if (synth) {
    pick();
    try { synth.addEventListener("voiceschanged", pick); } catch (e) { synth.onvoiceschanged = pick; }
  }

  function status() {
    if (!synth || !voice) return "none";
    return isTw(voice) ? "tw" : "zh-other";
  }
  function stop() { seqToken++; if (synth) { try { synth.cancel(); } catch (e) {} } }

  function speak(text, opts) { seqToken++; return raw(text, opts); }
  function raw(text, opts) {
    opts = opts || {};
    if (!synth || !text) { if (opts.onend) setTimeout(opts.onend, 0); return false; }
    // Chrome Android: cancel() lalu speak() seketika sering membuat ucapan baru diam → cancel hanya jika sedang bicara, beri jeda
    var busy = false;
    try { busy = synth.speaking || synth.pending; } catch (e) {}
    if (busy) { try { synth.cancel(); } catch (e) {} }
    var u = new W.SpeechSynthesisUtterance(String(text));
    var v = opts.noVoice ? null : voice;
    u.lang = v ? String(v.lang).replace(/_/g, "-") : "zh-TW";
    if (v) u.voice = v;
    u.rate = opts.rate || 0.85;
    var done = false;
    function fin(ev) { if (done) return; done = true; if (ev && ev.error) lastError = ev.error; if (opts.onend) opts.onend(); }
    u.onend = fin; u.onerror = fin;
    function go() {
      try { if (synth.paused) synth.resume(); synth.speak(u); } catch (e) { lastError = String(e && e.message || e); fin(); }
    }
    if (busy) setTimeout(go, 120); else go();
    return true;
  }

  function speakSeq(texts, opts) {
    opts = opts || {};
    var tok = ++seqToken, i = 0, gap = opts.gapMs == null ? 500 : opts.gapMs;
    function next() {
      if (tok !== seqToken) return;
      if (i >= texts.length) { if (opts.onDone) opts.onDone(); return; }
      var idx = i++;
      if (opts.onItem) opts.onItem(idx);
      raw(texts[idx], { rate: opts.rate, onend: function () { if (tok === seqToken) setTimeout(next, gap); } });
    }
    next();
  }

  function voiceName() { return voice ? voice.name + " (" + voice.lang + ")" : ""; }
  function onChange(cb) { cbs.push(cb); }

  // diag: apa yang benar-benar dilihat browser (untuk panel Diagnostik suara)
  function diag() {
    var vs = [];
    try { vs = synth ? synth.getVoices() || [] : []; } catch (e) {}
    return {
      supported: !!synth, total: vs.length, chosen: voiceName(), status: status(), lastError: lastError,
      zh: vs.filter(function (x) { return isMandarin(x) || isCanto(x); }).map(function (x) {
        return { name: x.name, lang: x.lang, local: !!x.localService, tw: isTw(x), canto: isCanto(x) };
      })
    };
  }
  // refresh: baca ulang daftar suara (dipakai tombol "Cek lagi" setelah pengguna memasang suara)
  W.TTS = { speak: speak, speakSeq: speakSeq, stop: stop, status: status, voiceName: voiceName, onChange: onChange, refresh: pick, diag: diag, supported: !!synth };
})(typeof window !== "undefined" ? window : this);
