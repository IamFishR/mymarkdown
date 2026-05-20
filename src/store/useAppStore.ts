import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, Theme } from '../types';

const WELCOME_CONTENT = `# Welcome to MarkFlow

> A fast, minimal markdown editor that lives in your browser — and respects your files.

---

## Getting Started

You're looking at a **local note** right now — stored in your browser. No account, no cloud, no tracking.

**Three ways to work with markdown in MarkFlow:**

1. **Local notes** — write directly here, stored in your browser, no setup needed
2. **Open Folder** — pick a folder on your machine and browse all your \`.md\` files in a tree
3. **From URL** — paste a GitHub repo link or any direct \`.md\` URL and read it instantly

---

## Features

### Writing & Editing
- **Local notes** — create quick scratch notes stored in the browser, no folder needed
- **Open Folder** — browse your local \`.md\` files in a collapsible folder tree
- **Auto-save to disk** — edits write back to the original file automatically after you stop typing
- **Session restore** — reopen the browser and your last folder is restored automatically
- **Live preview** — toggle between raw markdown and rendered visual output at any time
- **GitHub Flavored Markdown** — tables, strikethrough, task lists, fenced code blocks, all supported

### URL & GitHub Reading
- **From URL** — paste any GitHub repo URL (e.g. \`github.com/owner/repo\`) to browse all its \`.md\` files in a folder tree
- **Direct file URL** — paste a link to any raw \`.md\` file to open it immediately
- **Read-only mode** — URL-sourced content is protected from accidental edits; toolbar and editing are disabled
- **Supports \`.git\` URLs** — clone-style links like \`github.com/owner/repo.git\` work too

### Navigation & History
- **Recent section** — sidebar remembers your last 15 opened folders, GitHub repos, and URLs
- **One-click reopen** — click any GitHub or URL history entry to reload it instantly
- **Per-entry dismiss** — hover an entry and hit × to remove it from history
- **Clear all** — wipe the entire history with one click

### Interface
- **Dark & light mode** — toggle in the top right, preference saved across sessions
- **Search** — filter your local notes by title or content instantly
- **Context Menu** — select any text to see a floating toolbar with highlighting and formatting options
- **Works offline** — no internet required after the page loads (except URL/GitHub features)

---

## From URL — How It Works

Click **From URL** in the sidebar footer and paste:

| Input | Result |
|---|---|
| \`github.com/owner/repo\` | Loads all \`.md\` files with full folder tree |
| \`github.com/owner/repo.git\` | Same — \`.git\` suffix is handled automatically |
| \`github.com/owner/repo/tree/branch\` | Loads a specific branch |
| Any raw \`.md\` URL | Opens that single file directly |

Content loaded from URLs is **read-only** — the toolbar and editing are disabled to prevent accidental changes.

---

## Highlighting & Formatting

Try it now: **Select any word or sentence in this paragraph.** A floating "Bubble Menu" will appear. You can use it to:
- <mark>Highlight important text</mark> for quick reference
- Quickly apply **bold**, *italic*, or \`code\` styles without reaching for the top toolbar

---

## Keyboard Tips

| Action | How |
|---|---|
| Switch to Preview | Click the **Visual** button in the header |
| Switch to Edit | Click the **Editor** button in the header |
| Open Context Menu | **Select text** with your mouse |
| Save to disk | Automatic — just type and pause |
| New note | **New Document** button in the sidebar |
| Load from URL | **From URL** button in the sidebar |
| Close folder / URL | **Close Folder** or **Close URL** in the sidebar |

---

## Open Folder — Browser Support

The folder feature uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API).
It works in **Chrome** and **Edge**. On Firefox or Safari, the button is hidden and local notes work as normal.

---

## Built With Love

MarkFlow is open source and free to use forever.

If it saves you time or becomes part of your daily writing flow, consider saying thanks:

- ⭐ **Star the repo** on [GitHub](https://github.com/IamFishR/mymarkdown) — it helps more people find it
- ☕ **Buy me a coffee** — every bit keeps the project alive and growing

---

## Contact

Made by **Rakesh Jadhav**

Got feedback, a bug report, or just want to say hi?
Reach out at [thisisganesh353@gmail.com](mailto:thisisganesh353@gmail.com)

Thank you for using MarkFlow. Happy writing. 🖊️
`;

const INITIAL_NOTE: Note = {
  id: 'welcome',
  title: 'Documentation',
  content: WELCOME_CONTENT,
  updatedAt: Date.now(),
  createdAt: Date.now(),
};

interface AppState {
  theme: Theme;
  isSidebarOpen: boolean;
  isPreviewMode: boolean;
  searchQuery: string;
  notes: Note[];
  activeNoteId: string;

  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewMode: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setActiveNoteId: (id: string) => void;
  createNote: () => void;
  updateNote: (content: string) => void;
  deleteNote: (id: string) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      isSidebarOpen: window.innerWidth >= 768,
      isPreviewMode: true,
      searchQuery: '',
      notes: [INITIAL_NOTE],
      activeNoteId: INITIAL_NOTE.id,

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setPreviewMode: (v) => set({ isPreviewMode: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setActiveNoteId: (id) => set({ activeNoteId: id }),

      createNote: () => {
        const newNote: Note = {
          id: Math.random().toString(36).substring(2, 9),
          title: 'Untitled Note',
          content: '',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        };
        set((s) => ({ notes: [newNote, ...s.notes], activeNoteId: newNote.id, isPreviewMode: false }));
      },

      updateNote: (content) => {
        const title = content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 40) || 'Untitled Note';
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === s.activeNoteId ? { ...n, content, title, updatedAt: Date.now() } : n
          ),
        }));
      },

      deleteNote: (id) => {
        set((s) => {
          const filtered = s.notes.filter((n) => n.id !== id);
          const activeNoteId = s.activeNoteId === id ? (filtered[0]?.id ?? '') : s.activeNoteId;
          return { notes: filtered, activeNoteId };
        });
      },
    }),
    {
      name: 'markflow_app',
      version: 4,
      migrate: () => ({}),
      partialize: (s) => ({
        theme: s.theme,
        isSidebarOpen: s.isSidebarOpen,
        notes: s.notes,
        activeNoteId: s.activeNoteId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // One-time migration from old localStorage keys
        const oldNotes = localStorage.getItem('markflow_notes');
        const oldTheme = localStorage.getItem('markflow_theme');
        if (oldNotes) {
          try {
            state.notes = JSON.parse(oldNotes);
            state.activeNoteId = state.notes[0]?.id ?? '';
          } catch {}
          localStorage.removeItem('markflow_notes');
        }
        if (oldTheme) {
          state.theme = oldTheme as Theme;
          localStorage.removeItem('markflow_theme');
        }

        // Apply theme on rehydration
        applyTheme(state.theme);
      },
    }
  )
);
