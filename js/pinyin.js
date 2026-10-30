/* Pinyin helpers: tone detection, colorizing, tone-mark stripping */
(function (W) {
  "use strict";
  var T1 = "āēīōūǖ", T2 = "áéíóúǘ", T3 = "ǎěǐǒǔǚ", T4 = "àèìòùǜ";
  var PLAIN = { "ā": "a", "á": "a", "ǎ": "a", "à": "a", "ē": "e", "é": "e", "ě": "e", "è": "e", "ī": "i", "í": "i", "ǐ": "i", "ì": "i",
    "ō": "o", "ó": "o", "ǒ": "o", "ò": "o", "ū": "u", "ú": "u", "ǔ": "u", "ù": "u", "ǖ": "ü", "ǘ": "ü", "ǚ": "ü", "ǜ": "ü" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function syllables(str) {
    return String(str || "").toLowerCase().split(/\s+/).filter(function (x) { return x; });
  }
  function toneOf(syl) {
    for (var i = 0; i < syl.length; i++) {
      var c = syl.charAt(i);
      if (T1.indexOf(c) >= 0) return 1;
      if (T2.indexOf(c) >= 0) return 2;
      if (T3.indexOf(c) >= 0) return 3;
      if (T4.indexOf(c) >= 0) return 4;
    }
    return 5;
  }
  function tones(str) { return syllables(str).map(toneOf); }

  function colorize(hanzi, pinyin) {
    var chars = Array.from(String(hanzi || ""));
    var t = tones(pinyin);
    if (!chars.length || chars.length !== t.length) return esc(hanzi);
    return chars.map(function (ch, i) { return '<span class="t' + t[i] + '">' + esc(ch) + "</span>"; }).join("");
  }

  function strip(str) {
    return String(str || "").replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, function (c) { return PLAIN[c] || c; });
  }

  W.Pinyin = { tones: tones, colorize: colorize, strip: strip, esc: esc };
})(typeof window !== "undefined" ? window : this);
