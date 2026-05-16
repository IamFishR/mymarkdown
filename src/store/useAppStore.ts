import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, Theme } from '../types';

const INITIAL_NOTE: Note = {
  id: 'welcome',
  title: 'Welcome to MarkFlow',
  content:
    '# Welcome to MarkFlow\n\nStart editing this file or create a new one. MarkFlow is blazing fast and lightweight.\n\n### Features:\n- **Markdown Support** (GFM)\n- **Live Preview**\n- **Auto-save** to LocalStorage\n- **Dark Mode** toggle\n- **Fast Search**',
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
      isSidebarOpen: true,
      isPreviewMode: false,
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
