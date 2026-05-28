# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Start
1. Read `.claude/PROGRESS.md` — confirm current focus before any work
2. Read `GOAL.md` if context on product direction or feature prioritization is needed

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Type-check + production build
npm run lint      # Type-check only (tsc --noEmit); no separate linter
npm run preview   # Preview production build locally
```

There is no test suite.

## Environment

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. Vite injects this at build time as `process.env.GEMINI_API_KEY` (see `vite.config.ts`). The `@google/genai` package is a dependency available for Gemini features.

## Architecture

This is a single-page markdown note-taking app called **MarkFlow**. Nearly all logic and UI lives in a single component: [src/App.tsx](src/App.tsx).

**State** — Notes are persisted to `localStorage` under the key `markflow_notes`; theme (`light`/`dark`) under `markflow_theme`. There is no backend or external data store.

**Note title** — Auto-derived from the first line of content by stripping leading `#` heading markers and truncating to 40 characters. Updating the `<textarea>` triggers `updateNote()`, which sets title, content, and `updatedAt` atomically.

**Dark mode** — Toggling theme adds/removes the `dark` class on `<html>`. Tailwind v4 uses `@variant dark (&:where(.dark, .dark *))` in `index.css` — not the standard `darkMode: 'class'` config key.

**Markdown rendering** — The preview pane renders via `react-markdown` + `remark-gfm`. Prose styles are hand-rolled in `index.css` under `.prose` (no `@tailwindcss/typography` plugin).

**Animations** — Sidebar collapse and editor/preview transitions use `motion/react` (`AnimatePresence` + `motion.div`/`motion.aside`).

## Styling

Tailwind v4 is used with the Vite plugin (`@tailwindcss/vite`). Configuration is done via CSS (`@theme` block in `index.css`) rather than `tailwind.config.*`. The orange accent palette and Fira Code monospace font are defined there.

The `cn()` helper in [src/lib/utils.ts](src/lib/utils.ts) combines `clsx` and `tailwind-merge`.
