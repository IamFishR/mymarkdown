import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Moon,
  Sun,
  Menu,
  FileText,
  ChevronRight,
  Clock,
  Type,
  Search,
  Pen,
  BookOpen
} from 'lucide-react';
import { cn } from './lib/utils';
import { Sidebar } from './components/Sidebar';
import { RichEditor } from './components/RichEditor';
import { useAppStore } from './store/useAppStore';
import { useFSStore } from './store/useFSStore';

export default function App() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const isPreviewMode = useAppStore((s) => s.isPreviewMode);
  const setPreviewMode = useAppStore((s) => s.setPreviewMode);
  const notes = useAppStore((s) => s.notes);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const updateNote = useAppStore((s) => s.updateNote);

  const folderHandle = useFSStore((s) => s.folderHandle);
  const folderName = useFSStore((s) => s.folderName);
  const activeFilePath = useFSStore((s) => s.activeFilePath);
  const activeFileContent = useFSStore((s) => s.activeFileContent);
  const saveStatus = useFSStore((s) => s.saveStatus);
  const updateFileContent = useFSStore((s) => s.updateFileContent);
  const saveActiveFile = useFSStore((s) => s.saveActiveFile);
  const restoreFromIndexedDB = useFSStore((s) => s.restoreFromIndexedDB);

  const isInFolderMode = folderHandle !== null;

  // Restore folder session on mount
  useEffect(() => {
    restoreFromIndexedDB();
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Debounce timer ref for folder-mode saves
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) || notes[0],
    [notes, activeNoteId]
  );

  const editorContent = isInFolderMode ? activeFileContent : (activeNote?.content ?? '');
  const editorTitle = isInFolderMode
    ? (activeFilePath?.split('/').pop()?.replace(/\.md$/, '') ?? '')
    : (activeNote?.title ?? 'Untitled');
  const breadcrumbRoot = isInFolderMode ? folderName : 'notes';

  const wordCount = editorContent.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  const handleEditorChange = (content: string) => {
    if (isInFolderMode) {
      updateFileContent(content);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveActiveFile();
      }, 1000);
    } else {
      updateNote(content);
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={cn(
        'flex h-screen w-full transition-colors duration-500 relative overflow-hidden',
        'bg-white text-gray-900 dark:bg-[#050505] dark:text-gray-100'
      )}
    >
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/10 dark:bg-orange-600/5 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-orange-300/10 dark:bg-orange-400/5 rounded-full blur-[80px] animate-blob animation-delay-4000" />
      </div>

      <Sidebar />
      
      {/* Backdrop for floating sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.main 
        initial={false}
        animate={{ 
          paddingLeft: isSidebarOpen && !isMobile ? 312 : 0,
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="flex-1 flex flex-col h-full overflow-hidden relative"
      >
        {/* Header toolbar - Responsive (Full width on mobile, Floating on desktop) */}
        <motion.header 
          initial={false}
          animate={{ 
            left: !isMobile && isSidebarOpen ? 312 : (isMobile ? 0 : 16),
            right: isMobile ? 0 : 16,
            top: isMobile ? 0 : 16,
            borderRadius: isMobile ? 0 : 16,
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className={cn(
            "fixed flex items-center justify-between bg-white/40 dark:bg-[#0a0a0a]/60 backdrop-blur-xl z-30 shrink-0 border-b md:border shadow-lg",
            isMobile ? "h-16 px-4 border-gray-200/50 dark:border-white/10" : "h-14 px-6 border-white/10 shadow-xl"
          )}
        >
          <div className="flex items-center gap-2 sm:gap-4 max-w-[50%] sm:max-w-none">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors text-orange-600 shrink-0"
              >
                <Menu size={18} />
              </button>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-500 dark:text-gray-400 font-mono italic lowercase min-w-0">
              <FileText size={16} className="hidden sm:block shrink-0" />
              <span className="hidden md:inline truncate">{breadcrumbRoot}</span>
              {editorTitle && (
                <>
                  <span className="opacity-30 hidden sm:inline">/</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold truncate">
                    {editorTitle}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Edit / Preview toggle */}
            {(!isInFolderMode || activeFilePath) && (
              <div className="flex bg-gray-200/50 dark:bg-gray-900/50 p-1 rounded-2xl backdrop-blur-sm border border-white/10">
                <button
                  onClick={() => setPreviewMode(false)}
                  title="Edit Mode"
                  className={cn(
                    'p-2 sm:px-3 sm:py-1.5 rounded-2xl transition-all duration-500 relative flex items-center justify-center',
                    !isPreviewMode 
                      ? 'bg-white dark:bg-orange-500 shadow-lg text-orange-600 dark:text-white glow-orange-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Pen size={14} className={cn("sm:mr-2", !isPreviewMode && "animate-pulse")} />
                  <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Editor</span>
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  title="Visual Mode"
                  className={cn(
                    'p-2 sm:px-3 sm:py-1.5 rounded-2xl transition-all duration-500 relative flex items-center justify-center',
                    isPreviewMode 
                      ? 'bg-white dark:bg-orange-500 shadow-lg text-orange-600 dark:text-white glow-orange-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <BookOpen size={14} className={cn("sm:mr-2", isPreviewMode && "animate-pulse")} />
                  <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Preview</span>
                </button>
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-xl rounded-2xl hover:scale-110 active:scale-95 transition-all text-gray-500 hover:text-orange-500 border border-white/20 dark:border-white/10 shadow-lg shrink-0"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </motion.header>

        {/* Editor & Preview Area - Full-height scrollable area */}
        <div className="flex-1 relative flex flex-col min-h-0 bg-transparent overflow-hidden">
          {/* Empty state when in folder mode with no file open */}
          {isInFolderMode && !activeFilePath ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 gap-3 select-none">
              <FileText size={48} className="opacity-30" />
              <p className="text-sm font-mono">Select a file from the sidebar</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!isPreviewMode ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 overflow-y-auto bg-transparent pt-32 pb-28"
                >
                  <textarea
                    autoFocus
                    spellCheck="false"
                    value={editorContent}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    placeholder="# Start typing your markdown..."
                    className="w-full max-w-4xl mx-auto block bg-transparent px-4 py-4 sm:px-8 sm:py-8 md:px-10 md:py-10 outline-none resize-none font-mono text-base sm:text-lg leading-relaxed dark:placeholder-gray-700 placeholder-gray-300 editor-textarea min-h-[calc(100vh-200px)]"
                  />
                  <div className="h-28 w-full shrink-0" />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex-1 relative flex flex-col min-h-0 overflow-hidden"
                >
                  <RichEditor
                    key={isInFolderMode ? (activeFilePath ?? '') : (activeNote?.id ?? '')}
                    initialContent={editorContent}
                    onChange={handleEditorChange}
                  />
                </motion.div>
            )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Stats - Floating Capsule */}
        <motion.footer 
          initial={false}
          animate={{ 
            left: isSidebarOpen && !isMobile ? 312 : 16,
            right: 16,
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed bottom-4 h-10 px-4 sm:px-6 bg-white/20 dark:bg-[#0a0a0a]/20 backdrop-blur-xl rounded-2xl flex items-center justify-between text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 shadow-lg z-30 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-700 border border-white/10 dark:border-white/5"
        >
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <span className="flex items-center gap-1.5 uppercase tracking-widest hover:text-orange-500 transition-colors cursor-default whitespace-nowrap">
              <Type size={12} className="text-orange-500" /> {wordCount} <span className="hidden sm:inline">Words</span>
            </span>
            <span className="flex items-center gap-1.5 uppercase tracking-widest hover:text-orange-500 transition-colors cursor-default whitespace-nowrap">
              <Clock size={12} className="text-orange-500" /> {readingTime} <span className="hidden sm:inline">Min</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isInFolderMode ? (
              <span
                className={cn(
                  'uppercase tracking-widest transition-colors',
                  saveStatus === 'saving' && 'text-yellow-500',
                  saveStatus === 'saved' && 'text-green-500',
                  saveStatus === 'error' && 'text-red-500',
                  saveStatus === 'idle' && 'text-gray-400'
                )}
              >
                {saveStatus === 'saving'
                  ? 'Saving...'
                  : saveStatus === 'saved'
                  ? 'Saved'
                  : saveStatus === 'error'
                  ? 'Save Error'
                  : 'UTF-8 | Markdown GFM'}
              </span>
            ) : (
              'UTF-8 | Markdown GFM'
            )}
          </div>
        </motion.footer>
      </motion.main>
    </div>
  );
}
