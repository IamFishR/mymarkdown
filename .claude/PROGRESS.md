# MarkFlow — Progress

## Mission
A browser-native markdown editor that reads and writes real files on disk, browses GitHub repos, and integrates AI writing assistance — with zero account required.

## Competitive Moat
Browser-native + real file editing via FSA API + GitHub repo browsing + Gemini AI. No competitor holds all four without requiring an account.

## Definition of Done
AI writing features shipped · full-text folder search working · export (PDF + HTML) live · PWA installable · first external users using it daily

## Logic for Success
Nail the zero-friction promise: every feature must work without signing up. Ship AI before competitors realize the gap.

---

## Sections

### Core Editing
- [x] Local notes (browser storage, no setup)
- [x] Raw editor (textarea, monospace font)
- [x] Visual editor (Tiptap rich editor, GFM)
- [x] Editor/Visual mode toggle
- [x] BubbleMenu (highlight, bold, italic, strike, code)
- [x] EditorToolbar (H1–H3, bold, italic, strike, code, lists, blockquote)
- [x] Word count + reading time in footer
- [x] Save status indicator (saving / saved / idle)

### File System
- [x] Open Folder (File System Access API)
- [x] Collapsible folder tree
- [x] Auto-save to disk (debounced 1.5s idle + 5s max)
- [x] Session restore (IndexedDB persists folder handle across reloads)
- [x] Create new file inside any directory
- [x] Refresh folder tree without closing folder
- [ ] Full-text search across folder files
- [ ] Image drag-drop → save as file + relative path in markdown

### GitHub & URL
- [x] Load any GitHub repo by URL → read-only `.md` tree
- [x] Direct `.md` URL loading
- [x] Read-only mode (toolbar + editing disabled)
- [x] `.git` URL suffix handled automatically
- [ ] GitHub write-back (commit edits via GitHub API)

### Navigation & History
- [x] Recent section — last 15 folders / repos / URLs
- [x] One-click reopen from history
- [x] Per-entry dismiss (hover + ×)
- [x] Clear all history
- [ ] Table of contents panel (parse headings, scroll-to)

### AI Features
- [x] `@google/genai` installed, `GEMINI_API_KEY` wired in env
- [ ] AI Rewrite / Improve (select text → bubble menu → improve)
- [ ] AI Summarize (sidebar button → insert summary blockquote)
- [ ] AI Generate from prompt (empty note → first draft)

### Search
- [x] Search local notes (title + content, in-memory)
- [ ] Full-text search across folder files (FS-level scan)
- [ ] Find & Replace (Cmd+H floating bar)

### Export
- [ ] Export to PDF (print stylesheet)
- [ ] Export to HTML (self-contained file download)

### Interface & UX
- [x] Dark / light mode, persisted across sessions
- [x] Responsive layout + mobile sidebar overlay
- [x] Animated sidebar (spring physics via motion/react)
- [x] Background gradient blobs
- [x] App version auto-bump on commit (pre-commit hook)
- [ ] Keyboard shortcuts reference modal (? key)
- [ ] PWA manifest + service worker (offline-first, installable)

---

## Current Focus
> AI writing features — ship Gemini integration (rewrite/improve, summarize, generate)

## Resume Here
What's next: create a Gemini API proxy in `server.ts`, add an `useAIStore` for state, wire the "Improve" button into the BubbleMenu and a "Summarize" button in the sidebar footer
Blocker: none
Last updated: 2026-05-28
