import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Text,
  Switch,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import RichTextEditor from "../../components/rich-text-editor"

type Page = {
  id: string
  slug: string
  title: string
  content: string | null
  meta_description: string | null
  is_published: boolean
  created_at?: string
  updated_at?: string
}

const emptyDraft: Partial<Page> = {
  slug: "",
  title: "",
  content: "",
  meta_description: "",
  is_published: true,
}

export default function PagesRoute() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Page> | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch("/admin/pages", { credentials: "include" })
      const data = await res.json()
      setPages(data.pages ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  async function save() {
    if (!editing) return
    setSaving(true)
    try {
      const isNew = !editing.id
      const url = isNew ? "/admin/pages" : `/admin/pages/${editing.id}`
      const method = isNew ? "POST" : "PUT"
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Save failed")
      }
      toast.success(isNew ? "Page created" : "Page updated")
      setEditing(null)
      await reload()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this page?")) return
    const res = await fetch(`/admin/pages/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.status >= 400) {
      toast.error("Delete failed")
      return
    }
    toast.success("Deleted")
    await reload()
  }

  if (editing) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>{editing.id ? "Edit Page" : "New Page"}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Pages render at /{editing.slug || "{slug}"} on the storefront.
            </Text>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="small" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="small" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <Label size="small" weight="plus">Slug</Label>
            <Input
              value={editing.slug ?? ""}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              placeholder="privacy"
              disabled={!!editing.id}
            />
          </div>
          <div>
            <Label size="small" weight="plus">Title</Label>
            <Input
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Privacy Policy"
            />
          </div>
          <div>
            <Label size="small" weight="plus">Meta description</Label>
            <Input
              value={editing.meta_description ?? ""}
              onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
              placeholder="Short summary for search engines"
            />
          </div>
          <div>
            <Label size="small" weight="plus">Content</Label>
            <RichTextEditor
              value={editing.content ?? ""}
              onChange={(html) => setEditing({ ...editing, content: html })}
              placeholder="Start writing the page content…"
              minRows={16}
            />
            <Text size="xsmall" className="text-ui-fg-subtle mt-1">
              Use the toolbar for headings, lists, links, and quotes. Output is stored as semantic HTML.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={editing.is_published !== false}
              onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
            />
            <Label size="small">Published</Label>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Pages</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Slug-addressable content pages (privacy, terms, FAQ, about…).
          </Text>
        </div>
        <Button size="small" onClick={() => setEditing(emptyDraft)}>+ New page</Button>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">Loading…</Text>
        ) : pages.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">No pages yet.</Text>
        ) : (
          <div className="space-y-2">
            {pages.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border border-ui-border-base rounded-md p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ui-fg-base">{p.title}</div>
                  <div className="text-xs text-ui-fg-subtle mt-0.5">/{p.slug} · {p.is_published ? "published" : "draft"}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-3">
                  <Button size="small" variant="secondary" onClick={() => setEditing(p)}>
                    Edit
                  </Button>
                  <Button size="small" variant="danger" onClick={() => remove(p.id)}>
                    Del
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Pages",
  icon: DocumentText,
})
