import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { Container, Heading, Button, Input, Textarea, Text, Badge, Checkbox, Label, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  content?: string | null
  thumbnail?: string | null
  author_name?: string | null
  tags?: string[] | null
  is_published: boolean
  published_at?: string | null
  views: number
  created_at: string
  updated_at: string
}

const defaultDraft: Partial<BlogPost> = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  thumbnail: "",
  author_name: "",
  tags: [],
  is_published: false,
}

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch("/admin/blog-posts?limit=100", { credentials: "include" })
      const data = await res.json()
      setPosts(data.posts ?? [])
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
      const url = isNew ? "/admin/blog-posts" : `/admin/blog-posts/${editing.id}`
      const payload = { ...editing, tags: (editing.tags as any) || [] }
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Save failed")
      }
      toast.success(isNew ? "Blog post created" : "Blog post updated")
      setEditing(null)
      await reload()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this blog post?")) return
    const res = await fetch(`/admin/blog-posts/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      toast.success("Blog post deleted")
      await reload()
    } else {
      toast.error("Delete failed")
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Blog Posts</Heading>
        <Button size="small" onClick={() => setEditing({ ...defaultDraft })}>
          New Post
        </Button>
      </div>

      {editing ? (
        <div className="flex flex-col gap-4 p-6">
          <Heading level="h2">{editing.id ? "Edit Post" : "New Post"}</Heading>

          <Label>Title</Label>
          <Input
            placeholder="Post title"
            value={editing.title ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...(p || {}), title: e.target.value }))
            }
          />

          <Label>Slug (URL segment)</Label>
          <Input
            placeholder="my-first-post"
            value={editing.slug ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...(p || {}), slug: e.target.value }))
            }
          />

          <Label>Excerpt</Label>
          <Textarea
            rows={2}
            placeholder="One-line summary shown in cards"
            value={editing.excerpt ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...(p || {}), excerpt: e.target.value }))
            }
          />

          <Label>Thumbnail URL</Label>
          <Input
            placeholder="https://…/image.jpg"
            value={editing.thumbnail ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...(p || {}), thumbnail: e.target.value }))
            }
          />

          <Label>Author name</Label>
          <Input
            placeholder="Jane Doe"
            value={editing.author_name ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...(p || {}), author_name: e.target.value }))
            }
          />

          <Label>Tags (comma-separated)</Label>
          <Input
            placeholder="flowers, tips, guides"
            value={(editing.tags ?? []).join(", ")}
            onChange={(e) =>
              setEditing((p) => ({
                ...(p || {}),
                tags: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />

          <Label>Content (Markdown)</Label>
          <Textarea
            rows={12}
            placeholder="# Heading

Body text supports **markdown**."
            value={editing.content ?? ""}
            onChange={(e) =>
              setEditing((p) => ({ ...(p || {}), content: e.target.value }))
            }
          />

          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!editing.is_published}
              onCheckedChange={(v) =>
                setEditing((p) => ({ ...(p || {}), is_published: Boolean(v) }))
              }
              id="is_published"
            />
            <Label htmlFor="is_published">Published</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="p-6">
        {loading ? (
          <Text>Loading…</Text>
        ) : posts.length === 0 ? (
          <Text>No blog posts yet. Click "New Post" to create one.</Text>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-ui-fg-muted">
                <th className="py-2">Title</th>
                <th className="py-2">Slug</th>
                <th className="py-2">Status</th>
                <th className="py-2">Views</th>
                <th className="py-2">Updated</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-3 font-medium">{p.title}</td>
                  <td className="py-3 text-ui-fg-muted">/{p.slug}</td>
                  <td className="py-3">
                    {p.is_published ? (
                      <Badge color="green">Published</Badge>
                    ) : (
                      <Badge color="grey">Draft</Badge>
                    )}
                  </td>
                  <td className="py-3">{p.views}</td>
                  <td className="py-3 text-ui-fg-muted">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 space-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setEditing({ ...p, tags: p.tags ?? [] })}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => remove(p.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Blog Posts",
  icon: DocumentText,
})
