'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  FileMinus,
  Undo2,
  Redo2
} from 'lucide-react';

const CustomTable = Table.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

interface AgreementEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function AgreementEditor({ value, onChange }: AgreementEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: {},
      }),
      Underline,
      TextStyle,
      Color,
      CustomTable.configure({
        resizable: false,
      }),
      CustomTableRow,
      CustomTableHeader,
      CustomTableCell,
    ],
    content: value || '<p>Start typing the agreement terms...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  // Predefined colors for the text color customizer
  const colors = [
    { name: 'Dark Purple', value: '#581c87' },
    { name: 'Light Purple', value: '#a78bfa' },
    { name: 'Slate Gray', value: '#475569' },
    { name: 'Emerald Green', value: '#059669' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Default Black', value: '#0f172a' }
  ];

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/30 border-b border-border">
        {/* Basic formatting */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Text color dropdown / shortcuts */}
        <div className="flex items-center gap-1 border border-border rounded-md px-1.5 py-0.5 bg-muted/40">
          <Palette className="h-3.5 w-3.5 text-muted-foreground mr-1" />
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              className="h-4 w-4 rounded-full border border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              onClick={() => editor.chain().focus().setColor(color.value).run()}
              title={color.name}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Page Break / Horizontal rule */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs font-semibold hover:text-primary gap-1 text-foreground"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Insert Page Break"
        >
          <FileMinus className="h-3.5 w-3.5 text-primary" /> Insert Page Break
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 min-h-[350px] max-h-[500px] overflow-y-auto prose dark:prose-invert prose-xs max-w-none focus:outline-none text-foreground bg-background">
        <EditorContent editor={editor} className="outline-none" />
      </div>

      <style jsx global>{`
        .ProseMirror {
          min-height: 350px;
          outline: none;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px dashed #a78bfa;
          margin: 24px 0;
          position: relative;
        }
        .ProseMirror hr::before {
          content: 'PAGE BREAK (Consistent Header/Footer will repeat)';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #faf5ff;
          color: #6b21a8;
          font-size: 9px;
          font-weight: 700;
          padding: 0 8px;
          border-radius: 4px;
          border: 1px solid #d8b4fe;
        }
        .dark .ProseMirror hr::before {
          background-color: #1e1b4b;
          color: #c084fc;
          border-color: #581c87;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 20px;
          margin-bottom: 8px;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 20px;
          margin-bottom: 8px;
        }
        .ProseMirror li {
          margin-bottom: 4px;
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 16px;
          margin-bottom: 8px;
          color: #581c87;
        }
        .dark .ProseMirror h1 {
          color: #c084fc;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 12px;
          margin-bottom: 6px;
          color: #6b21a8;
        }
        .dark .ProseMirror h2 {
          color: #d8b4fe;
        }
        .ProseMirror h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin-top: 8px;
          margin-bottom: 4px;
          color: #7e22ce;
        }
        .dark .ProseMirror h3 {
          color: #e9d5ff;
        }
        .ProseMirror p {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse !important;
          border: 1px solid #cbd5e1 !important;
          margin-bottom: 10px !important;
          table-layout: fixed !important;
        }
        .ProseMirror td:first-child:nth-last-child(2),
        .ProseMirror td:first-child:nth-last-child(2) ~ td,
        .ProseMirror th:first-child:nth-last-child(2),
        .ProseMirror th:first-child:nth-last-child(2) ~ th {
          width: 50% !important;
        }
        .ProseMirror td {
          padding: 6px !important;
          border: 1px solid #cbd5e1 !important;
          vertical-align: top;
          color: #334155 !important;
        }
        .ProseMirror th {
          padding: 6px !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 1px solid #cbd5e1 !important;
          background-color: #faf5ff;
          font-weight: bold;
          text-align: left;
          color: #581c87 !important;
        }
      `}</style>
    </div>
  );
}
