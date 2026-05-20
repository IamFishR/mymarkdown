import React from 'react';
import { Bold, Italic, Strikethrough, Code, Quote, List, ListOrdered, Heading1, Heading2, Heading3 } from 'lucide-react';
import { cn } from '../lib/utils';

type AnyEditor = {
  isActive: (name: string, attrs?: Record<string, unknown>) => boolean;
  chain: () => { focus: () => { toggleHeading: (a: { level: number }) => { run: () => void }; toggleBold: () => { run: () => void }; toggleItalic: () => { run: () => void }; toggleStrike: () => { run: () => void }; toggleCode: () => { run: () => void }; toggleBulletList: () => { run: () => void }; toggleOrderedList: () => { run: () => void }; toggleBlockquote: () => { run: () => void } } };
};

const ToolbarBtn = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      'p-2 rounded-xl transition-all duration-300 shrink-0',
      active
        ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-105'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
    )}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1 shrink-0" />;

interface EditorToolbarProps {
  editor: AnyEditor | null;
  iconSize?: number;
}

export function EditorToolbar({ editor, iconSize = 16 }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarBtn title="H1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 size={iconSize} />
      </ToolbarBtn>
      <ToolbarBtn title="H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={iconSize} />
      </ToolbarBtn>
      <ToolbarBtn title="H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={iconSize} />
      </ToolbarBtn>

      <Sep />

      <ToolbarBtn title="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={iconSize} />
      </ToolbarBtn>
      <ToolbarBtn title="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={iconSize} />
      </ToolbarBtn>
      <ToolbarBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={iconSize} />
      </ToolbarBtn>
      <ToolbarBtn title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={iconSize} />
      </ToolbarBtn>

      <Sep />

      <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={iconSize} />
      </ToolbarBtn>
      <ToolbarBtn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={iconSize} />
      </ToolbarBtn>
      <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={iconSize} />
      </ToolbarBtn>
    </div>
  );
}
