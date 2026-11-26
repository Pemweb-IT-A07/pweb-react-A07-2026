# Aku Mw Magang

Aplikasi React untuk membantu Kapten mengelola proses lamaran magang: eksplorasi lowongan + Skill Match, War Room pipeline lamaran (state machine, checklist, activity log, interview prep timer, deteksi ghosting & bentrok jadwal), dan Offer Comparator.

Praktikum Pemrograman Web Modul 5 — Kelompok A07.

**Demo:** https://pemweb-it-a07.github.io/pweb-react-A07-2026/

## Tech stack

- React 19 + TypeScript (`strict: true`, tanpa `any`)
- Vite (template `react-ts`)
- CSS murni (tanpa library UI)
- Tanpa library state management / form: semua state, fetch, form, timer, dan penyimpanan lokal memakai React Hooks bawaan + custom hooks.

## Menjalankan

```bash
npm install
npm run dev        # development server
npx tsc --noEmit   # cek tipe
npm run build      # build produksi
npm run lint       # oxlint
```

## Deploy

Setiap push ke `main` otomatis di-build dan di-deploy ke GitHub Pages lewat `.github/workflows/deploy-pages.yml` (type check → lint → build → deploy). Base path diambil dari `actions/configure-pages` dan diteruskan ke Vite lewat env `BASE_PATH`. Deploy manual: tab **Actions → Deploy to GitHub Pages → Run workflow**.

## Struktur folder

```
public/
  magang-fallback.json   15 lowongan magang tech Indonesia (format Remotive)
src/
  components/            komponen UI (Navbar, JobExplorer, PipelineView, ApplicationDetailModal, ...)
  hooks/                 custom hooks: useLocalStorage, useDebounce, useJobs, useNow, useTheme, useSlashFocus
  services/jobService.ts Remotive API + fallback lokal
  types/                 interface Application, JobListing, dll.
  utils/                 fungsi murni: state machine, skill match, bentrok, ghosting, skor offer, duplikat, statistik
  App.tsx                state utama (applications, kaptenSkills) + handler immutable + Undo delete
```

## Fitur

| # | Fitur | Lokasi utama |
|---|---|---|
| 1 | Profil Skill & Eksplorasi Lowongan (fetch + AbortController, Loading/Error/Kosong, `useDebounce(keyword, 400)`, badge Match %) | `SkillProfile`, `JobExplorer`, `JobCard`, `useJobs` |
| 2 | Form Tambah Lamaran Manual (terkontrol, validasi, auto-focus `useRef`) | `ApplicationForm` |
| 3 | War Room Pipeline, Simulasi +15 Hari, Banner Bentrok | `PipelineView`, `ApplicationCard`, `ConflictBanner` |
| 4 | Detail Lamaran: state machine, nested checklist, activity log | `ApplicationDetailModal`, `StatusTransitionPanel`, `ChecklistPanel`, `ActivityLogPanel` |
| 5 | Interview Prep Timer 02:00 dengan cleanup `clearInterval` | `InterviewPrepTimer` |
| 6 | Undo Delete 5 detik (timer di `useRef`) & persistensi `useLocalStorage` | `App.tsx`, `Toast` |
| 7 | Dashboard Statistik & Offer Comparator | `StatsCards`, `OfferComparator`, `utils/stats.ts`, `utils/offer.ts` |
| Bonus | Dark mode (`useLocalStorage`) + shortcut `/` fokus search (`useRef`) | `useTheme`, `useSlashFocus` |

## State machine status

```
WISHLIST -> APPLIED -> SCREENING -> INTERVIEW -> OFFER
APPLIED / SCREENING / INTERVIEW -> REJECTED | GHOSTED
GHOSTED -> SCREENING
OFFER & REJECTED final
```

Syarat: ke APPLIED wajib `cvVersion` & `appliedDate`; ke INTERVIEW wajib `interviewDateTime`; ke OFFER wajib `salaryOffer > 0` & `workMode`.
