import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Bars3 } from "@medusajs/icons"
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
import { useEffect, useMemo, useState } from "react"

type MenuItem = {
  id: string
  menu_key: string
  parent_id: string | null
  label: string
  href: string | null
  position: number
  is_active: boolean
}

const MENU_KEY = "header"

export default function MenusPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState<Record<string, Partial<MenuItem>>>({})
  const [saving, setSaving] = useState(false)
  const [newTop, setNewTop] = useState({ label: "", href: "" })
  const [newChild, setNewChild] = useState<Record<string, { label: string; href: string }>>({})

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch(`/admin/menu-items?menu_key=${MENU_KEY}`, {
        credentials: "include",
      })
      const data = await res.json()
      setItems(data.items ?? [])
      setDirty({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const { roots, childrenOf } = useMemo(() => {
    const byParent: Record<string, MenuItem[]> = {}
    const top: MenuItem[] = []
    for (const it of items) {
      if (!it.parent_id) top.push(it)
      else (byParent[it.parent_id] ??= []).push(it)
    }
    const sort = (a: MenuItem, b: MenuItem) => a.position - b.position
    top.sort(sort)
    for (const k of Object.keys(byParent)) byParent[k].sort(sort)
    return { roots: top, childrenOf: byParent }
  }, [items])

  function markDirty(id: string, patch: Partial<MenuItem>) {
    setDirty((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }

  async function saveOne(it: MenuItem) {
    const patch = dirty[it.id]
    if (!patch) return
    const res = await fetch(`/admin/menu-items/${it.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error("Save failed")
  }

  async function saveAll() {
    setSaving(true)
    try {
      for (const id of Object.keys(dirty)) {
        const it = items.find((x) => x.id === id)
        if (it) await saveOne(it)
      }
      toast.success("Saved menu changes")
      await reload()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function create(parent_id: string | null, label: string, href: string) {
    if (!label.trim()) {
      toast.error("Label required")
      return
    }
    const siblings = parent_id ? childrenOf[parent_id] ?? [] : roots
    const position = siblings.length
    const res = await fetch("/admin/menu-items", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu_key: MENU_KEY,
        parent_id,
        label: label.trim(),
        href: href.trim() || null,
        position,
        is_active: true,
      }),
    })
    if (!res.ok) {
      toast.error("Create failed")
      return
    }
    toast.success("Added")
    await reload()
  }

  async function remove(id: string) {
    if (!confirm("Delete this menu item (and any sub-items)?")) return
    const res = await fetch(`/admin/menu-items/${id}`, {
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

  const dirtyCount = Object.keys(dirty).length

  const renderRow = (it: MenuItem, isChild = false) => {
    const patch = dirty[it.id] || {}
    const label = patch.label ?? it.label
    const href = patch.href ?? it.href ?? ""
    const position = patch.position ?? it.position
    const isActive = patch.is_active ?? it.is_active
    return (
      <div
        key={it.id}
        className={`grid gap-2 items-center ${
          isChild ? "ml-6" : ""
        } grid-cols-[60px_1fr_1fr_60px_48px_56px]`}
      >
        <Input
          type="number"
          value={position}
          onChange={(e) => markDirty(it.id, { position: Number(e.target.value) })}
        />
        <Input
          value={label}
          onChange={(e) => markDirty(it.id, { label: e.target.value })}
          placeholder="Label"
        />
        <Input
          value={href}
          onChange={(e) => markDirty(it.id, { href: e.target.value })}
          placeholder="/search?category=… (optional for group headers)"
        />
        <code className="text-ui-fg-subtle text-xs truncate">{it.id.slice(-6)}</code>
        <Switch
          checked={isActive}
          onCheckedChange={(v) => markDirty(it.id, { is_active: v })}
        />
        <Button
          variant="danger"
          size="small"
          onClick={() => remove(it.id)}
        >
          Del
        </Button>
      </div>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Navigation Menu</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Header + mobile menu tree. Changes propagate to the storefront
            within ~60s (CDN cache).
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="small" onClick={reload} disabled={loading || saving}>
            Reload
          </Button>
          <Button size="small" onClick={saveAll} disabled={saving || dirtyCount === 0}>
            {saving ? "Saving…" : `Save ${dirtyCount > 0 ? `(${dirtyCount})` : ""}`}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">Loading…</Text>
        </div>
      ) : (
        <>
          <div className="px-6 py-3 grid gap-2 grid-cols-[60px_1fr_1fr_60px_48px_56px] text-xs text-ui-fg-subtle">
            <span>Pos</span>
            <span>Label</span>
            <span>Link (href)</span>
            <span>ID</span>
            <span>On</span>
            <span></span>
          </div>

          <div className="px-6 py-2 space-y-4">
            {roots.map((top) => (
              <div key={top.id} className="space-y-1 py-2 border-b border-ui-border-base last:border-0">
                {renderRow(top)}
                <div className="space-y-1 mt-1">
                  {(childrenOf[top.id] ?? []).map((child) => renderRow(child, true))}
                </div>
                <div className="ml-6 mt-2 flex gap-2 items-center">
                  <Input
                    placeholder="New sub-item label"
                    value={newChild[top.id]?.label ?? ""}
                    onChange={(e) =>
                      setNewChild((prev) => ({
                        ...prev,
                        [top.id]: { ...(prev[top.id] ?? { href: "" }), label: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="href"
                    value={newChild[top.id]?.href ?? ""}
                    onChange={(e) =>
                      setNewChild((prev) => ({
                        ...prev,
                        [top.id]: { ...(prev[top.id] ?? { label: "" }), href: e.target.value },
                      }))
                    }
                  />
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={async () => {
                      const row = newChild[top.id] ?? { label: "", href: "" }
                      await create(top.id, row.label, row.href)
                      setNewChild((prev) => ({ ...prev, [top.id]: { label: "", href: "" } }))
                    }}
                  >
                    + Sub
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4">
            <Label size="small" weight="plus" className="mb-2 block">Add top-level item</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Label"
                value={newTop.label}
                onChange={(e) => setNewTop({ ...newTop, label: e.target.value })}
              />
              <Input
                placeholder="href (e.g. /blog)"
                value={newTop.href}
                onChange={(e) => setNewTop({ ...newTop, href: e.target.value })}
              />
              <Button
                size="small"
                onClick={async () => {
                  await create(null, newTop.label, newTop.href)
                  setNewTop({ label: "", href: "" })
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Menus",
  icon: Bars3,
})
