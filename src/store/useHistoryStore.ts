import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HistoryEntry } from '../types';

const MAX_ENTRIES = 15;

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'openedAt'>) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (entry) => {
        set((s) => {
          // Deduplicate: same url for github/url, same label+type for folder
          const filtered = s.entries.filter((e) => {
            if (entry.url && e.url) return e.url !== entry.url;
            if (!entry.url && !e.url) return !(e.label === entry.label && e.type === entry.type);
            return true;
          });

          const newEntry: HistoryEntry = {
            ...entry,
            id: Math.random().toString(36).substring(2, 9),
            openedAt: Date.now(),
          };

          return { entries: [newEntry, ...filtered].slice(0, MAX_ENTRIES) };
        });
      },

      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      clearHistory: () => set({ entries: [] }),
    }),
    { name: 'markflow_history' }
  )
);
