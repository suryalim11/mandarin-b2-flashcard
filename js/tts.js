/* Text-to-speech wrapper: prefers Taiwan Mandarin voices, never Cantonese */
(function (W) {
  "use strict";
  var synth = W.speechSynthesis || null;
  var voice = null, cbs = [], seqToken = 0;
  var PREF = ["meijia", "hanhan", "yating", "zhiwei", "hsiaochen", "hsiaoyu", "mei-jia", "tracy"];

  function isCanto(v) { return /zh[-_]hk|yue|cantonese|sinji|tingting.*hk/i.test((v.lang || "") + " " + (v.name || "")); }
  function norm(l) { return String(l || "").replace("_", "-").toLowerCase(); }

  function pick() {
    if (!synth) { voice = null; return; }
    var vs = [];
    try { vs = synth.getVoices() || []; } catch (e) {}
    var found = null, i, v;
    var tw = vs.filter(function (x) { return norm(x.lang) === "zh-tw" && !isCanto(x); });
    if (tw.length) {
      for (i = 0; i < PREF.length && !found; i++) {
        for (var j = 0; j < tw.length; j++) if (tw[j].name.toLowerCase().indexOf(PREF[i]) >= 0) { found = tw[j]; break; }
      }
      found = found || tw[0];
    }
    if (!found) found = vs.filter(function (x) { return norm(x.lang) === "cmn-hant-tw"; })[0] || null;
    if (!found) {
      found = vs.filter(function (x) { var l = norm(x.lang); return (l === "zh-cn" || l.indexOf("cmn") === 0) && !isCanto(x); })[0] || null;
    }
    if (!found) {
      for (i = 0; i < vs.length; i++) { v = vs[i]; if (norm(v.lang).indexOf("zh") === 0 && !isCanto(v)) { found = v; break; } }
    }
    voice = found;
    for (i = 0; i < cbs.length; i++) { try { cbs[i](); } catch (e) {} }
  }
  if (synth) {
    pick();
    try { synth.addEventListener("voiceschanged", pick); } catch (e) { synth.onvoiceschanged = pick; }
  }

  function status() {
    if (!synth || !voice) return "none";
    var l = norm(voice.lang);
    return (l === "zh-tw" || l === "cmn-hant-tw") ? "tw" : "zh-other";
  }
  function stop() { seqToken++; if (synth) { try { synth.cancel(); } catch (e) {} } }

  function speak(text, opts) { seqToken++; return raw(text, opts); }
  function raw(text, opts) {
    opts = opts || {};
    if (!synth || !text) { if (opts.onend) setTimeout(opts.onend, 0); return false; }
    try { synth.cancel(); } catch (e) {}
    var u = new W.SpeechSynthesisUtterance(String(text));
    u.lang = voice ? voice.lang : "zh-TW";
    if (voice) u.voice = voice;
    u.rate = opts.rate || 0.85;
    var done = false;
    function fin() { if (done) return; done = true; if (opts.onend) opts.onend(); }
    u.onend = fin; u.onerror = fin;
    try { synth.speak(u); } catch (e) { fin(); return false; }
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

  W.TTS = { speak: speak, speakSeq: speakSeq, stop: stop, status: status, voiceName: voiceName, onChange: onChange, supported: !!synth };
})(typeof window !== "undefined" ? window : this);
