# Verba v2 — Word Garden English Vocabulary Platform

Platform belajar kosakata bahasa Inggris offline-first untuk pembelajar Indonesia dengan konsep **Word Garden**: bank kosakata yang tumbuh dari kata-kata yang kamu temukan sendiri, dengan sistem lapisan terkunci (*unlock layers*), jadwal spaced repetition FSRS v4 modern, sistem streak tahan banting, maskot Pucuk, 7 dunia kebun, serta dukungan widget Android native.

---

## 🌿 Fitur & Arsitektur (Sesuai PRD)

1. **Konsep Word Garden & Siklus Belajar:**
   - **🌱 Seed:** Kata baru yang ditemukan (dari sinonim/antonim kata lain) yang belum diklaim.
   - **🌿 Sprout:** Kata yang telah diklaim dengan arti sendiri dan kalimat contoh, aktif masuk jadwal review FSRS.
   - **🌳 Grown:** Kata dengan stabilitas memori FSRS $\ge 14$ hari.
   - **🌸 Bloom:** Kata yang lulus tes produksi kalimat dan dikuasai secara komprehensif.

2. **Lapisan Materi Terkunci (Tanpa Bocoran):**
   - Definisi resmi, contoh kalimat, sinonim, antonim, kolokasi, tata bahasa (bentuk V1/V2/V3), dan catatan kesalahan umum terkunci di awal.
   - Buka slot melalui tebakan mandiri, bantuan hint bertahap, atau kuis harian.
   - Membuka sinonim atau antonim otomatis menanam kata tersebut sebagai **Seed baru 🌱** di kebunmu!

3. **Mesin Penjadwalan FSRS v4 Modern (`src/lib/fsrs.ts`):**
   - Menghitung stabilitas ($S$), kesulitan ($D$), dan interval retensi 90% secara akurat.
   - Mendukung rating *Again*, *Hard*, *Good*, *Easy*.

4. **Sistem Streak Harian Berbasis Tanggal Kalender (`src/lib/streak.ts`):**
   - Dihitung dari tanggal kalender lokal (`YYYY-MM-DD`), bebas dari bug milidetik / zona waktu.
   - Pelindung streak (*Streak Freeze*) otomatis aktif saat 1 hari terlewat (maksimal 2 freeze, didapat tiap 7 hari streak).
   - Penentuan status widget mandiri (*completed today*, *threatened*, *broken*, *just started*).

5. **Aset Visual Orisinal (Crafted SVGs):**
   - **Maskot Pucuk (`MascotPucuk.tsx`):** Tunas mungil dengan evolusi aksesori (Topi Daun, Syal Hangat, Tas Petualang, Pose Perayaan).
   - **Banner Dunia Dinamis (`BannerDunia.tsx`):** Scene berlapis untuk *Hutan Pagi*, *Tepi Danau*, dan *Padang Bunga* dengan pencahayaan langit mengikuti jam perangkat (Pagi, Siang, Senja, Malam).
   - **Ikon Status Botani (`StatusIcons.tsx`):** Vektor Seed, Sprout, Grown, dan Bloom.

6. **Integrasi Mobile & Widget Android (`android/`):**
   - Plugin Capacitor kustom `WidgetBridgePlugin.java`.
   - `VerbaWidgetProvider.java` untuk widget home screen ukuran 2×2 dan 4×2.
   - Deep link `verba://today` untuk langsung membuka sesi belajar harian.

7. **Backend Supabase & AI Proxy (`supabase/`):**
   - Skema Postgres dengan Row Level Security (RLS) dan tabel undangan `allowed_emails`.
   - Edge Function `ai-proxy` dengan rate-limiting harian per user dan fallback model cascade OpenRouter.
   - Validasi skema keluaran terstruktur dengan Zod.

---

## 🚀 Menjalankan Proyek

### 1. Mode Development Web
```bash
bun run dev
# atau:
npm run dev
```
Akses di browser melalui `http://localhost:3000`.

### 2. Build Static Export (Siap Deploy & Capacitor)
```bash
bun run build
# atau:
npm run build
```
Hasil build statis akan dihasilkan di folder `out/`.

### 3. Sinkronisasi ke Android (Capacitor)
```bash
bunx cap sync android
```
Buka Android Studio:
```bash
bunx cap open android
```

---

## 📁 Struktur Direktori

```
Antigravity-space/
├── android/                   # Proyek Android native, Widget Provider & Layouts
├── public/                    # Aset statis PWA & Web Manifest
├── src/
│   ├── app/                   # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   ├── components/
│   │   ├── assets/            # Komponen Vektor SVG (BannerDunia, MascotPucuk, StatusIcons)
│   │   └── verba/             # Komponen UI Word Garden (KartuKata, SlotTerkunci, LembarTantangan, dll.)
│   └── lib/
│       ├── ai.ts              # Evaluator & Zod Schemas
│       ├── db.ts              # Dexie IndexedDB Database
│       ├── fsrs.ts            # FSRS v4 Scheduler
│       ├── streak.ts          # Kalender Streak & Freeze Logic
│       ├── widget.ts          # Widget Snapshot Bridge
│       ├── worlds.ts          # Skema 7 Dunia Kebun
│       └── dict/              # Kamus Bundel Lokal & Normalizer
├── supabase/                  # Skema SQL, RLS, & Edge Function proxy OpenRouter
├── capacitor.config.ts        # Konfigurasi Capacitor Mobile
└── next.config.ts             # Konfigurasi Static Export Next.js
```
