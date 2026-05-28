# MarkFlow — Product Goal

## North Star

**Build the best browser-native markdown editor. Fast, beautiful, and works with your actual files — not a silo.**

The unique position: runs entirely in the browser, reads and writes real `.md` files on disk via the File System Access API, browses GitHub repos without a backend, and integrates AI writing assistance — all with zero account required.

---

## Where We Are (May 2026)

**Core editing loop is complete. File system + GitHub reading are solid.**

| Capability | Status |
|---|---|
| Local notes (browser storage, no setup) | ✓ Done |
| Open Folder — browse `.md` files in tree, auto-save to disk | ✓ Done |
| Session restore — folder handle persisted in IndexedDB | ✓ Done |
| Create new file inside any directory | ✓ Done |
| Refresh tree without closing folder | ✓ Done |
| GitHub repo browser — read-only, full `.md` tree | ✓ Done |
| Direct URL loading — any raw `.md` URL | ✓ Done |
| Recent history — last 15 folders/repos/URLs, one-click reopen | ✓ Done |
| Raw editor (textarea, monospace) | ✓ Done |
| Visual editor (Tiptap, GFM, bubble menu, toolbar) | ✓ Done |
| Dark / light mode, persisted | ✓ Done |
| Search across local notes | ✓ Done |
| Word count + reading time | ✓ Done |
| Save status indicator | ✓ Done |
| Responsive layout + mobile sidebar overlay | ✓ Done |
| Animated sidebar (spring physics) | ✓ Done |
| App version auto-bump on commit | ✓ Done |
| Gemini AI package wired up (`@google/genai`, env key) | ✓ Done |

---

## Phase A — Best In-Browser Markdown Editor (Now → ~6 months)

### What "best" actually means

Not feature count. The bar is: **a writer can manage their entire markdown workflow — local files, GitHub notes, and AI assistance — without leaving the browser and without signing up for anything.**

The competitors have hard ceilings:
- **Obsidian**: Electron app, not browser-native. No GitHub browsing. Plugin ecosystem is powerful but heavy.
- **Notion**: Requires account, proprietary format, no `.md` file compatibility.
- **Typora**: Desktop-only, no cloud, no AI.
- **StackEdit**: Browser-based but no File System API, no GitHub file tree, dated UI.
- **HackMD / CodiMD**: Collaboration-first; overkill for solo writing, requires account.

**Our moat**: browser-native + real file editing + GitHub browsing + AI writing assist. No competitor holds all four in a single no-account app.

---

### Phase A Features

**Priority 1 — AI Writing Assistance (Gemini is wired, ship it)**

1. **AI Rewrite / Improve**
   - Select text → bubble menu → "Improve with AI"
   - Send selection + surrounding paragraph to Gemini Flash
   - Show diff overlay: original vs. suggested — accept/reject
   - Use `GEMINI_API_KEY` already in env; `@google/genai` already in deps

2. **AI Summarize**
   - Sidebar button: "Summarize this file"
   - Generates a 3–5 sentence summary, inserted at top as blockquote
   - Works in local-notes mode and folder mode

3. **AI Generate from Prompt**
   - Empty note → placeholder button "Generate with AI"
   - User types a prompt; Gemini writes the first draft
   - Replaces placeholder content; user edits from there

**Priority 2 — Search & Navigation**

4. **Full-text search across folder files**
   - Current search only covers local notes (title + content in memory)
   - Folder mode: search by reading each `.md` file on query
   - Show match count per file; jump to first hit on open
   - Debounced, runs on the FS handle already held

5. **Table of Contents panel**
   - Parse `#` headings from active file
   - Show as collapsible panel below file list in sidebar
   - Click heading → scroll editor to that position
   - Stays in sync as you type (debounced heading parse)

**Priority 3 — Content & Export**

6. **Export to PDF**
   - "Export" button in toolbar → prints rendered preview via `window.print()`
   - CSS `@media print` stylesheet already partially implied by `.prose` styles
   - No dependencies needed; ship with the existing render pipeline

