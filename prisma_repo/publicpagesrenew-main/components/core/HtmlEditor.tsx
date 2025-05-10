"use client";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

/**
 * Props para HtmlEditor (Tiptap)
 */
interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  readOnly?: boolean;
}

/**
 * Editor HTML reutilizable basado en Tiptap.
 */
export const HtmlEditor: React.FC<HtmlEditorProps> = ({
  value,
  onChange,
  label = "Contenido HTML",
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // Añadir esta línea para evitar error SSR
  });

  return (
    <div className="mb-4">
      {label && <label className="block mb-2 font-medium">{label}</label>}
      {/* Añadir clases prose para estilos básicos y padding */}
      <div className="border rounded bg-white p-2 prose max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default HtmlEditor;