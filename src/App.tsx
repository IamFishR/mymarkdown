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
        'bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100'
      )}
    >
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

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
        {/* Header toolbar - Floating Capsule */}
        <motion.header 
          initial={false}
          animate={{ 
            left: isSidebarOpen && !isMobile ? 312 : 16,
            right: 16,
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed top-4 h-14 flex items-center justify-between px-6 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-xl rounded-2xl shadow-xl z-30 shrink-0"
        >
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors text-orange-600"
              >
                <Menu size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-mono italic lowercase">
              <FileText size={16} className="hidden md:block shrink-0" />
              <span className="hidden md:inline">{breadcrumbRoot}</span>
              {editorTitle && (
                <>
                  <span className="opacity-30">/</span>
                  <span className="text-gray-800 dark:text-gray-200 font-bold truncate max-w-[150px]">
                    {editorTitle}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit / Preview toggle */}
            {(!isInFolderMode || activeFilePath) && (
              <div className="flex bg-gray-200/50 dark:bg-gray-900/50 p-1 rounded-2xl backdrop-blur-sm">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-2xl transition-all duration-300',
                    !isPreviewMode 
                      ? 'bg-white dark:bg-gray-800 shadow-md text-orange-600 glow-orange-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-2xl transition-all duration-300',
                    isPreviewMode 
                      ? 'bg-white dark:bg-gray-800 shadow-md text-orange-600 glow-orange-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  Visual
                </button>
              </div>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-xl rounded-2xl hover:scale-110 active:scale-95 transition-all text-gray-500 hover:text-orange-500 border border-white/20 dark:border-white/10 shadow-lg"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </motion.header>

        {/* Editor & Preview Area */}
        <div className="flex-1 overflow-y-auto pt-20">
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
                  className="flex-1 flex flex-col h-full"
                >
                  <textarea
                    autoFocus
                    spellCheck="false"
                    value={editorContent}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    placeholder="# Start typing your markdown..."
                    className="flex-1 w-full max-w-4xl mx-auto bg-transparent px-4 py-4 sm:px-8 sm:py-8 md:px-10 md:py-10 outline-none resize-none font-mono text-base sm:text-lg leading-relaxed dark:placeholder-gray-700 placeholder-gray-300 editor-textarea"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex-1 h-full overflow-hidden flex flex-col"
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
          className="fixed bottom-4 h-10 px-6 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-xl rounded-2xl flex items-center justify-between text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 shadow-lg z-30 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-700 border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 uppercase tracking-widest hover:text-orange-500 transition-colors cursor-default">
              <Type size={12} className="text-orange-500" /> {wordCount} Words
            </span>
            <span className="flex items-center gap-1.5 uppercase tracking-widest hover:text-orange-500 transition-colors cursor-default">
              <Clock size={12} className="text-orange-500" /> {readingTime} Min
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
