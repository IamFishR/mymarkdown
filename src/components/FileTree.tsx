import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { FolderNode } from '../types';
import { useFSStore } from '../store/useFSStore';
import { cn } from '../lib/utils';

interface FileTreeProps {
  nodes: FolderNode[];
  depth?: number;
}

export function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  const toggleDirectory = useFSStore((s) => s.toggleDirectory);
  const openFile = useFSStore((s) => s.openFile);
  const activeFilePath = useFSStore((s) => s.activeFilePath);

  if (nodes.length === 0) return null;

  return (
    <div style={{ paddingLeft: depth > 0 ? '16px' : undefined }}>
      {nodes.map((node) => {
        if (node.kind === 'directory') {
          return (
            <div key={node.path}>
              <button
                onClick={() => toggleDirectory(node.path)}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left text-gray-600 dark:text-gray-400"
              >
                {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="truncate font-medium">{node.name}</span>
              </button>
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
                    <FileTree nodes={node.children} depth={depth + 1} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
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
