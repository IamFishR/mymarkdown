import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Moon,
  Sun,
  Menu,
  FileText,
  ChevronRight,
  Clock,
  Type,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from './lib/utils';
import { Sidebar } from './components/Sidebar';
import { CodeBlock } from './components/CodeBlock';
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
  const breadcrumbRoot = isInFolderMode ? folderName : 'Notes';

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

  return (
    <div
      className={cn(
        'flex h-screen w-full transition-colors duration-300',
        'bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100'
      )}
    >
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header toolbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm z-30 shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-mono italic">
              <FileText size={16} className="hidden sm:block shrink-0" />
              <span className="hidden sm:inline">{breadcrumbRoot}</span>
              <ChevronRight size={14} className="hidden sm:block shrink-0" />
              <span className="text-gray-900 dark:text-white font-medium not-italic truncate max-w-[160px] sm:max-w-none text-sm sm:text-sm">
                {editorTitle || 'Untitled'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit / Preview toggle — only when a file/note is active */}
            {(!isInFolderMode || activeFilePath) && (
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-all',
                    !isPreviewMode ? 'bg-white dark:bg-gray-800 shadow-sm text-orange-600' : 'text-gray-500'
                  )}
                >
                  Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-all',
                    isPreviewMode ? 'bg-white dark:bg-gray-800 shadow-sm text-orange-600' : 'text-gray-500'
                  )}
                >
                  Preview
                </button>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Editor & Preview Area */}
        <div className="flex-1 flex overflow-hidden">
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
                    value={editorContent}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    placeholder="# Start typing your markdown..."
                    className="flex-1 w-full bg-transparent p-10 outline-none resize-none font-mono text-lg leading-relaxed dark:placeholder-gray-700 placeholder-gray-300 editor-textarea"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex-1 h-full overflow-y-auto"
                >
                  <div className="max-w-4xl mx-auto p-12 prose dark:prose-invert prose-orange prose-pre:bg-gray-900 prose-pre:p-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: ({ children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock> }}>
                      {editorContent || '*No content to preview*'}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Stats */}
        <footer className="h-10 px-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px] font-mono text-gray-400 bg-white dark:bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 uppercase tracking-widest">
              <Type size={12} /> {wordCount} Words
            </span>
            <span className="flex items-center gap-1 uppercase tracking-widest">
              <Clock size={12} /> {readingTime}m Read
            </span>
          </div>
          <div>
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
        </footer>
      </main>
    </div>
  );
}
