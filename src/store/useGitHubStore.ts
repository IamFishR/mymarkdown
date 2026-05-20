import { create } from 'zustand';
import { GitHubNode } from '../types';
import { parseGitHubUrl, fetchRepoMarkdownTree, toggleGitHubNodeOpen } from '../lib/github';
import { useHistoryStore } from './useHistoryStore';

export type GitHubLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface GitHubState {
  repoLabel: string;
  owner: string | null;
  repo: string | null;
  branch: string;
  tree: GitHubNode[];
  activeFilePath: string | null;
  activeFileContent: string;
  loadStatus: GitHubLoadStatus;
  fileLoadStatus: GitHubLoadStatus;
  errorMessage: string | null;

  loadFromUrl: (url: string) => Promise<void>;
  closeRepo: () => void;
  openGitHubFile: (path: string, downloadUrl: string) => Promise<void>;
  toggleDirectory: (path: string) => void;
}

export const useGitHubStore = create<GitHubState>()((set) => ({
  repoLabel: '',
  owner: null,
  repo: null,
  branch: 'HEAD',
  tree: [],
  activeFilePath: null,
  activeFileContent: '',
  loadStatus: 'idle',
  fileLoadStatus: 'idle',
  errorMessage: null,

  loadFromUrl: async (url) => {
    set({ loadStatus: 'loading', errorMessage: null, tree: [], activeFilePath: null, activeFileContent: '' });

    const parsed = parseGitHubUrl(url);

    if (parsed) {
      try {
        const tree = await fetchRepoMarkdownTree(parsed.owner, parsed.repo, parsed.branch);
        set({
          owner: parsed.owner,
          repo: parsed.repo,
          branch: parsed.branch,
          repoLabel: `${parsed.owner}/${parsed.repo}`,
          tree,
          loadStatus: 'loaded',
        });
        useHistoryStore.getState().addEntry({
          type: 'github',
          label: `${parsed.owner}/${parsed.repo}`,
          url: `https://github.com/${parsed.owner}/${parsed.repo}`,
        });
      } catch (e) {
        set({
          loadStatus: 'error',
          errorMessage: e instanceof Error ? e.message : 'Failed to load repository',
        });
      }
    } else {
      // Direct URL — try to fetch as markdown
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const content = await response.text();
        const fileName = url.split('/').pop()?.split('?')[0] || 'file.md';
        const fileNode: GitHubNode = { kind: 'file', name: fileName, path: fileName, downloadUrl: url };
        set({
          owner: null,
          repo: null,
          repoLabel: url.length > 40 ? '...' + url.slice(-40) : url,
          tree: [fileNode],
          activeFilePath: fileName,
          activeFileContent: content,
          loadStatus: 'loaded',
          fileLoadStatus: 'loaded',
        });
        useHistoryStore.getState().addEntry({ type: 'url', label: fileName, url });
      } catch (e) {
        set({
          loadStatus: 'error',
          errorMessage: e instanceof Error ? e.message : 'Failed to fetch URL',
        });
      }
    }
  },

  closeRepo: () => {
    set({
      repoLabel: '',
      owner: null,
      repo: null,
      branch: 'HEAD',
      tree: [],
      activeFilePath: null,
      activeFileContent: '',
      loadStatus: 'idle',
      fileLoadStatus: 'idle',
      errorMessage: null,
    });
  },

  openGitHubFile: async (path, downloadUrl) => {
    set({ fileLoadStatus: 'loading', activeFilePath: path, activeFileContent: '' });
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const content = await response.text();
      set({ activeFileContent: content, fileLoadStatus: 'loaded' });
    } catch (e) {
      set({
        fileLoadStatus: 'error',
        activeFileContent: `> Failed to load file: ${e instanceof Error ? e.message : 'Unknown error'}`,
      });
    }
  },

  toggleDirectory: (path) => {
    set((s) => ({ tree: toggleGitHubNodeOpen(s.tree, path) }));
  },
}));
