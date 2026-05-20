import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, Trash2, FileText, X, FolderOpen, FolderX,
  Clock, RefreshCw, Link, LinkIcon, Loader2, AlertCircle,
  ChevronDown, ChevronRight, Github, Folder,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useFSStore } from '../store/useFSStore';
import { useGitHubStore } from '../store/useGitHubStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { FileTree, NewFileInput } from './FileTree';
import { GitHubFileTree } from './GitHubFileTree';
import { cn } from '../lib/utils';
import { HistoryEntry } from '../types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function HistoryIcon({ type }: { type: HistoryEntry['type'] }) {
  if (type === 'github') return <Github size={11} />;
  if (type === 'url') return <Link size={11} />;
  return <Folder size={11} />;
}

const isFSASupported = 'showDirectoryPicker' in window;

export function Sidebar() {
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const notes = useAppStore((s) => s.notes);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const setActiveNoteId = useAppStore((s) => s.setActiveNoteId);
  const createNote = useAppStore((s) => s.createNote);
  const deleteNote = useAppStore((s) => s.deleteNote);

  const folderHandle = useFSStore((s) => s.folderHandle);
  const folderName = useFSStore((s) => s.folderName);
  const tree = useFSStore((s) => s.tree);
  const openFolder = useFSStore((s) => s.openFolder);
  const closeFolder = useFSStore((s) => s.closeFolder);
  const refreshTree = useFSStore((s) => s.refreshTree);
  const createFileInDirectory = useFSStore((s) => s.createFileInDirectory);

  const ghTree = useGitHubStore((s) => s.tree);
  const ghLoadStatus = useGitHubStore((s) => s.loadStatus);
  const ghErrorMessage = useGitHubStore((s) => s.errorMessage);
  const ghRepoLabel = useGitHubStore((s) => s.repoLabel);
  const loadFromUrl = useGitHubStore((s) => s.loadFromUrl);
  const closeRepo = useGitHubStore((s) => s.closeRepo);

  const historyEntries = useHistoryStore((s) => s.entries);
  const removeHistoryEntry = useHistoryStore((s) => s.removeEntry);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const [isCreatingAtRoot, setIsCreatingAtRoot] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [recentOpen, setRecentOpen] = useState(true);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showUrlInput) urlInputRef.current?.focus();
  }, [showUrlInput]);

  const isInFolderMode = folderHandle !== null;
  const isInGitHubMode = ghLoadStatus !== 'idle';

  const filteredNotes = useMemo(
    () =>
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [notes, searchQuery]
  );

  const handleUrlSubmit = async () => {
    const url = urlValue.trim();
    if (!url) return;
    setShowUrlInput(false);
    setUrlValue('');
    await loadFromUrl(url);
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUrlSubmit();
    else if (e.key === 'Escape') {
      setShowUrlInput(false);
      setUrlValue('');
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={
        isMobile
          ? { x: isSidebarOpen ? 0 : -320, width: 280 }
          : { x: isSidebarOpen ? 0 : -320, width: 280 }
      }
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className={cn(
        'fixed left-4 top-4 bottom-4 flex flex-col overflow-hidden z-50',
        'glass rounded-2xl shadow-2xl border border-white/10 dark:border-white/5',
        'bg-gradient-to-b from-white/80 to-gray-50/80 dark:from-[#0a0a0a]/80 dark:to-[#0d0d0d]/80',
        !isSidebarOpen && 'pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-lg glow-orange-sm">
            M
          </div>
          <span className="font-bold tracking-tight text-base text-gray-800 dark:text-gray-200">MarkFlow</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* Folder mode banner */}
      {isInFolderMode && (
        <div className="px-4 pb-2 flex items-center justify-between group/root">
          <span className="text-[10px] uppercase tracking-widest text-orange-500 font-mono font-semibold truncate">
            {folderName}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCreatingAtRoot(true)}
              title="New file in root"
              className="opacity-0 group-hover/root:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 hover:text-orange-500"
            >
              <Plus size={12} />
            </button>
            <button
              onClick={refreshTree}
              title="Refresh"
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      )}

      {/* GitHub mode banner */}
      {isInGitHubMode && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <LinkIcon size={10} className="text-orange-500 shrink-0" />
          <span className="text-[10px] uppercase tracking-widest text-orange-500 font-mono font-semibold truncate flex-1">
            {ghRepoLabel}
          </span>
        </div>
      )}

      {/* URL input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden shrink-0"
          >
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-xl px-3 py-2 border border-orange-400/40 focus-within:border-orange-500 transition-colors">
                <Link size={14} className="text-orange-500 shrink-0" />
                <input
                  ref={urlInputRef}
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  onKeyDown={handleUrlKeyDown}
                  placeholder="GitHub URL or direct .md URL"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 min-w-0"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlValue.trim()}
                  className="text-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 px-1">
                e.g. github.com/owner/repo or raw.github.../file.md
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search (local mode only) */}
      {!isInFolderMode && !isInGitHubMode && (
        <div className="px-3 sm:px-4 py-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-900 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-orange-500 transition-all outline-none"
            />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 space-y-1">
        {isInGitHubMode ? (
          <>
            {ghLoadStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <Loader2 size={28} className="animate-spin text-orange-500" />
                <span className="text-xs font-mono tracking-widest">Loading...</span>
              </div>
            )}
            {ghLoadStatus === 'error' && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center text-red-400 px-2">
                <AlertCircle size={28} className="shrink-0" />
                <span className="text-xs">{ghErrorMessage}</span>
                <button
                  onClick={closeRepo}
                  className="text-xs underline text-gray-400 hover:text-orange-500 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
            {ghLoadStatus === 'loaded' && ghTree.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 text-sm gap-2">
                <FileText size={32} className="opacity-30" />
                <span>No markdown files found</span>
              </div>
            )}
            {ghLoadStatus === 'loaded' && ghTree.length > 0 && (
              <GitHubFileTree nodes={ghTree} />
            )}
          </>
        ) : isInFolderMode ? (
          <>
            {isCreatingAtRoot && (
              <NewFileInput
                onSubmit={async (name) => {
                  setIsCreatingAtRoot(false);
                  await createFileInDirectory(null, name);
                }}
                onCancel={() => setIsCreatingAtRoot(false)}
              />
            )}
            {tree.length === 0 && !isCreatingAtRoot ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-600 text-sm gap-2">
                <FileText size={32} className="opacity-30" />
                <span>No markdown files found</span>
              </div>
            ) : (
              <FileTree nodes={tree} />
            )}
          </>
        ) : (
          <>
            {filteredNotes.map((note) => {
              const isActive = activeNoteId === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={cn(
                    'group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 relative mb-1',
                    isActive
                      ? 'bg-white dark:bg-orange-500/10 shadow-md border border-orange-200 dark:border-orange-500/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300',
                      isActive
                        ? 'bg-orange-500 text-white shadow-lg rotate-3'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400 group-hover:rotate-6'
                    )}
                  >
                    <FileText size={16} />
                  </div>

                  <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                    <span
                      className={cn(
                        'font-bold text-sm truncate',
                        isActive ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {note.title || 'Untitled Note'}
                    </span>
                    <span className="text-[10px] opacity-60 flex items-center gap-1 uppercase tracking-wider font-semibold">
                      <Clock size={10} />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

            {/* Recent section */}
            {historyEntries.length > 0 && !searchQuery && (
              <div className="mt-3">
                <div className="border-t border-gray-200 dark:border-gray-800 mb-2" />
                <div className="flex items-center justify-between px-1 mb-1">
                  <button
                    onClick={() => setRecentOpen((v) => !v)}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {recentOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    Recent
                  </button>
                  {recentOpen && (
                    <button
                      onClick={clearHistory}
                      className="text-[10px] text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {recentOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {historyEntries.map((entry) => {
                        const isClickable = entry.type === 'github' || entry.type === 'url';
                        return (
                          <div
                            key={entry.id}
                            onClick={() => isClickable && entry.url && loadFromUrl(entry.url)}
                            className={cn(
                              'group flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all',
                              isClickable
                                ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                                : 'cursor-default opacity-70'
                            )}
                          >
                            <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400">
                              <HistoryIcon type={entry.type} />
                            </div>
                            <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                              {entry.label}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-600 shrink-0">
                              {timeAgo(entry.openedAt)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeHistoryEntry(entry.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-400 transition-all shrink-0"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer buttons */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2 shrink-0">
        {isInGitHubMode ? (
          <button
            onClick={closeRepo}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-semibold py-2 rounded-xl transition-all"
          >
            <LinkIcon size={16} />
            Close URL
          </button>
        ) : isInFolderMode ? (
          <button
            onClick={closeFolder}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-semibold py-2 rounded-xl transition-all"
          >
            <FolderX size={18} />
            Close Folder
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowUrlInput((v) => !v)}
              className={cn(
                'w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-xl transition-all',
                showUrlInput
                  ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                  : 'bg-gray-100 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              )}
            >
              <Link size={16} />
              From URL
            </button>
            {isFSASupported && (
              <button
                onClick={openFolder}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-semibold py-2 rounded-xl transition-all"
              >
                <FolderOpen size={18} />
                Open Folder
              </button>
            )}
            <button
              onClick={createNote}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 glow-orange-sm active:scale-[0.98] text-sm"
            >
              <Plus size={18} />
              New Document
            </button>
          </>
        )}
      </div>
    </motion.aside>
  );
}
