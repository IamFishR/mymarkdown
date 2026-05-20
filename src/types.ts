export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  createdAt: number;
}

export type Theme = 'light' | 'dark';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type FolderNode =
  | { kind: 'file'; name: string; path: string; handle: FileSystemFileHandle }
  | { kind: 'directory'; name: string; path: string; children: FolderNode[]; isOpen: boolean };

export type GitHubNode =
  | { kind: 'file'; name: string; path: string; downloadUrl: string }
  | { kind: 'directory'; name: string; path: string; children: GitHubNode[]; isOpen: boolean };

export interface HistoryEntry {
  id: string;
  type: 'folder' | 'github' | 'url';
  label: string;
  url?: string;
  openedAt: number;
}
