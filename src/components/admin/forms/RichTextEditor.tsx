"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
//import TextStyle from "@tiptap/extension-text-style";
//import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style"; // ✅ Named import
import { Color } from "@tiptap/extension-color"; // ✅ Named import
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { useCallback, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // const editor = useEditor({
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder || "Write your content here...",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || imageUrl === "") return;

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl("");
  }, [editor, imageUrl]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-2 transition-colors hover:bg-gray-200 ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-700"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-300 bg-gray-50 p-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Code"
          >
            <Code size={18} />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote size={18} />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <AlignJustify size={18} />
          </ToolbarButton>
        </div>

        {/* Link & Image */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive("link")}
            title="Add Link"
          >
            <LinkIcon size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowImageInput(!showImageInput)} title="Add Image">
            <ImageIcon size={18} />
          </ToolbarButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={18} />
          </ToolbarButton>
        </div>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex gap-2 border-b border-gray-300 bg-blue-50 p-3">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL (e.g., https://example.com)"
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              }
            }}
          />
          <button
            type="button"
            onClick={setLink}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Link
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Image Input */}
      {showImageInput && (
        <div className="flex gap-2 border-b border-gray-300 bg-green-50 p-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
          />
          <button
            type="button"
            onClick={addImage}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Add Image
          </button>
          <button
            type="button"
            onClick={() => setShowImageInput(false)}
            className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror {
          min-height: 400px;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.75em;
          margin-bottom: 0.75em;
        }

        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 16px;
          margin: 16px 0;
          color: #6b7280;
          font-style: italic;
        }

        .ProseMirror code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        .ProseMirror pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
          font-size: inherit;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 24px;
          margin: 12px 0;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          color: #1e40af;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
}
