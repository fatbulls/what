import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Photo } from "@medusajs/icons"
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
import { useEffect, useRef, useState } from "react"

type Banner = {
  id: string
  slot: string
  title: string
  link: string | null
  image_url: string
  image_url_mobile: string | null
  position: number
  is_active: boolean
}

const SLOT = "hero"
const MAX_VISIBLE = 6

const emptyDraft: Partial<Banner> = {
  slot: SLOT,
  title: "",
  link: "",
  image_url: "",
  image_url_mobile: "",
  position: 0,
  is_active: true,
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Banner> | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const desktopFileRef = useRef<HTMLInputElement>(null)
  const mobileFileRef = useRef<HTMLInputElement>(null)

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch(`/admin/banners?slot=${SLOT}`, {
        credentials: "include",
      })
      const data = await res.json()
      setBanners(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  async function uploadFile(file: File, fieldKey: string) {
    setUploadingKey(fieldKey)
    try {
      const fd = new FormData()
      fd.append("files", file)
      const res = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: fd,
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`upload failed (${res.status}): ${txt.slice(0, 200)}`)
      }
      const json = await res.json()
      const url = json?.files?.[0]?.url
      if (!url) throw new Error("upload returned no URL")
      setEditing((prev) => ({ ...(prev || {}), [fieldKey]: url }))
      toast.success("Image uploaded")
    } catch (e: any) {
      toast.error(e.message || "Upload failed")
    } finally {
      setUploadingKey(null)
    }
  }

  async function save() {
    if (!editing) return
    if (!editing.title?.trim()) {
      toast.error("Title is required")
      return
    }
    if (!editing.image_url?.trim()) {
      toast.error("Desktop image URL is required")
      return
    }
    setSaving(true)
    try {
      const isNew = !editing.id
      const url = isNew ? "/admin/banners" : `/admin/banners/${editing.id}`
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
      toast.success(isNew ? "Banner created" : "Banner updated")
      setEditing(null)
      await reload()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return
    const res = await fetch(`/admin/banners/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      toast.success("Deleted")
      await reload()
    } else {
      toast.error("Delete failed")
    }
  }

  const activeCount = banners.filter((b) => b.is_active).length
  const visibleCount = Math.min(activeCount, MAX_VISIBLE)

  if (editing) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>{editing.id ? "Edit Banner" : "New Banner"}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Renders in the home-page hero slider.
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
            <Label size="small" weight="plus">Title</Label>
            <Input
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Spring Collection"
            />
          </div>

          <div>
            <Label size="small" weight="plus">Link (URL)</Label>
            <Input
              value={editing.link ?? ""}
              onChange={(e) => setEditing({ ...editing, link: e.target.value })}
              placeholder="/category/spring or https://…"
            />
            <Text size="xsmall" className="text-ui-fg-subtle mt-1">
              Where the banner takes the visitor when clicked. Leave empty for a decorative banner.
            </Text>
          </div>

          <div>
            <Label size="small" weight="plus">Desktop image *</Label>
            <div className="flex gap-2 items-center mt-1">
              <Input
                value={editing.image_url ?? ""}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                placeholder="https://… (or click Upload)"
              />
              <input
                ref={desktopFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadFile(f, "image_url")
                  if (desktopFileRef.current) desktopFileRef.current.value = ""
                }}
              />
              <Button
                size="small"
                variant="secondary"
                disabled={uploadingKey === "image_url"}
                onClick={() => desktopFileRef.current?.click()}
              >
                {uploadingKey === "image_url" ? "Uploading…" : "Upload"}
              </Button>
            </div>
            {editing.image_url ? (
              <img
                src={editing.image_url}
                alt=""
                className="mt-2 max-h-32 rounded border border-ui-border-base object-contain bg-ui-bg-subtle"
              />
            ) : null}
          </div>

          <div>
            <Label size="small" weight="plus">Mobile image (optional)</Label>
            <div className="flex gap-2 items-center mt-1">
              <Input
                value={editing.image_url_mobile ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, image_url_mobile: e.target.value })
                }
                placeholder="https://… (falls back to desktop image when empty)"
              />
              <input
                ref={mobileFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadFile(f, "image_url_mobile")
                  if (mobileFileRef.current) mobileFileRef.current.value = ""
                }}
              />
              <Button
                size="small"
                variant="secondary"
                disabled={uploadingKey === "image_url_mobile"}
                onClick={() => mobileFileRef.current?.click()}
              >
                {uploadingKey === "image_url_mobile" ? "Uploading…" : "Upload"}
              </Button>
            </div>
            {editing.image_url_mobile ? (
              <img
                src={editing.image_url_mobile}
                alt=""
                className="mt-2 max-h-32 rounded border border-ui-border-base object-contain bg-ui-bg-subtle"
              />
            ) : null}
          </div>

          <div className="flex gap-4">
            <div className="w-32">
              <Label size="small" weight="plus">Position</Label>
              <Input
                type="number"
                value={editing.position ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, position: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Switch
                checked={editing.is_active !== false}
                onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
              />
              <Label size="small">Active</Label>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Banners</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Home-page hero slider. Storefront shows the first {MAX_VISIBLE} active banners
            ordered by position. Currently visible: {visibleCount}/{MAX_VISIBLE}.
          </Text>
        </div>
        <Button size="small" onClick={() => setEditing({ ...emptyDraft })}>
          + New banner
        </Button>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">Loading…</Text>
        ) : banners.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No banners yet. Click "New banner" to upload one.
          </Text>
        ) : (
          <div className="space-y-2">
            {banners.map((b, idx) => {
              const overflow = b.is_active && idx >= MAX_VISIBLE
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 border border-ui-border-base rounded-md p-3"
                >
                  <img
                    src={b.image_url}
                    alt=""
                    className="w-24 h-16 object-cover rounded bg-ui-bg-subtle flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ui-fg-base truncate">
                      {b.title}
                    </div>
                    <div className="text-xs text-ui-fg-subtle mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>pos {b.position}</span>
                      <span>·</span>
                      <span>{b.is_active ? "Active" : "Draft"}</span>
                      {overflow ? (
                        <>
                          <span>·</span>
                          <span className="text-ui-fg-error">
                            beyond {MAX_VISIBLE} — not shown on storefront
                          </span>
                        </>
                      ) : null}
                      {b.link ? (
                        <>
                          <span>·</span>
                          <span className="truncate">→ {b.link}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="small" variant="secondary" onClick={() => setEditing(b)}>
                      Edit
                    </Button>
                    <Button size="small" variant="danger" onClick={() => remove(b.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Banners",
  icon: Photo,
})
