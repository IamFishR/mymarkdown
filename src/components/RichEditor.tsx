import React, { useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Highlighter,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface RichEditorProps {
  key?: string;
  initialContent: string;
  onChange: (markdown: string) => void;
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'p-1.5 rounded-2xl transition-all duration-200 active:scale-90',
        active
          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 glow-orange-sm'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      )}
    >
      {children}
    </button>
  );
}

const Sep = () => <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5 self-center" />;

export function RichEditor({ initialContent, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({ placeholder: '# Start writing your markdown…' }),
      Highlight.configure({ multicolor: false }),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-orange max-w-none outline-none',
        spellcheck: 'false',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-transparent relative scroll-smooth">
      {/* Floating Toolbar - Sticky within the scroll area */}
      <div className="sticky top-0 z-20 w-full pt-20 md:pt-24 pb-1 md:pb-4 px-4 sm:px-8 md:px-10 pointer-events-none shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/20 dark:bg-[#0a0a0a]/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 dark:border-white/5 flex items-center gap-0.5 px-3 py-1.5 flex-wrap pointer-events-auto">
            <ToolbarBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 size={16} />
            </ToolbarBtn>

            <Sep />

            <ToolbarBtn title="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
              <Code size={16} />
            </ToolbarBtn>

            <Sep />

            <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote size={16} />
            </ToolbarBtn>
          </div>
        </div>
      </div>

      {/* Bubble Menu */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 150, animation: 'shift-away' }}>
        <div className="flex items-center gap-1 p-1 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-xl rounded-2xl shadow-2xl glow-orange-sm border border-white/20 dark:border-white/10">
          <ToolbarBtn
            title="Bold (⌘B)"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Italic (⌘I)"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Strikethrough"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Highlight"
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            title="Inline code"
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code size={16} />
          </ToolbarBtn>
        </div>
      </BubbleMenu>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto bg-transparent">
        {/* Top Spacer */}
        <div className="h-4 w-full shrink-0" />
        <div className="max-w-4xl mx-auto px-4 py-2 sm:px-8 md:px-10 sm:py-4">
          <EditorContent editor={editor} />
        </div>
        {/* Bottom Spacer */}
        <div className="h-28 w-full shrink-0" />
      </div>
    </div>
  );
}
