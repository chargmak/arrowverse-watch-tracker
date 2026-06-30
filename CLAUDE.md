# Arrowverse Watch Tracker

> A dark-themed web app to track progress through the entire Arrowverse in the optimal
> chronological watch order — episode-level checkoff, crossover-aware, all stored locally.

## Status — current state & what's next
- **State:** working
- **Last worked on:** ~2026-06-17 (folder timestamp)
- **Next up:** <fill in when you stop work — where you left off>
- **Known issues / blockers:** none tracked

## How to run
- **Prerequisites:** Node.js. No API keys or database — all progress lives in `localStorage`.
- **Install:** `npm install`
- **Run (dev):** `npm run dev` → http://localhost:3000 (port pinned in the `dev` script, host `0.0.0.0`)
- **Build:** `npm run build` → `dist/`; **Preview:** `npm run preview`; **Typecheck:** `npm run lint` (`tsc --noEmit`)
- **Verify it works:** app loads, watch-order phases render, checking an episode persists across reload.

## Tech & architecture
- **Stack:** React 19 + TypeScript · Vite · Tailwind CSS v4 (`@tailwindcss/vite`) · `motion/react` · lucide-react.
- **Entry points:** `index.html` → `src/main.tsx` → `src/App.tsx`.
- **Key files / folders:**
  - `src/data.ts` — the full episode/phase/crossover dataset (the heart of the app; edit here to change watch order).
  - `src/App.tsx` — UI: phases, progress bar, "Up Next", filters, export/import.
  - `metadata.json` — app name/description metadata.
- **How it fits together:** static SPA; state is derived from `data.ts` and persisted to `localStorage`. (Note: `express`/`@google/genai`/`dotenv` are in deps but there's no server in `src` — treat as unused/optional unless a share feature needs them.)

## Conventions & gotchas
- **Local-first.** No backend; progress is browser `localStorage`. Export/Import is the only cross-device path.
- Organized into 11 yearly phases (2012–2023) grouped to minimize series-switching while preserving crossover order — keep that ordering logic intact when editing `data.ts`.
- Tailwind **v4** (CSS-first config), not v3 — no `tailwind.config` class scanning the old way.
