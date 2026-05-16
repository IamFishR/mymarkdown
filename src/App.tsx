import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Sidebar as SidebarIcon,
  ChevronRight,
  Clock,
  Type
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from './lib/utils';
import { Note, Theme } from './types';

const STORAGE_KEY = 'markflow_notes';
const THEME_KEY = 'markflow_theme';

const INITIAL_NOTE: Note = {
  id: 'welcome',
  title: 'Welcome to MarkFlow',
  content: '# Welcome to MarkFlow\n\nStart editing this file or create a new one. MarkFlow is blazing fast and lightweight.\n\n### Features:\n- **Markdown Support** (GFM)\n- **Live Preview**\n- **Auto-save** to LocalStorage\n- **Dark Mode** toggle\n- **Fast Search**',
  updatedAt: Date.now(),
  createdAt: Date.now(),
};

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [INITIAL_NOTE];
  });
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || 'welcome');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved as Theme) || 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || notes[0], 
  [notes, activeNoteId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const createNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setIsPreviewMode(false);
  };

  const updateNote = (content: string) => {
    const title = content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 40) || 'Untitled Note';
    setNotes(prev => prev.map(n => 
      n.id === activeNoteId 
        ? { ...n, content, title, updatedAt: Date.now() } 
        : n
    ));
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0]?.id || '');
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const wordCount = activeNote?.content.trim().split(/\s+/).filter(Boolean).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={cn(
      "flex h-screen w-full transition-colors duration-300",
      "bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100"
    )}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 300 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className={cn(
          "relative flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#0a0a0a] z-40",
          !isSidebarOpen && "border-none"
        )}
      >
        <div className="p-4 border-bottom border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold tracking-tight text-lg">MarkFlow</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-2">
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

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200",
                activeNoteId === note.id 
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
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
                onClick={(e) => deleteNote(note.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={createNote}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-orange-500/20 active:scale-95"
          >
            <Plus size={18} />
            New Document
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header toolbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                id="open-sidebar"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-mono italic">
              <FileText size={16} />
              <span className="hidden sm:inline">Notes</span>
              <ChevronRight size={14} />
              <span className="text-gray-900 dark:text-white font-medium not-italic">{activeNote?.title || 'Untitled'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
              <button 
                onClick={() => setIsPreviewMode(false)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  !isPreviewMode ? "bg-white dark:bg-gray-800 shadow-sm text-orange-600" : "text-gray-500"
                )}
              >
                Edit
              </button>
              <button 
                onClick={() => setIsPreviewMode(true)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  isPreviewMode ? "bg-white dark:bg-gray-800 shadow-sm text-orange-600" : "text-gray-500"
                )}
              >
                Preview
              </button>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Editor & Preview Area */}
        <div className="flex-1 flex overflow-hidden">
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
                  value={activeNote?.content || ''}
                  onChange={(e) => updateNote(e.target.value)}
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeNote?.content || '*No content to preview*'}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        <footer className="h-10 px-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px] font-mono text-gray-400 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 uppercase tracking-widest"><Type size={12} /> {wordCount} Words</span>
            <span className="flex items-center gap-1 uppercase tracking-widest"><Clock size={12} /> {readingTime}m Read</span>
          </div>
          <div>
            UTF-8 | Markdown GFM
          </div>
        </footer>
      </main>
    </div>
  );
}
