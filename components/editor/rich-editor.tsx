"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sincroniza quando o conteúdo muda por fora (ex.: geração por IA).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, false);
  }, [value, editor]);

  if (!editor) return null;

  const tools: [string, () => void, boolean][] = [
    ["Negrito", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
    ["Itálico", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
    ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
    ["H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 })],
    ["Lista", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
    ["Numerada", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")],
    ["Citação", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote")],
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-md border border-slate-300 bg-slate-100 p-2">
        {tools.map(([label, run, active]) => (
          <button
            key={label}
            type="button"
            onClick={run}
            aria-pressed={active}
            className={cn("rounded px-2 py-1 text-xs", active ? "bg-brand-600 text-white" : "bg-white hover:bg-slate-200")}
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="prose-content" />
    </div>
  );
}