7. **Export to HTML**
   - Download rendered HTML as a self-contained `.html` file
   - Inline the prose CSS; wrap in minimal `<html>` shell
   - Useful for sharing a single polished document

8. **Image paste & drag-drop**
   - Paste or drag image into editor → convert to base64 data URL embedded in markdown
   - In folder mode: save image as a file alongside the `.md` and use relative path
   - Tiptap Image extension is available in the ecosystem; wire it up

**Priority 4 — Polish & Power**

9. **Find & Replace**
   - `Cmd/Ctrl + H` opens a floating find/replace bar
   - Works in raw editor mode (textarea)
   - In visual mode: use Tiptap's find extension or implement in raw mode only

10. **Keyboard shortcuts reference**
    - `?` key → modal with all shortcuts
    - Include: mode toggle, sidebar toggle, new note, search focus, save

---

## Phase B — Collaboration & Sharing (6–18 months)

| Feature | What It Enables |
|---|---|
| **Share via link** | Generate a read-only URL for any note (short-lived signed URL, no backend needed via hash-based encoding) |
| **GitHub write-back** | Commit edits back to a GitHub repo (requires OAuth; saves as a new commit) |
| **Note tagging** | Add `#tags` to notes for grouping; sidebar tag filter |
| **PWA / installable** | Add `manifest.json` + service worker for offline-first and home-screen install |
| **Multiplayer editing** | Real-time CRDT collaboration via Yjs + server relay (requires backend) |
| **Note templates** | Pre-fill new notes from user-defined templates |

---

## Technical Debt (Address Before Phase A Ships)

| Debt | Risk | Fix |
|---|---|---|
| Gemini API called client-side with key exposed in `import.meta.env` | Key leaks in browser via network inspector | Proxy calls through `server.ts` express endpoint |
| Search only covers notes in memory | Users with 100s of folder files get zero search | Implement FS-based search with `FileSystemDirectoryHandle.values()` |
| No keyboard shortcut system | Power users blocked, inconsistent Cmd+S etc. | Central `useKeyboardShortcuts` hook, document in `?` modal |
| `useAppStore` mixes theme + notes + UI state | Grows unbounded, hard to split | Separate `useEditorStore` for per-session ephemeral state |
| `EditorToolbar` uses hand-rolled `AnyEditor` type instead of Tiptap's `Editor` | Type safety gap, breaks on Tiptap updates | Import `Editor` type from `@tiptap/core` |
| Visual editor toolbar only renders in `isPreviewMode` (naming is inverted — "preview" = visual/rich) | Confusing naming leads to bugs | Rename `isPreviewMode` → `isVisualMode` |

---

## Decision Framework

When evaluating any feature or PR, ask these in order:

1. **Does it make a writer's daily workflow faster?** (Core editing quality)
2. **Does it work without an account or internet?** (Our zero-friction promise)
3. **Does it use existing infrastructure (FS API, Tiptap, Gemini)?** (No new deps unless justified)
4. **Does it respect the file as the source of truth?** (No proprietary format lock-in)
5. **Does it introduce tech debt we'll pay for later?** (Only if justified by user value)

If a feature doesn't answer yes to at least one of 1–4, defer it.

---

## Competitive Moat Summary

```
                      Browser   Real File   GitHub    AI        Zero
                      Native    Editing     Browse    Assist    Account
───────────────────────────────────────────────────────────────────────
Obsidian               ✗         ✓           ✗         ✗         ✓
Notion                 ✓         ✗           ✗         ✓         ✗
Typora                 ✗         ✓           ✗         ✗         ✓
StackEdit              ✓         ✗           ✗         ✗         ✓
MarkFlow (goal)        ✓         ✓           ✓         ✓         ✓
```

We win when we hold all five columns. Build in that order.

---

*Last updated: May 2026. Revisit when a phase completes or a major pivot occurs.*
