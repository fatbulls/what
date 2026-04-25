import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect } from "react"

// Local stylesheet for the editor area — kept in this file so no global
// CSS file is required to register an admin extension.
const TIPTAP_STYLES = `
.tiptap-content { font-size: 14px; line-height: 1.6; color: var(--fg-base, #18181b); }
.tiptap-content > * + * { margin-top: 0.75em; }
.tiptap-content h2 { font-size: 1.4em; font-weight: 600; margin-top: 1.2em; }
.tiptap-content h3 { font-size: 1.18em; font-weight: 600; margin-top: 1em; }
.tiptap-content h4 { font-size: 1.05em; font-weight: 600; margin-top: 0.9em; }
.tiptap-content p { margin: 0; }
.tiptap-content ul, .tiptap-content ol { padding-left: 1.5em; }
.tiptap-content ul { list-style: disc; }
.tiptap-content ol { list-style: decimal; }
.tiptap-content blockquote { padding-left: 1em; border-left: 3px solid var(--border-base, #e4e4e7); color: var(--fg-subtle, #52525b); }
.tiptap-content code { background: var(--bg-subtle, #f4f4f5); padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.9em; }
.tiptap-content a { color: #2563eb; text-decoration: underline; }
.tiptap-content hr { border: 0; border-top: 1px solid var(--border-base, #e4e4e7); margin: 1.4em 0; }
.tiptap-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--fg-muted, #a1a1aa);
  pointer-events: none;
  float: left;
  height: 0;
}
.tiptap-content:focus { outline: none; }
`

// Inject styles once, at module load (admin Vite bundle context).
if (typeof document !== "undefined" && !document.getElementById("__tiptap_styles")) {
  const s = document.createElement("style")
  s.id = "__tiptap_styles"
  s.textContent = TIPTAP_STYLES
  document.head.appendChild(s)
}

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minRows?: number
}

// Toolbar button — kept tiny (text labels, no icons) so it slots into
// Medusa's admin density without needing matching iconography.
const TBBtn = ({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`px-2 py-1 text-xs rounded border transition-colors ${
      active
        ? "border-ui-border-strong bg-ui-bg-base-pressed text-ui-fg-base"
        : "border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-base hover:text-ui-fg-base"
    }`}
  >
    {children}
  </button>
)

// Tiptap-backed rich-text editor for admin content fields. Emits HTML on
// every change. The wrapper styling matches the @medusajs/ui Textarea
// look (border, padding, focus ring) so it blends with the rest of the
// admin form.
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minRows = 14,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Heading levels we care about: h2 + h3 inside content; h1 is
        // the page title rendered separately.
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing…",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "tiptap-content prose prose-sm max-w-none focus:outline-none",
        style: `min-height: ${minRows * 24}px`,
      },
    },
    immediatelyRender: false,
  })

  // Sync external value changes (e.g. switching from one row to another)
  // without losing local edits unless they actually differ.
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false } as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) {
    return (
      <div
        className={`border border-ui-border-base rounded-md p-3 bg-ui-bg-base ${className ?? ""}`}
        style={{ minHeight: minRows * 24 + 48 }}
      />
    )
  }

  const promptLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL (leave empty to remove)", prev || "")
    if (url === null) return
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }

  return (
    <div
      className={`border border-ui-border-base rounded-md bg-ui-bg-base focus-within:border-ui-border-interactive transition-colors ${className ?? ""}`}
    >
      <div className="flex flex-wrap gap-1 p-2 border-b border-ui-border-base bg-ui-bg-subtle rounded-t-md">
        <TBBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          H2
        </TBBtn>
        <TBBtn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          H3
        </TBBtn>
        <TBBtn
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Paragraph"
        >
          P
        </TBBtn>
        <span className="w-px bg-ui-border-base mx-1 self-stretch" />
        <TBBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </TBBtn>
        <TBBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </TBBtn>
        <TBBtn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <s>S</s>
        </TBBtn>
        <TBBtn
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          {"</>"}
        </TBBtn>
        <span className="w-px bg-ui-border-base mx-1 self-stretch" />
        <TBBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          • List
        </TBBtn>
        <TBBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          1. List
        </TBBtn>
        <TBBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          ❝ Quote
        </TBBtn>
        <span className="w-px bg-ui-border-base mx-1 self-stretch" />
        <TBBtn active={editor.isActive("link")} onClick={promptLink} title="Link">
          🔗 Link
        </TBBtn>
        <TBBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          —
        </TBBtn>
        <span className="flex-1" />
        <TBBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          ↶
        </TBBtn>
        <TBBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          ↷
        </TBBtn>
      </div>

      <EditorContent editor={editor} className="px-3 py-2.5" />
    </div>
  )
}
