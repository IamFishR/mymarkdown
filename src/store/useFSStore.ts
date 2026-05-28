import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { FolderNode, SaveStatus } from '../types';
import { buildFolderTree, readFile, writeFile, requestPermission, toggleNodeOpen, getDirectoryHandleAtPath, preserveOpenState, setDirectoryOpen } from '../lib/fs';
import { useHistoryStore } from './useHistoryStore';

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
  createFileInDirectory: (dirPath: string | null, fileName: string) => Promise<void>;
}

let saveIdleTimer: ReturnType<typeof setTimeout> | undefined;
let saveDebounceTimer: ReturnType<typeof setTimeout> | undefined;

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
    useHistoryStore.getState().addEntry({ type: 'folder', label: handle.name });
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
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      get().saveActiveFile();
    }, 500);
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
    const { folderHandle, tree: currentTree } = get();
    if (!folderHandle) return;
    const newTree = await buildFolderTree(folderHandle);
    set({ tree: preserveOpenState(newTree, currentTree) });
  },

  createFileInDirectory: async (dirPath, fileName) => {
    const { folderHandle, tree } = get();
    if (!folderHandle) return;

    const name = fileName.trim();
    if (!name) return;
    const finalName = name.endsWith('.md') ? name : `${name}.md`;

    try {
      const dirHandle = await getDirectoryHandleAtPath(folderHandle, dirPath);
      const fileHandle = await dirHandle.getFileHandle(finalName, { create: true });
      await writeFile(fileHandle, '');

      const newTree = await buildFolderTree(folderHandle);
      let merged = preserveOpenState(newTree, tree);
      if (dirPath) {
        merged = setDirectoryOpen(merged, dirPath, true);
      }

      const filePath = dirPath ? `${dirPath}/${finalName}` : finalName;
      set({
        tree: merged,
        activeFilePath: filePath,
        activeFileHandle: fileHandle,
        activeFileContent: '',
        saveStatus: 'idle',
      });
    } catch (e) {
      console.error('Failed to create file:', e);
    }
  },
}));
