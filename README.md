# Arrowverse Watch Tracker

A clean, dark-themed web app to track your progress through the entire Arrowverse in the optimal chronological watch order — so you never miss a crossover or watch things out of sequence.

## What it does

- **Chronological watch order** — Episodes are organized into 11 yearly phases (2012–2023), grouped into logical blocks to minimize constant series-switching while keeping you in sync for all major crossovers.
- **Episode-level tracking** — Check off individual episodes as you watch them. Progress is saved automatically to your browser's local storage.
- **Overall progress bar** — See your total completion percentage across all series at a glance.
- **"Up Next" widget** — Always shows the very next episode you need to watch.
- **Phase navigation** — Jump to any year/phase instantly via the sidebar.
- **Series filters** — Hide any series you don't want to watch (e.g. skip Constantine or Black Lightning).
- **Mark whole phases or blocks complete** — Bulk-check entire seasons or crossover events at once.
- **Trailer links** — Each season and crossover includes a quick link to search its trailer on YouTube.
- **Export / Import progress** — Copy your progress to clipboard and restore it on another device.
- **Reset** — Start fresh with a single click.

## Series covered

Arrow, The Flash, Supergirl, Legends of Tomorrow, Batwoman, Black Lightning, Superman & Lois, Constantine, and all major crossover events (Flash vs. Arrow, Invasion!, Crisis on Earth-X, Elseworlds, Crisis on Infinite Earths, Armageddon, and more).

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion (via `motion/react`)
- Lucide React icons

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API keys or database required — all progress is stored in `localStorage`.
