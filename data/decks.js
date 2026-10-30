// Daftar dek. kind: "vocab" (data/vocab-*.js), "phrase" (data/phrases.js), "custom" (kartu impor dari Claude)
// mark: satu hanzi sebagai tanda dek di UI (sekaligus bahan hafalan); icon: cadangan lama, tidak dipakai UI
window.DECKS = [
  { "id": "design",    "kind": "vocab",  "mark": "視", "icon": "🎨", "zh": "視覺設計",   "name": "Desain & Visual",       "en": "Visual Design" },
  { "id": "marketing", "kind": "vocab",  "mark": "銷", "icon": "📈", "zh": "行銷",       "name": "Marketing",             "en": "Marketing" },
  { "id": "camera",    "kind": "vocab",  "mark": "攝", "icon": "📷", "zh": "攝影器材",   "name": "Kamera & Foto",         "en": "Camera Gear" },
  { "id": "audio",     "kind": "vocab",  "mark": "音", "icon": "🎙️", "zh": "錄音與音訊", "name": "Audio & Podcast",       "en": "Audio & Podcast" },
  { "id": "post",      "kind": "vocab",  "mark": "剪", "icon": "🎬", "zh": "後製與效果", "name": "Editing & Efek",        "en": "Post-production & FX" },
  { "id": "software",  "kind": "vocab",  "mark": "軟", "icon": "💻", "zh": "軟體與介面", "name": "Software & UI",         "en": "Software & UI" },
  { "id": "work",      "kind": "vocab",  "mark": "職", "icon": "💼", "zh": "職場溝通",   "name": "Komunikasi Kerja",      "en": "Workplace Communication" },
  { "id": "phrases",   "kind": "phrase", "mark": "話", "icon": "💬", "zh": "會話句型",   "name": "Kalimat Percakapan",    "en": "Conversation Phrases" },
  { "id": "claude",    "kind": "custom", "mark": "我", "icon": "🤖", "zh": "我的卡片",   "name": "Dari Claude",           "en": "From Claude (custom)" }
];
