import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Trash2, FileText, X, FolderOpen, FolderX, Clock, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useFSStore } from '../store/useFSStore';
import { FileTree } from './FileTree';
import { cn } from '../lib/utils';

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

  const isInFolderMode = folderHandle !== null;

  const filteredNotes = useMemo(
    () =>
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [notes, searchQuery]
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 300 : 0, opacity: isSidebarOpen ? 1 : 0 }}
      className={cn(
        'relative flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#0a0a0a] z-40',
        !isSidebarOpen && 'border-none'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="font-bold tracking-tight text-lg">MarkFlow</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Folder mode banner */}
      {isInFolderMode && (
        <div className="px-4 pb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-orange-500 font-mono font-semibold truncate">
            {folderName}
          </span>
          <button
            onClick={refreshTree}
            title="Refresh"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      )}

      {/* Search (local mode only) */}
      {!isInFolderMode && (
        <div className="px-4 py-2 shrink-0">
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
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {isInFolderMode ? (
          tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-600 text-sm gap-2">
              <FileText size={32} className="opacity-30" />
              <span>No markdown files found</span>
            </div>
          ) : (
            <FileTree nodes={tree} />
          )
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={cn(
                'group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200',
                activeNoteId === note.id
                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900'
              )}
            >
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span className="font-medium text-sm truncate">{note.title || 'Untitled Note'}</span>
                <span className="text-[10px] opacity-60 flex items-center gap-1 uppercase tracking-tighter">
                  <Clock size={10} />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer buttons */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2 shrink-0">
        {isInFolderMode ? (
          <button
            onClick={closeFolder}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-semibold py-2.5 rounded-xl transition-all"
          >
            <FolderX size={18} />
            Close Folder
          </button>
        ) : (
          <>
            {isFSASupported && (
              <button
                onClick={openFolder}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-semibold py-2.5 rounded-xl transition-all"
              >
                <FolderOpen size={18} />
                Open Folder
              </button>
            )}
            <button
              onClick={createNote}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-orange-500/20 active:scale-95"
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
