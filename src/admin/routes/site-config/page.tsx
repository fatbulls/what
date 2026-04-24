import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CogSixTooth } from "@medusajs/icons"
import {
  Container,
  Heading,
  Button,
  Input,
  Textarea,
  Label,
  Text,
  Badge,
  Switch,
  toast,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type Entry = {
  id: string
  key: string
  value: string | null
  label: string | null
  description: string | null
  group: string | null
  is_public: boolean
}

// Defaults the admin UI will offer "Add" buttons for if they're missing from
// the DB. Editing their value saves back; toggling `is_public` changes
// whether the storefront /store/site-config endpoint exposes the key.
const DEFAULT_ENTRIES: Array<Omit<Entry, "id">> = [
  // --- Analytics ---
  { key: "gtm_container_id", value: "", label: "Google Tag Manager container ID", description: "Format: GTM-XXXXXXX — leave empty to disable GTM injection", group: "analytics", is_public: true },
  { key: "ga4_measurement_id", value: "", label: "GA4 measurement ID", description: "Format: G-XXXXXXX — only set if you want a direct gtag beacon outside GTM (optional)", group: "analytics", is_public: true },
  { key: "facebook_pixel_id", value: "", label: "Facebook Pixel ID", description: "Numeric pixel ID", group: "analytics", is_public: true },
  { key: "tiktok_pixel_id", value: "", label: "TikTok Pixel ID", description: "", group: "analytics", is_public: true },
  { key: "hotjar_site_id", value: "", label: "Hotjar Site ID", description: "", group: "analytics", is_public: true },

  // --- Consent ---
  { key: "consent_default_region", value: "MY", label: "Default consent region", description: "ISO-3166 code where analytics defaults to 'granted'. Set to an EEA code to make the banner opt-in everywhere.", group: "consent", is_public: true },

  // --- Site identity ---
  { key: "site_name", value: "What Shop", label: "Site name", description: "Used in page titles and metadata", group: "identity", is_public: true },
  { key: "site_tagline", value: "Flower Delivery, Hand Bouquets & Curated Gifts with Same-Day Delivery", label: "Tagline", description: "", group: "identity", is_public: true },
  { key: "contact_email", value: "", label: "Contact email", description: "", group: "identity", is_public: true },
  { key: "contact_phone", value: "", label: "Contact phone", description: "", group: "identity", is_public: true },
  { key: "contact_address", value: "", label: "Contact address", description: "", group: "identity", is_public: true },

  // --- Social ---
  { key: "social_facebook", value: "", label: "Facebook URL", description: "", group: "social", is_public: true },
  { key: "social_instagram", value: "", label: "Instagram URL", description: "", group: "social", is_public: true },
  { key: "social_tiktok", value: "", label: "TikTok URL", description: "", group: "social", is_public: true },
  { key: "social_whatsapp", value: "", label: "WhatsApp link", description: "", group: "social", is_public: true },

  // --- Checkout (self-pickup) ---
  { key: "pickup_enabled", value: "", label: "Enable self-pickup option", description: 'Set to "1" to show a self-pickup radio in checkout. Leave empty to hide.', group: "checkout", is_public: true },
  { key: "pickup_title", value: "", label: "Pickup label", description: 'Shown on the self-pickup radio card (e.g. "Self Pickup — KL Store")', group: "checkout", is_public: true },
  { key: "pickup_phone", value: "", label: "Pickup contact phone", description: "Phone number on the pickup card", group: "checkout", is_public: true },
  { key: "pickup_street", value: "", label: "Pickup street address", description: "", group: "checkout", is_public: true },
  { key: "pickup_city", value: "", label: "Pickup city", description: "", group: "checkout", is_public: true },
  { key: "pickup_state", value: "", label: "Pickup state", description: "", group: "checkout", is_public: true },
  { key: "pickup_zip", value: "", label: "Pickup postcode", description: "", group: "checkout", is_public: true },

  // --- Checkout (trust) ---
  { key: "ssm_number", value: "", label: "SSM registration number", description: 'Shown in the checkout trust footer (e.g. "1234567-X")', group: "checkout", is_public: true },
  { key: "checkout_delivery_pill", value: "Same-day delivery by 6 PM", label: "Delivery promise pill", description: "Short copy shown near Place Order", group: "checkout", is_public: true },
]

export default function SiteConfigPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState<Record<string, Partial<Entry>>>({})
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch("/admin/site-config", { credentials: "include" })
      const data = await res.json()
      setEntries(data.entries ?? [])
      setDirty({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const existingKeys = useMemo(() => new Set(entries.map((e) => e.key)), [entries])
  const missingDefaults = useMemo(
    () => DEFAULT_ENTRIES.filter((d) => !existingKeys.has(d.key)),
    [existingKeys]
  )

  const grouped = useMemo(() => {
    const all: Array<Entry | (Omit<Entry, "id"> & { __missing: true })> = [
      ...entries,
      ...missingDefaults.map((d) => ({ ...d, __missing: true as const })),
    ]
    return all.reduce<Record<string, typeof all>>((acc, e) => {
      const g = e.group || "other"
      ;(acc[g] ??= []).push(e)
      return acc
    }, {})
  }, [entries, missingDefaults])

  function markDirty(key: string, patch: Partial<Entry>) {
    setDirty((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }))
  }

  async function saveAll() {
    setSaving(true)
    try {
      const toSend: any[] = []
      // Existing entries that have edits
      for (const e of entries) {
        const patch = dirty[e.key]
        if (!patch) continue
        toSend.push({ ...e, ...patch })
      }
      // Missing defaults that were edited
      for (const d of missingDefaults) {
        const patch = dirty[d.key]
        if (!patch || patch.value === undefined || patch.value === "") continue
        toSend.push({ ...d, ...patch })
      }
      if (toSend.length === 0) {
        toast.info("Nothing to save")
        return
      }
      const res = await fetch("/admin/site-config", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: toSend }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Save failed")
      }
      toast.success(`Saved ${toSend.length} ${toSend.length === 1 ? "entry" : "entries"}`)
      await reload()
    } catch (e: any) {
      toast.error(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const dirtyCount = Object.keys(dirty).length

  return (
    // Match Medusa's native admin page typography: divide-y container, no
    // outer padding, default <Heading> level (h2) for the page title,
    // level h3 for section subheadings. <Text size="small"> for subtitles.
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Site Settings</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Tenant-editable runtime config. Changes propagate to the storefront within the ISR window (~60s).
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
          <Text className="text-ui-fg-subtle" size="small">Loading…</Text>
        </div>
      ) : (
        Object.entries(grouped).map(([group, rows]) => (
          <div key={group} className="px-6 py-4">
            <Heading level="h3" className="capitalize mb-3">
              {group}
            </Heading>
            <div className="flex flex-col gap-3">
              {rows.map((e) => {
                const isMissing = "__missing" in e
                const current = dirty[e.key]?.value ?? e.value ?? ""
                const isPublic = dirty[e.key]?.is_public ?? e.is_public
                return (
                  <div
                    key={e.key}
                    className="border rounded-md p-3 bg-ui-bg-base flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <Label size="small" weight="plus">
                        {e.label || e.key}{" "}
                        <code className="text-ui-fg-subtle text-xs ml-1">{e.key}</code>
                      </Label>
                      <div className="flex items-center gap-2">
                        {isMissing && <Badge size="2xsmall" color="grey">Not set</Badge>}
                        <Label size="xsmall" className="flex items-center gap-2">
                          Public
                          <Switch
                            checked={isPublic}
                            onCheckedChange={(v) => markDirty(e.key, { is_public: v })}
                          />
                        </Label>
                      </div>
                    </div>
                    {e.description && (
                      <Text size="xsmall" className="text-ui-fg-subtle">{e.description}</Text>
                    )}
                    {(e.description && e.description.length > 60) || (typeof current === "string" && current.length > 60) ? (
                      <Textarea
                        value={typeof current === "string" ? current : ""}
                        onChange={(ev) => markDirty(e.key, { value: ev.target.value })}
                        rows={3}
                      />
                    ) : (
                      <Input
                        value={typeof current === "string" ? current : ""}
                        onChange={(ev) => markDirty(e.key, { value: ev.target.value })}
                        placeholder={isMissing ? "(not set)" : undefined}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Site Settings",
  icon: CogSixTooth,
})
