import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, FileText, Plus } from 'lucide-react';
import { FolderNode } from '../types';
import { useFSStore } from '../store/useFSStore';
import { cn } from '../lib/utils';

interface FileTreeProps {
  nodes: FolderNode[];
  depth?: number;
}

interface NewFileInputProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function NewFileInput({ onSubmit, onCancel }: NewFileInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) onSubmit(value.trim());
      else onCancel();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <FileText size={14} className="shrink-0 text-orange-400 opacity-80" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        placeholder="filename.md"
        className="flex-1 bg-transparent text-sm outline-none border-b border-orange-400 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
      />
    </div>
  );
}

function DirectoryNode({ node, depth }: { node: Extract<FolderNode, { kind: 'directory' }>; depth: number }) {
  const [isCreating, setIsCreating] = useState(false);
  const [isRowHovered, setIsRowHovered] = useState(false);
  const toggleDirectory = useFSStore((s) => s.toggleDirectory);
  const createFileInDirectory = useFSStore((s) => s.createFileInDirectory);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.isOpen) toggleDirectory(node.path);
    setIsCreating(true);
  };

  const handleSubmit = async (name: string) => {
    setIsCreating(false);
    await createFileInDirectory(node.path, name);
  };

  return (
    <div>
      <div
        className="flex items-center"
        onMouseEnter={() => setIsRowHovered(true)}
        onMouseLeave={() => setIsRowHovered(false)}
      >
        <button
          onClick={() => toggleDirectory(node.path)}
          className="flex-1 flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left text-gray-600 dark:text-gray-400"
        >
          {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="truncate font-medium">{node.name}</span>
        </button>
        <button
          onClick={handlePlusClick}
          title="New file here"
          className={cn(
            'p-1.5 mr-1 rounded text-gray-400 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all shrink-0',
            isRowHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Plus size={14} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {node.isOpen && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            {isCreating && (
              <NewFileInput
                onSubmit={handleSubmit}
                onCancel={() => setIsCreating(false)}
              />
            )}
            <FileTree nodes={node.children} depth={depth + 1} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  const openFile = useFSStore((s) => s.openFile);
  const activeFilePath = useFSStore((s) => s.activeFilePath);

  if (nodes.length === 0) return null;

  return (
    <div style={{ paddingLeft: depth > 0 ? '16px' : undefined }}>
      {nodes.map((node) => {
        if (node.kind === 'directory') {
          return <DirectoryNode key={node.path} node={node} depth={depth} />;
        }

        const displayName = node.name.replace(/\.md$/, '');
        const isActive = activeFilePath === node.path;

        return (
          <button
            key={node.path}
            onClick={() => openFile(node)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
              isActive
                ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
            )}
          >
            <FileText size={14} className="shrink-0 opacity-70" />
            <span className="truncate">{displayName}</span>
          </button>
        );
      })}
    </div>
  );
}
