import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { GitHubNode } from '../types';
import { useGitHubStore } from '../store/useGitHubStore';
import { cn } from '../lib/utils';

interface GitHubFileTreeProps {
  nodes: GitHubNode[];
  depth?: number;
}

function GitHubDirectoryNode({
  node,
  depth,
}: {
  node: Extract<GitHubNode, { kind: 'directory' }>;
  depth: number;
  key?: string;
}) {
  const toggleDirectory = useGitHubStore((s) => s.toggleDirectory);

  return (
    <div>
      <button
        onClick={() => toggleDirectory(node.path)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-sm rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left text-gray-600 dark:text-gray-400 font-medium"
      >
        {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="truncate">{node.name}</span>
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
            <GitHubFileTree nodes={node.children} depth={depth + 1} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GitHubFileTree({ nodes, depth = 0 }: GitHubFileTreeProps) {
  const openGitHubFile = useGitHubStore((s) => s.openGitHubFile);
  const activeFilePath = useGitHubStore((s) => s.activeFilePath);
  const fileLoadStatus = useGitHubStore((s) => s.fileLoadStatus);

  if (nodes.length === 0) return null;

  return (
    <div style={{ paddingLeft: depth > 0 ? '16px' : undefined }}>
      {nodes.map((node) => {
        if (node.kind === 'directory') {
          return <GitHubDirectoryNode key={node.path} node={node} depth={depth} />;
        }

        const displayName = node.name.replace(/\.md$/, '');
        const isActive = activeFilePath === node.path;
        const isLoading = isActive && fileLoadStatus === 'loading';

        return (
          <button
            key={node.path}
            onClick={() => openGitHubFile(node.path, node.downloadUrl)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-2xl transition-all duration-300 text-left mb-1',
              isActive
                ? 'bg-white dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 shadow-md border border-orange-200 dark:border-orange-500/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 transition-colors',
                isActive
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
              )}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
            </div>
            <span
              className={cn(
                'truncate font-medium',
                isActive ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {displayName}
            </span>
          </button>
        );
      })}
    </div>
  );
}
