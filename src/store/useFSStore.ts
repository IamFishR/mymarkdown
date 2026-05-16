import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { FolderNode, SaveStatus } from '../types';
import { buildFolderTree, readFile, writeFile, requestPermission, toggleNodeOpen } from '../lib/fs';

const IDB_KEY = 'markflow_folder_handle';

interface FSState {
  folderHandle: FileSystemDirectoryHandle | null;
  folderName: string;
  tree: FolderNode[];
  activeFilePath: string | null;
  activeFileHandle: FileSystemFileHandle | null;
  activeFileContent: string;
  saveStatus: SaveStatus;

  openFolder: () => Promise<void>;
  closeFolder: () => Promise<void>;
  openFile: (node: FolderNode & { kind: 'file' }) => Promise<void>;
  updateFileContent: (content: string) => void;
  saveActiveFile: () => Promise<void>;
  toggleDirectory: (path: string) => void;
  restoreFromIndexedDB: () => Promise<void>;
  refreshTree: () => Promise<void>;
}

let saveIdleTimer: ReturnType<typeof setTimeout> | undefined;

export const useFSStore = create<FSState>()((set, get) => ({
  folderHandle: null,
  folderName: '',
  tree: [],
  activeFilePath: null,
  activeFileHandle: null,
  activeFileContent: '',
  saveStatus: 'idle',

  openFolder: async () => {
    if (!('showDirectoryPicker' in window)) return;
    let handle: FileSystemDirectoryHandle;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      throw e;
    }

    const tree = await buildFolderTree(handle);
    await idbSet(IDB_KEY, handle);
    set({
      folderHandle: handle,
      folderName: handle.name,
      tree,
      activeFilePath: null,
      activeFileHandle: null,
      activeFileContent: '',
      saveStatus: 'idle',
    });
  },

  closeFolder: async () => {
    await idbDel(IDB_KEY);
    set({
      folderHandle: null,
      folderName: '',
      tree: [],
      activeFilePath: null,
      activeFileHandle: null,
      activeFileContent: '',
      saveStatus: 'idle',
    });
  },

  openFile: async (node) => {
    const content = await readFile(node.handle);
    set({
      activeFilePath: node.path,
      activeFileHandle: node.handle,
      activeFileContent: content,
      saveStatus: 'idle',
    });
  },

  updateFileContent: (content) => {
    set({ activeFileContent: content, saveStatus: 'saving' });
  },

  saveActiveFile: async () => {
    const { activeFileHandle, activeFileContent } = get();
    if (!activeFileHandle) return;

    clearTimeout(saveIdleTimer);

    try {
      await writeFile(activeFileHandle, activeFileContent);
      set({ saveStatus: 'saved' });
      saveIdleTimer = setTimeout(() => {
        set({ saveStatus: 'idle' });
      }, 2000);
    } catch {
      set({ saveStatus: 'error' });
    }
  },

  toggleDirectory: (path) => {
    set((s) => ({ tree: toggleNodeOpen(s.tree, path) }));
  },

  restoreFromIndexedDB: async () => {
    let handle: FileSystemDirectoryHandle | undefined;
    try {
      handle = await idbGet<FileSystemDirectoryHandle>(IDB_KEY);
    } catch {
      return;
    }
    if (!handle) return;

    const granted = await requestPermission(handle);
    if (!granted) {
      await idbDel(IDB_KEY);
      return;
    }

    const tree = await buildFolderTree(handle);
    set({ folderHandle: handle, folderName: handle.name, tree });
  },

  refreshTree: async () => {
    const { folderHandle } = get();
    if (!folderHandle) return;
    const tree = await buildFolderTree(folderHandle);
    set({ tree });
  },
}));
