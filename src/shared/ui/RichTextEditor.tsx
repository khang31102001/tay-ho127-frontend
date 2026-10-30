"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, Extension, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  Bold,
  ChevronDown,
  Code,
  Ellipsis,
  Eye,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListIndentDecrease,
  ListIndentIncrease,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Pencil,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table as TableIcon,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  Underline,
  Undo2,
} from "lucide-react";

import { cn } from "@/core/utils/cn";
import { RICH_TEXT_CONTENT_CLASS } from "./rich-text-content";

type RichTextEditorProps = {
  value: string;
  /** Nhận HTML; chuỗi rỗng khi editor không còn nội dung. */
  onChange: (html: string) => void;
  placeholder?: string;
  /** Giới hạn số từ — chặn gõ/dán vượt quá, Backend kiểm tra lại cùng con số. */
  maxWords?: number;
};

/**
 * UI primitive: soạn thảo rich text bằng Tiptap, xuất HTML qua onChange. Bố cục
 * theo kiểu trình soạn thảo cổ điển: tab Soạn thảo/Xem trước + Mở rộng toàn màn
 * hình, menubar, toolbar, status bar (thẻ đang đứng + số từ). Không biết
 * Article/Product — domain nào cần rich text đều dùng lại component này.
 */
export function RichTextEditor({ value, onChange, placeholder, maxWords }: RichTextEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isExpanded, setIsExpanded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // H1 dành cho tiêu đề trang (tên bài/tên món) — nội dung chỉ dùng H2–H4.
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
      WordLimit.configure({ limit: maxWords }),
    ],
    content: value,
    immediatelyRender: false,
    // Toolbar/status bar đọc trạng thái editor trong render nên cần render lại theo từng transaction.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: cn(RICH_TEXT_CONTENT_CLASS, "min-h-full px-5 py-4 outline-none"),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  // Đồng bộ khi `value` đổi từ bên ngoài (vd. load dữ liệu có sẵn) mà không phải
  // do chính editor này gõ ra — tránh vòng lặp update.
  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  if (!editor) {
    return <div className="h-[460px] rounded-lg border border-slate-300 bg-white" />;
  }

  const wordCount = countWords(editor.state.doc);
  const isAtLimit = maxWords !== undefined && wordCount >= maxWords;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800",
        isExpanded && "fixed inset-0 z-[60] rounded-none",
      )}
    >
      {/* Thanh tab tối: Soạn thảo / Xem trước + Mở rộng */}
      <div className="flex items-center justify-between gap-3 px-2 py-2">
        <div className="flex rounded-lg bg-white/10 p-1" role="tablist" aria-label="Chế độ trình soạn thảo">
          <ModeTab isActive={mode === "edit"} onClick={() => setMode("edit")} icon={<Pencil className="size-4" />}>
            Soạn thảo
          </ModeTab>
          <ModeTab isActive={mode === "preview"} onClick={() => setMode("preview")} icon={<Eye className="size-4" />}>
            Xem trước
          </ModeTab>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? "Thu nhỏ trình soạn thảo" : "Mở rộng trình soạn thảo"}
          onClick={() => setIsExpanded((current) => !current)}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 text-[13px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          <span className="hidden sm:inline">{isExpanded ? "Thu nhỏ" : "Mở rộng"}</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-t-lg bg-white">
        {mode === "edit" ? (
          <>
            <div className="border-b border-slate-200 shadow-[0_2px_6px_rgba(15,23,42,0.06)]">
              <EditorMenubar editor={editor} onPreview={() => setMode("preview")} onToggleExpand={() => setIsExpanded((current) => !current)} />
              <EditorToolbar editor={editor} />
            </div>

            <div
              className={cn(
                "relative overflow-y-auto",
                isExpanded ? "flex-1" : "h-[360px] min-h-[200px] resize-y",
              )}
            >
              {editor.isEmpty && placeholder && (
                <span className="pointer-events-none absolute left-5 top-[22px] text-[15px] text-slate-400">
                  {placeholder}
                </span>
              )}
              <EditorContent editor={editor} className="h-full" />
            </div>
          </>
        ) : (
          <div className={cn("overflow-y-auto", isExpanded ? "flex-1" : "h-[454px]")}>
            {editor.isEmpty ? (
              <p className="px-5 py-4 text-[14px] text-slate-400">Chưa có nội dung.</p>
            ) : (
              // HTML do chính ProseMirror serialize theo schema của editor (không nhận HTML thô từ ngoài) nên an toàn để xem trước.
              <div className={cn(RICH_TEXT_CONTENT_CLASS, "px-5 py-4")} dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            )}
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-3 py-1 text-[12px] text-slate-500">
          <span className="truncate font-mono">{getSelectionPath(editor)}</span>
          {isAtLimit && <span className="hidden font-semibold text-brand-red sm:inline">Đã đạt giới hạn số từ</span>}
          <span className={cn("shrink-0 tabular-nums", isAtLimit && "font-semibold text-brand-red")}>
            {maxWords !== undefined
              ? `${wordCount.toLocaleString("vi-VN")} / ${maxWords.toLocaleString("vi-VN")} từ`
              : `${wordCount.toLocaleString("vi-VN")} từ`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * GIỚI HẠN SỐ TỪ
 * ======================================================= */

/** Đếm từ theo text hiển thị — cùng cách Backend đếm (bỏ thẻ, tách theo khoảng trắng). */
function countWords(doc: ProseMirrorNode): number {
  const text = doc.textBetween(0, doc.content.size, " ", " ");
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Chặn mọi thay đổi làm số từ vượt `limit` (gõ, dán, kéo thả). Vẫn cho phép xóa
 * khi nội dung cũ đã vượt giới hạn, và cho phép nạp dữ liệu có sẵn
 * (setContent với emitUpdate: false gắn meta "preventUpdate").
 */
const WordLimit = Extension.create<{ limit: number | undefined }>({
  name: "wordLimit",

  addOptions() {
    return { limit: undefined };
  },

  addProseMirrorPlugins() {
    const { limit } = this.options;
    if (limit === undefined) {
      return [];
    }

    return [
      new Plugin({
        key: new PluginKey("wordLimit"),
        filterTransaction: (transaction, state) => {
          if (!transaction.docChanged || transaction.getMeta("preventUpdate")) {
            return true;
          }

          const nextCount = countWords(transaction.doc);
          return nextCount <= limit || nextCount <= countWords(state.doc);
        },
      }),
    ];
  },
});

/* =========================================================
 * STATUS BAR: ĐƯỜNG DẪN THẺ
 * ======================================================= */

const NODE_TAGS: Record<string, string> = {
  paragraph: "p",
  bulletList: "ul",
  orderedList: "ol",
  listItem: "li",
  blockquote: "blockquote",
  codeBlock: "pre",
  table: "table",
  tableRow: "tr",
  tableCell: "td",
  tableHeader: "th",
};

function getSelectionPath(editor: Editor): string {
  const { $from } = editor.state.selection;
  const tags: string[] = [];

  for (let depth = 1; depth <= $from.depth; depth += 1) {
    const node = $from.node(depth);
    const tag = node.type.name === "heading" ? `h${node.attrs.level}` : NODE_TAGS[node.type.name];
    if (tag) {
      tags.push(tag);
    }
  }

  return tags.join(" › ") || "p";
}

/* =========================================================
 * HÀNH ĐỘNG DÙNG CHUNG CHO MENUBAR + TOOLBAR
 * ======================================================= */

function promptLink(editor: Editor) {
  const currentHref = (editor.getAttributes("link").href as string | undefined) ?? "https://";
  const href = window.prompt("Nhập đường dẫn (để trống để gỡ liên kết)", currentHref);
  if (href === null) {
    return;
  }

  const trimmedHref = href.trim();
  if (trimmedHref === "" || trimmedHref === "https://") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.chain().focus().extendMarkRange("link").setLink({ href: trimmedHref }).run();
}

function promptImage(editor: Editor) {
  const src = window.prompt("Nhập URL ảnh (http/https)", "https://");
  if (src === null) {
    return;
  }

  const trimmedSrc = src.trim();
  // Chỉ nhận ảnh http(s) — trùng với whitelist sanitize ở Backend và Site.
  if (!/^https?:\/\/\S+$/i.test(trimmedSrc)) {
    window.alert("URL ảnh phải bắt đầu bằng http:// hoặc https://");
    return;
  }

  const alt = window.prompt("Mô tả ảnh (alt) — giúp SEO và người dùng trình đọc màn hình", "") ?? "";
  editor.chain().focus().setImage({ src: trimmedSrc, alt: alt.trim() }).run();
}

function insertTable(editor: Editor) {
  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
}

type BlockType = "paragraph" | "h2" | "h3" | "h4";

const BLOCK_OPTIONS: { value: BlockType; label: string }[] = [
  { value: "paragraph", label: "Đoạn văn" },
  { value: "h2", label: "Tiêu đề 2" },
  { value: "h3", label: "Tiêu đề 3" },
  { value: "h4", label: "Tiêu đề 4" },
];

function getBlockType(editor: Editor): BlockType {
  for (const level of [2, 3, 4] as const) {
    if (editor.isActive("heading", { level })) {
      return `h${level}`;
    }
  }
  return "paragraph";
}

function setBlockType(editor: Editor, blockType: BlockType) {
  if (blockType === "paragraph") {
    editor.chain().focus().setParagraph().run();
    return;
  }

  const level = Number(blockType.slice(1)) as 2 | 3 | 4;
  editor.chain().focus().setHeading({ level }).run();
}

/* =========================================================
 * MENUBAR
 * ======================================================= */

type MenuItem = {
  label: string;
  shortcut?: string;
  onSelect: () => void;
  isDisabled?: boolean;
};

type EditorMenubarProps = {
  editor: Editor;
  onPreview: () => void;
  onToggleExpand: () => void;
};

function EditorMenubar({ editor, onPreview, onToggleExpand }: EditorMenubarProps) {
  const chain = () => editor.chain().focus();
  const isInTable = editor.isActive("table");

  const menus: { label: string; items: MenuItem[] }[] = [
    {
      label: "Chỉnh sửa",
      items: [
        { label: "Hoàn tác", shortcut: "Ctrl+Z", onSelect: () => chain().undo().run(), isDisabled: !editor.can().undo() },
        { label: "Làm lại", shortcut: "Ctrl+Y", onSelect: () => chain().redo().run(), isDisabled: !editor.can().redo() },
        { label: "Chọn tất cả", shortcut: "Ctrl+A", onSelect: () => chain().selectAll().run() },
        { label: "Xóa định dạng", onSelect: () => chain().unsetAllMarks().clearNodes().run() },
      ],
    },
    {
      label: "Xem",
      items: [
        { label: "Xem trước", onSelect: onPreview },
        { label: "Mở rộng / thu nhỏ", shortcut: "Esc", onSelect: onToggleExpand },
      ],
    },
    {
      label: "Chèn",
      items: [
        { label: "Liên kết", onSelect: () => promptLink(editor) },
        { label: "Hình ảnh", onSelect: () => promptImage(editor) },
        { label: "Bảng 3×3", onSelect: () => insertTable(editor) },
        { label: "Đường kẻ ngang", onSelect: () => chain().setHorizontalRule().run() },
      ],
    },
    {
      label: "Định dạng",
      items: [
        { label: "Đậm", shortcut: "Ctrl+B", onSelect: () => chain().toggleBold().run() },
        { label: "Nghiêng", shortcut: "Ctrl+I", onSelect: () => chain().toggleItalic().run() },
        { label: "Gạch chân", shortcut: "Ctrl+U", onSelect: () => chain().toggleUnderline().run() },
        { label: "Gạch ngang", onSelect: () => chain().toggleStrike().run() },
        { label: "Mã", onSelect: () => chain().toggleCode().run() },
        { label: "Trích dẫn", onSelect: () => chain().toggleBlockquote().run() },
        ...BLOCK_OPTIONS.map((option) => ({ label: option.label, onSelect: () => setBlockType(editor, option.value) })),
      ],
    },
    {
      label: "Bảng",
      items: [
        { label: "Chèn bảng 3×3", onSelect: () => insertTable(editor) },
        { label: "Thêm hàng phía trên", onSelect: () => chain().addRowBefore().run(), isDisabled: !isInTable },
        { label: "Thêm hàng phía dưới", onSelect: () => chain().addRowAfter().run(), isDisabled: !isInTable },
        { label: "Thêm cột bên trái", onSelect: () => chain().addColumnBefore().run(), isDisabled: !isInTable },
        { label: "Thêm cột bên phải", onSelect: () => chain().addColumnAfter().run(), isDisabled: !isInTable },
        { label: "Xóa hàng", onSelect: () => chain().deleteRow().run(), isDisabled: !isInTable },
        { label: "Xóa cột", onSelect: () => chain().deleteColumn().run(), isDisabled: !isInTable },
        { label: "Bật/tắt hàng tiêu đề", onSelect: () => chain().toggleHeaderRow().run(), isDisabled: !isInTable },
        { label: "Xóa bảng", onSelect: () => chain().deleteTable().run(), isDisabled: !isInTable },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 pt-1.5" role="menubar">
      {menus.map((menu) => (
        <DropdownMenu key={menu.label} label={menu.label} items={menu.items} />
      ))}
    </div>
  );
}

function DropdownMenu({ label, items, trigger }: { label: string; items: MenuItem[]; trigger?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={trigger ? label : undefined}
        title={trigger ? label : undefined}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex items-center rounded text-[14px] text-slate-800 transition hover:bg-slate-100",
          trigger ? "size-8 justify-center" : "px-2 py-1",
          isOpen && "bg-slate-100",
        )}
      >
        {trigger ?? label}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.isDisabled}
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              className="flex w-full items-center justify-between gap-6 px-3 py-1.5 text-left text-[13px] text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="text-[12px] text-slate-400">{item.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * TOOLBAR
 * ======================================================= */

function EditorToolbar({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();
  const isInList = editor.isActive("listItem");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 py-1.5" role="toolbar" aria-label="Định dạng">
      <ToolbarGroup>
        <ToolbarButton label="Hoàn tác" onClick={() => chain().undo().run()} isDisabled={!editor.can().undo()}>
          <Undo2 className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Làm lại" onClick={() => chain().redo().run()} isDisabled={!editor.can().redo()}>
          <Redo2 className="size-5" />
        </ToolbarButton>
      </ToolbarGroup>

      <div className="relative">
        <select
          aria-label="Kiểu đoạn"
          value={getBlockType(editor)}
          onChange={(event) => setBlockType(editor, event.target.value as BlockType)}
          className="h-8 w-[130px] appearance-none rounded bg-slate-100 pl-2 pr-7 text-[14px] text-slate-800 outline-none transition hover:bg-slate-200 focus:ring-2 focus:ring-slate-300"
        >
          {BLOCK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      </div>

      <ToolbarGroup>
        <ToolbarButton label="Đậm (Ctrl+B)" isActive={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
          <Bold className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Nghiêng (Ctrl+I)" isActive={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
          <Italic className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Gạch chân (Ctrl+U)" isActive={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}>
          <Underline className="size-5" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Căn trái" isActive={editor.isActive({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}>
          <TextAlignStart className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Căn giữa" isActive={editor.isActive({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}>
          <TextAlignCenter className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Căn phải" isActive={editor.isActive({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}>
          <TextAlignEnd className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Căn đều" isActive={editor.isActive({ textAlign: "justify" })} onClick={() => chain().setTextAlign("justify").run()}>
          <TextAlignJustify className="size-5" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Danh sách" isActive={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
          <List className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Danh sách số" isActive={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Giảm thụt lề" isDisabled={!isInList} onClick={() => chain().liftListItem("listItem").run()}>
          <ListIndentDecrease className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Tăng thụt lề" isDisabled={!isInList} onClick={() => chain().sinkListItem("listItem").run()}>
          <ListIndentIncrease className="size-5" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarButton label="Liên kết" isActive={editor.isActive("link")} onClick={() => promptLink(editor)}>
          <LinkIcon className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Hình ảnh" onClick={() => promptImage(editor)}>
          <ImageIcon className="size-5" />
        </ToolbarButton>
        <ToolbarButton label="Chèn bảng" isActive={editor.isActive("table")} onClick={() => insertTable(editor)}>
          <TableIcon className="size-5" />
        </ToolbarButton>
      </ToolbarGroup>

      <DropdownMenu
        label="Thêm định dạng"
        trigger={<Ellipsis className="size-5" />}
        items={[
          { label: "Gạch ngang", onSelect: () => chain().toggleStrike().run() },
          { label: "Mã", onSelect: () => chain().toggleCode().run() },
          { label: "Trích dẫn", onSelect: () => chain().toggleBlockquote().run() },
          { label: "Đường kẻ ngang", onSelect: () => chain().setHorizontalRule().run() },
          { label: "Xóa định dạng", onSelect: () => chain().unsetAllMarks().clearNodes().run() },
        ]}
      />
    </div>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

type ToolbarButtonProps = {
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ label, isActive = false, isDisabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent",
        isActive && "bg-slate-200 hover:bg-slate-200",
      )}
    >
      {children}
    </button>
  );
}

type ModeTabProps = {
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
};

function ModeTab({ isActive, onClick, icon, children }: ModeTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[14px] font-semibold transition sm:px-3",
        isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-200",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
