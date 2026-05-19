import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node !== null && typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return '';
}

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = extractText(children);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <button
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy code'}
        className={cn(
          'absolute top-3 right-3 p-1.5 rounded-2xl transition-all',
          'opacity-0 group-hover:opacity-100',
          'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
          'text-gray-600 dark:text-gray-300'
        )}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}
