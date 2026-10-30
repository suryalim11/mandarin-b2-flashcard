/* Service worker: precache app shell + data, stale-while-revalidate. Bump CACHE to ship updates (banner "Versi baru tersedia"). */
const CACHE = "mb2-v8";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./css/style.css", "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  "./js/pinyin.js", "./js/srs.js", "./js/tts.js", "./js/app.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png", "./icons/qr-app.svg", "./icons/qr-app.png"];
const DATA = ["./data/decks.js", "./data/vocab-a.js", "./data/vocab-b.js", "./data/phrases.js", "./data/grammar.js",
  "./data/dialogues-a.js", "./data/dialogues-b.js", "./data/prompts.js"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map((u) => new Request(u, { cache: "reload" })));
    // data files are cached individually so one missing file cannot break the install
    await Promise.all(DATA.map((u) => cache.add(new Request(u, { cache: "reload" })).catch(() => {})));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // stale-while-revalidate: jawab dari cache (cepat, offline jalan), lalu perbarui cache dari jaringan
  // di belakang layar. File yang sempat tersimpan basi (CDN belum sinkron saat deploy) pulih di pembukaan berikutnya.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req, { cache: "no-cache" }).then((res) => {
      if (res && res.ok && res.type === "basic") cache.put(req, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    const res = await network;
    if (res) return res;
    if (req.mode === "navigate") {
      const fallback = await cache.match("./index.html");
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
