/* SM-2 style spaced repetition, date based (local dates "YYYY-MM-DD") */
(function (W) {
  "use strict";
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function today() { return fmt(new Date()); }
  function addDays(dateStr, n) {
    var d = parse(dateStr) || new Date();
    d.setDate(d.getDate() + n);
    return fmt(d);
  }
  function fresh() { return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: today(), last: "" }; }

  function rate(state, grade, now) {
    var t = now || today();
    var s = state ? { ease: state.ease || 2.5, interval: state.interval || 0, reps: state.reps || 0, lapses: state.lapses || 0, due: state.due, last: state.last } : fresh();
    if (grade <= 0) {
      s.reps = 0; s.lapses += 1; s.interval = 0; s.ease = Math.max(1.3, s.ease - 0.2);
    } else if (grade === 1) {
      s.interval = s.reps === 0 ? 1 : Math.max(1, Math.round(s.interval * 1.2));
      s.ease = Math.max(1.3, s.ease - 0.15); s.reps += 1;
    } else if (grade === 2) {
      s.interval = s.reps === 0 ? 1 : s.reps === 1 ? 3 : Math.round(s.interval * s.ease);
      s.reps += 1;
    } else {
      s.interval = s.reps === 0 ? 3 : Math.round(s.interval * s.ease * 1.3);
      s.ease += 0.15; s.reps += 1;
    }
    s.ease = Math.round(s.ease * 100) / 100;
    s.due = addDays(t, s.interval);
    s.last = t;
    return s;
  }
  function isDue(state, t) { return !!state && !!state.due && state.due <= (t || today()); }
  function label(days) {
    if (days <= 0) return "segera";
    if (days < 7) return days + "h";
    if (days < 30) return Math.round(days / 7) + "mg";
    if (days < 365) return Math.round(days / 30) + "bln";
    return (Math.round(days / 36.5) / 10) + "th";
  }
  function nextIntervalLabel(state, grade) { return label(rate(state, grade).interval); }

  W.SRS = { today: today, addDays: addDays, parse: parse, fmt: fmt, fresh: fresh, rate: rate, isDue: isDue, nextIntervalLabel: nextIntervalLabel };
})(typeof window !== "undefined" ? window : this);
