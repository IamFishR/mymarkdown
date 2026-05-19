import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Trash2, FileText, X, FolderOpen, FolderX, Clock, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useFSStore } from '../store/useFSStore';
import { FileTree, NewFileInput } from './FileTree';
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
  const createFileInDirectory = useFSStore((s) => s.createFileInDirectory);

  const [isCreatingAtRoot, setIsCreatingAtRoot] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      animate={isMobile 
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

      {/* Search (local mode only) */}
      {!isInFolderMode && (
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
        {isInFolderMode ? (
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
          filteredNotes.map((note) => {
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
                <div className={cn(
                  "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                  isActive ? "bg-orange-500 text-white shadow-lg rotate-3" : "bg-gray-200 dark:bg-gray-800 text-gray-400 group-hover:rotate-6"
                )}>
                  <FileText size={16} />
                </div>
                
                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                  <span className={cn(
                    "font-bold text-sm truncate",
                    isActive ? "text-orange-700 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"
                  )}>
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
          })
        )}
      </div>

      {/* Footer buttons */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2 shrink-0">
        {isInFolderMode ? (
          <button
            onClick={closeFolder}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-semibold py-2 rounded-xl transition-all"
          >
            <FolderX size={18} />
            Close Folder
          </button>
        ) : (
          <>
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
