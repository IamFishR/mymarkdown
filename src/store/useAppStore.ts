import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, Theme } from '../types';

const WELCOME_CONTENT = `# Welcome to MarkFlow

> A fast, minimal markdown editor that lives in your browser — and respects your files.

---

## Getting Started

You're looking at a **local note** right now — stored in your browser. No account, no cloud, no tracking.

When you're ready to work with real files:

1. Click **Open Folder** in the sidebar
2. Pick any folder on your machine
3. MarkFlow will show all your \`.md\` files in a collapsible tree
4. Click any file to open it — edits save back to disk automatically

---

## Features

- **Open Folder** — browse your local \`.md\` files in a folder tree, following your directory structure
- **Auto-save to disk** — edits are written back to the original file 1 second after you stop typing
- **Session restore** — reopen the browser and your last folder is restored (with a quick permission prompt)
- **Local notes** — create quick scratch notes stored in the browser, no folder needed
- **Live preview** — toggle between raw markdown and rendered output at any time
- **GitHub Flavored Markdown** — tables, strikethrough, task lists, fenced code blocks, all supported
- **Dark & light mode** — toggle in the top right, preference saved across sessions
- **Search** — filter your local notes by title or content instantly
- **Works offline** — no internet required after the page loads

---

## Keyboard Tips

| Action | How |
|---|---|
| Switch to Preview | Click **Preview** in the header |
| Switch to Edit | Click **Edit** in the header |
| Save to disk | Automatic — just type and pause |
| New note | **New Document** button in the sidebar |
| Close folder | **Close Folder** button in the sidebar |

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
      version: 1,
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
