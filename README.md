# MarkFlow

A fast, minimal markdown editor that works with both local browser notes and real files on your disk.

## Features

- **Open any folder** — browse `.md` files in a collapsible folder tree via the File System Access API
- **Edit & auto-save** — changes save back to the original file automatically (1s debounce)
- **Local notes** — create quick notes stored in your browser's localStorage, no folder needed
- **Live preview** — toggle between editor and rendered markdown (GitHub Flavored Markdown)
- **Dark / light mode** — persisted across sessions
- **Search** — filter local notes by title or content
- **Session restore** — reopens the last folder automatically on refresh (with browser permission)

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- Zustand (state management)
- react-markdown + remark-gfm (markdown rendering)
- motion/react (animations)
- idb-keyval (IndexedDB for folder handle persistence)

## Getting Started

```bash
npm install
npm run dev        # dev server at http://localhost:3000
```

## Build

```bash
npm run build      # outputs static files to dist/
npm run preview    # preview the production build locally
```

The `dist/` folder is fully static — deploy it to any static host (Nginx, Caddy, GitHub Pages, Netlify, Vercel, etc.) with no server-side runtime required.

## Environment

Copy `.env.example` to `.env.local` if you need to set environment variables.

```bash
cp .env.example .env.local
```

## Browser Support

The **Open Folder** feature requires the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API), supported in Chrome and Edge. The button is hidden automatically on unsupported browsers — local notes work everywhere.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | TypeScript type-check only |
| `npm run preview` | Preview production build |
