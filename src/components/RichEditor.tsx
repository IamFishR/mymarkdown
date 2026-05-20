import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Strikethrough, Code } from 'lucide-react';
import { cn } from '../lib/utils';
import { EditorToolbar } from './EditorToolbar';

interface RichEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  onEditorReady?: (editor: unknown) => void;
}

const BubbleBtn = ({
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

export function RichEditor({ initialContent, onChange, readOnly = false, onEditorReady }: RichEditorProps) {
  const onEditorReadyRef = useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
      }),
      Highlight,
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate({ editor }) {
      if (readOnly) return;
      const md = (editor.storage as any).markdown.getMarkdown();
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-orange max-w-none outline-none min-h-[500px] py-10 w-full',
        spellcheck: 'false',
      },
    },
  });

  useEffect(() => {
    onEditorReadyRef.current?.(editor);
    return () => { onEditorReadyRef.current?.(null); };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="w-full relative flex flex-col min-h-full">
      {/* Sticky Toolbar - mobile only, hidden in read-only mode */}
      <div className={cn("md:hidden sticky top-0 z-20 w-full pt-1 pb-4 pointer-events-none", readOnly && "hidden")}>
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
          <div className="bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-2xl shadow-xl border border-white/20 dark:border-white/10 flex items-center gap-1 px-3 py-2 pointer-events-auto overflow-x-auto no-scrollbar whitespace-nowrap">
            <EditorToolbar editor={editor} />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 w-full px-4 sm:px-8 md:px-10">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>

      {/* Bubble Menu - hidden in read-only mode */}
      {!readOnly && <BubbleMenu editor={editor} tippyOptions={{ duration: 150, animation: 'scale' }}>
        <div className="flex items-center gap-1 p-1.5 bg-white/20 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] border border-white/30 dark:border-white/10 animate-in fade-in zoom-in duration-200">
          <BubbleBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={14} />
          </BubbleBtn>
          <BubbleBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={14} />
          </BubbleBtn>
          <BubbleBtn title="Highlight" active={editor.isActive('highlight')} onClick={() => (editor as any).chain().focus().toggleHighlight().run()}>
            <div className={cn(
              "w-4 h-4 rounded-full border-2",
              editor.isActive('highlight') ? "bg-white border-white" : "bg-orange-500 border-orange-500/20"
            )} />
          </BubbleBtn>
          <Sep />
          <BubbleBtn title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code size={14} />
          </BubbleBtn>
          <BubbleBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={14} />
          </BubbleBtn>
        </div>
      </BubbleMenu>}
    </div>
  );
}
