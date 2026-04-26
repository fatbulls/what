import { defineRouteConfig } from "@medusajs/admin-sdk"
import { InformationCircle } from "@medusajs/icons"
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

type FaqItem = {
  id: string
  slot: string
  position: number
  question: string
  answer: string
  is_active: boolean
}

// Tabs match the three storefront FAQ pages.
const SLOTS: { key: string; label: string; description: string }[] = [
  { key: "main", label: "General FAQ", description: "Renders on /faq" },
  { key: "shipping", label: "Shipping & Delivery", description: "Renders on /faq-shipping-delivery" },
  { key: "returns", label: "Returns & Exchanges", description: "Renders on /faq-return-exchanges" },
]

const emptyDraft = (slot: string): Partial<FaqItem> => ({
  slot,
  position: 0,
  question: "",
  answer: "",
  is_active: true,
})

export default function FaqsPage() {
  const [activeSlot, setActiveSlot] = useState(SLOTS[0].key)
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<FaqItem> | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch(`/admin/faqs?slot=${activeSlot}`, {
        credentials: "include",
      })
      const data = await res.json()
      setItems(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [activeSlot])

  async function save() {
    if (!editing) return
    if (!editing.question?.trim()) {
      toast.error("Question is required")
      return
    }
    setSaving(true)
    try {
      const isNew = !editing.id
      const url = isNew ? "/admin/faqs" : `/admin/faqs/${editing.id}`
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
      toast.success(isNew ? "FAQ added" : "FAQ updated")
      setEditing(null)
      await reload()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this FAQ entry?")) return
    const res = await fetch(`/admin/faqs/${id}`, {
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

  if (editing) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>{editing.id ? "Edit FAQ" : "New FAQ"}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Slot: {editing.slot}
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
            <Label size="small" weight="plus">Question</Label>
            <Input
              value={editing.question ?? ""}
              onChange={(e) => setEditing({ ...editing, question: e.target.value })}
              placeholder="How long does delivery take?"
            />
          </div>
          <div>
            <Label size="small" weight="plus">Answer</Label>
            <RichTextEditor
              value={editing.answer ?? ""}
              onChange={(html) => setEditing({ ...editing, answer: html })}
              placeholder="Write the full answer — paragraphs, lists, links…"
              minRows={10}
            />
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

  const activeMeta = SLOTS.find((s) => s.key === activeSlot)!

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>FAQ</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {activeMeta.description}
          </Text>
        </div>
        <Button size="small" onClick={() => setEditing(emptyDraft(activeSlot))}>
          + New entry
        </Button>
      </div>

      <div className="px-6 py-3 flex gap-2">
        {SLOTS.map((s) => (
          <Button
            key={s.key}
            variant={s.key === activeSlot ? "primary" : "secondary"}
            size="small"
            onClick={() => setActiveSlot(s.key)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">Loading…</Text>
        ) : items.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No FAQs yet in this slot. Click "New entry" to add one.
          </Text>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 border border-ui-border-base rounded-md p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ui-fg-base truncate">
                    {it.question}
                  </div>
                  <div className="text-xs text-ui-fg-subtle mt-0.5 flex gap-2 flex-wrap">
                    <span>pos {it.position}</span>
                    <span>·</span>
                    <span>{it.is_active ? "Active" : "Draft"}</span>
                    <span>·</span>
                    <span>{it.answer ? `${it.answer.length} chars` : "no answer"}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="small" variant="secondary" onClick={() => setEditing(it)}>
                    Edit
                  </Button>
                  <Button size="small" variant="danger" onClick={() => remove(it.id)}>
                    Delete
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
  label: "FAQ",
  icon: InformationCircle,
})
