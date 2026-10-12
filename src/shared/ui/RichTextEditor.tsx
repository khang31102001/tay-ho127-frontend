"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, List, ListOrdered, Quote, Undo2, Redo2 } from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

/**
 * UI primitive: soạn thảo nội dung định dạng (bold/italic/heading/list/quote)
 * bằng Tiptap, xuất ra HTML string qua onChange. Không biết Article/Page —
 * domain nào cần rich text đều dùng lại component này.
 */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] px-4 py-3 text-[14px] leading-6 text-brand-ink outline-none [&_h2]:mt-4 [&_h2]:text-[18px] [&_h2]:font-black [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-line [&_blockquote]:pl-3 [&_blockquote]:text-brand-muted",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  // Đồng bộ khi `value` đổi từ bên ngoài (vd. load dữ liệu bài viết có sẵn)
  // mà không phải do chính editor này gõ ra — tránh vòng lặp update.
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[260px] rounded-lg border border-brand-line bg-white" />
    );
  }

  const isEmpty = editor.isEmpty;

  return (
    <div className="overflow-hidden rounded-lg border border-brand-line bg-white focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20">
      <div className="flex flex-wrap items-center gap-1 border-b border-brand-line bg-brand-cream/40 px-2 py-1.5">
        <ToolbarButton
          label="Đậm"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Nghiêng"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Tiêu đề nhỏ"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Danh sách"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Danh sách số"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Trích dẫn"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-brand-line" />

        <ToolbarButton
          label="Hoàn tác"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Làm lại"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute left-4 top-3 text-[14px] text-brand-muted">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, active = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex size-7 items-center justify-center rounded transition ${
        active
          ? "bg-brand-green/15 text-brand-greenDark"
          : "text-brand-muted hover:bg-brand-green/10 hover:text-brand-greenDark"
      }`}
    >
      {children}
    </button>
  );
}
