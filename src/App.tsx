import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, FileText, Type, Clock, Sun, Moon, 
  Pen, BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from './store/useAppStore';
import { useFSStore } from './store/useFSStore';
import { RichEditor } from './components/RichEditor';
import { Sidebar } from './components/Sidebar';
import { cn } from './lib/utils';

export default function App() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const isPreviewMode = useAppStore((s) => s.isPreviewMode);
  const setPreviewMode = useAppStore((s) => s.setPreviewMode);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const notes = useAppStore((s) => s.notes);
  const updateNote = useAppStore((s) => s.updateNote);

  const folderHandle = useFSStore((s) => s.folderHandle);
  const activeFilePath = useFSStore((s) => s.activeFilePath);
  const activeFileContent = useFSStore((s) => s.activeFileContent);
  const saveStatus = useFSStore((s) => s.saveStatus);
  const updateFileContent = useFSStore((s) => s.updateFileContent);
  const restoreFromIndexedDB = useFSStore((s) => s.restoreFromIndexedDB);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    restoreFromIndexedDB();
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      metaThemeColor?.setAttribute('content', '#050505');
    } else {
      document.documentElement.classList.remove('dark');
      metaThemeColor?.setAttribute('content', '#ffffff');
    }
  }, [theme]);

  const isInFolderMode = folderHandle !== null;
  const activeNote = useMemo(() => notes.find((n) => n.id === activeNoteId), [notes, activeNoteId]);
  
  const editorTitle = isInFolderMode 
    ? (activeFilePath?.split('/').pop()?.replace(/\.md$/, '') || '')
    : (activeNote?.title || '');

  const editorContent = isInFolderMode ? (activeFileContent || '') : (activeNote?.content || '');

  const handleEditorChange = (content: string) => {
    if (isInFolderMode) {
      updateFileContent(content);
    } else {
      updateNote(content);
    }
  };

  const wordCount = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex h-screen w-screen transition-colors duration-500 relative bg-white dark:bg-[#050505] text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar />

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.main 
        initial={false}
        animate={{ paddingLeft: isSidebarOpen && !isMobile ? 312 : 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="flex-1 relative flex flex-col h-full min-w-0 z-10 overflow-hidden"
      >
        {/* Dynamic Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/10 dark:bg-orange-600/5 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        {/* Fixed Header */}
        <motion.header
          initial={false}
          animate={{ 
            left: !isMobile && isSidebarOpen ? 312 + 16 : (isMobile ? 0 : 16),
            right: isMobile ? 0 : 16,
            top: isMobile ? 0 : 16,
            borderRadius: isMobile ? 0 : 16,
          }}
          className={cn(
            "fixed flex items-center justify-between bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-xl z-30 border shadow-lg transition-all duration-300",
            isMobile ? "h-16 px-4 border-gray-200 dark:border-white/10" : "h-14 px-6 border-white/10 shadow-xl"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-orange-500 shrink-0">
                <Menu size={18} />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm font-medium truncate italic text-gray-500">
              <FileText size={16} className="shrink-0" />
              <span className="text-gray-900 dark:text-gray-100 font-bold truncate not-italic">{editorTitle || 'MarkFlow'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-white/5">
              <button onClick={() => setPreviewMode(false)} className={cn("p-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2", !isPreviewMode ? "bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm" : "text-gray-400")}>
                <Pen size={12} /> <span className="hidden sm:inline">Editor</span>
              </button>
              <button onClick={() => setPreviewMode(true)} className={cn("p-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2", isPreviewMode ? "bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm" : "text-gray-400")}>
                <BookOpen size={12} /> <span className="hidden sm:inline">Visual</span>
              </button>
            </div>
            <button onClick={toggleTheme} className="p-2 bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-500 hover:text-orange-500 transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </motion.header>

        {/* Unified Scroll Container */}
        <div className={cn(
          "flex-1 overflow-y-auto overscroll-auto scroll-smooth relative z-10",
          isMobile ? "pt-16" : "pt-20"
        )}>
          <div className="w-full max-w-4xl mx-auto min-h-full flex flex-col">
            {isInFolderMode && !activeFilePath ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <FileText size={48} className="opacity-20" />
                <p className="text-sm font-mono tracking-widest">Select a file to begin</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {!isPreviewMode ? (
                  <motion.div
                    key={isInFolderMode ? `raw-${activeFilePath}` : `raw-${activeNoteId}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full px-4 sm:px-8 md:px-10 flex-1 flex flex-col"
                  >
                    <textarea
                      autoFocus
                      spellCheck="false"
                      value={editorContent}
                      onChange={(e) => handleEditorChange(e.target.value)}
                      placeholder="Start writing..."
                      className="w-full flex-1 bg-transparent outline-none resize-none font-mono text-base sm:text-lg leading-relaxed min-h-[60vh] py-10"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={isInFolderMode ? `visual-${activeFilePath}` : `visual-${activeNoteId}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full flex-1"
                  >
                    <RichEditor initialContent={editorContent} onChange={handleEditorChange} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            {/* Bottom Spacer */}
            <div className="h-24 md:h-32 shrink-0" />
          </div>
        </div>

        {/* Fixed Footer */}
        <motion.footer
          initial={false}
          animate={{ 
            left: !isMobile && isSidebarOpen ? 312 + 16 : 16,
            right: 16 
          }}
          className="fixed bottom-4 h-10 px-6 bg-white/60 dark:bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 z-30 transition-all duration-300"
        >
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><Type size={12} className="text-orange-500" /> {wordCount} Words</span>
            <span className="flex items-center gap-1.5"><Clock size={12} className="text-orange-500" /> {readingTime} Min</span>
          </div>
          <div className={cn(
            "transition-colors",
            saveStatus === 'saving' && "text-orange-500",
            saveStatus === 'saved' && "text-green-500"
          )}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'MarkFlow Engine'}
          </div>
        </motion.footer>
      </motion.main>
    </div>
  );
}
