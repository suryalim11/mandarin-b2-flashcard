# 華語 B2 Flashcard

Aplikasi flash card Mandarin **offline** untuk persiapan **TOCFL Band B Level 4 (B2)**. Fokusnya pada dunia kerja komunikasi visual & marketing: desain, kamera, mikrofon/podcast, efek audio-video, dan software. Ada latihan **percakapan** khusus untuk melatih kemampuan bicara.

- Aksara Tradisional (繁體) + pinyin, istilah dan lafal Taiwan
- 338 kosakata (7 dek) · 76 kalimat percakapan · 44 pola grammar · 16 skenario dialog kerja
- Spaced repetition, warna nada, pecah kata + jembatan ingatan, audio TTS
- Roleplay, shadowing, dan prompt "Latihan dengan Claude" (memakai akun Claude sendiri)

## Pasang

| Perangkat | Cara |
|---|---|
| iPhone / iPad | Buka link GitHub Pages di **Safari** → tombol Share → **Add to Home Screen**. Setelah dibuka sekali, app bisa dipakai offline. |
| Windows | Buka link di Chrome/Edge → ikon **Install app** di address bar. Bisa juga klik dua kali `index.html` dari folder ini. |

Audio memakai suara bawaan perangkat:
- **iOS**: Settings → Accessibility → Spoken Content → Voices → Chinese (Taiwan).
- **Windows**: Settings → Time & language → Language → tambah 中文(台灣).

Progres tersimpan **per perangkat**. Untuk memindahkannya, gunakan menu *Beranda → Pindah progres* (salin kode atau file .json).

## Struktur

```
index.html  sw.js  manifest.webmanifest  css/  js/  icons/
data/decks.js  vocab-a.js  vocab-b.js  phrases.js  grammar.js  dialogues-a.js  dialogues-b.js  prompts.js
```

Tidak ada build step. Setelah mengubah file, **naikkan versi `CACHE` di `sw.js`** supaya perangkat yang sudah memasang app mendapat versi baru.
