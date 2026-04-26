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
  { key: "consent_default_region", value: "", label: "Default consent region", description: "ISO-3166 code where analytics defaults to 'granted'. Leave empty to default-deny everywhere; set to your primary market code (e.g. US, MY, SG) to opt users in there. EEA + UK + CH are always default-deny regardless.", group: "consent", is_public: true },

  // --- Site identity ---
  { key: "site_name", value: "Storefront", label: "Site name", description: "Used in page titles, OG tags, and structured data", group: "identity", is_public: true },
  { key: "site_tagline", value: "Curated products with reliable delivery.", label: "Tagline", description: "Short one-line site description. Used as the default meta description and OG subtitle.", group: "identity", is_public: true },
  { key: "site_logo_url", value: "", label: "Logo URL", description: "Public URL of the storefront header logo. Recommended: SVG or PNG with transparent background, ~3:1 aspect ratio (e.g. 288×96), max 100 KB. Use the Upload button to push to S3/local storage and paste the returned URL.", group: "identity", is_public: true },
  { key: "site_logo_width", value: "144", label: "Logo width (px)", description: "Rendered width in the header. Default 144. Adjust to keep the header height stable.", group: "identity", is_public: true },
  { key: "site_logo_height", value: "40", label: "Logo height (px)", description: "Rendered height in the header. Default 40.", group: "identity", is_public: true },
  { key: "contact_email", value: "", label: "Contact email", description: "", group: "identity", is_public: true },
  { key: "contact_phone", value: "", label: "Contact phone", description: "", group: "identity", is_public: true },
  { key: "contact_address", value: "", label: "Contact address", description: "Single-line postal address — used as the LocalBusiness JSON-LD address fallback when business_address_* keys are empty.", group: "identity", is_public: true },

  // --- SEO / business positioning ---
  // These drive LocalBusiness JSON-LD, OG locale, and the dynamic OG image
  // template. Leave any blank to fall back to a neutral default.
  { key: "business_type", value: "LocalBusiness", label: "Business Schema.org type", description: "JSON-LD @type. Pick the most specific subtype that matches: LocalBusiness, Store, Restaurant, Florist, ClothingStore, ElectronicsStore, FurnitureStore, BookStore, GroceryStore, JewelryStore, HealthAndBeautyBusiness, HomeAndConstructionBusiness, AutoDealer.", group: "seo", is_public: true },
  { key: "business_country", value: "", label: "Country code", description: "ISO 3166-1 alpha-2 (e.g. US, MY, SG, GB). Used for LocalBusiness addressCountry. Leave empty to omit.", group: "seo", is_public: true },
  { key: "business_locale", value: "en_US", label: "Open Graph locale", description: "Format: lang_REGION (e.g. en_US, en_MY, zh_CN, ms_MY). Emitted as og:locale.", group: "seo", is_public: true },
  { key: "business_html_lang", value: "en", label: "HTML lang attribute", description: "Two-letter or BCP-47 lang code on <html lang=\"...\"> (e.g. en, zh, ms, en-US).", group: "seo", is_public: true },
  { key: "business_price_range", value: "$$", label: "Price range indicator", description: "Free text shown in LocalBusiness priceRange. Examples: $, $$, $$$, USD 50-200, MYR 80-500.", group: "seo", is_public: true },
  { key: "business_area_served", value: "", label: "Areas served", description: "Comma-separated list of cities or regions served (e.g. \"Kuala Lumpur, Petaling Jaya, Selangor\"). Empty to omit from schema.", group: "seo", is_public: true },
  { key: "business_address_street", value: "", label: "Business street address", description: "Optional override for SEO. Falls back to pickup_street, then contact_address.", group: "seo", is_public: true },
  { key: "business_address_city", value: "", label: "Business city", description: "Optional override for SEO. Falls back to pickup_city.", group: "seo", is_public: true },
  { key: "business_address_region", value: "", label: "Business state/region", description: "Optional override for SEO. Falls back to pickup_state.", group: "seo", is_public: true },
  { key: "business_address_postal_code", value: "", label: "Business postal code", description: "Optional override for SEO. Falls back to pickup_zip.", group: "seo", is_public: true },

  // --- OG image ---
  { key: "og_image_url", value: "", label: "OG image URL (override)", description: "Optional absolute URL to a static social-share image (1200×630 recommended). If set, takes precedence over the dynamic /opengraph-image route.", group: "seo", is_public: true },
  { key: "og_brand_color", value: "#000000", label: "OG accent colour", description: "Hex used for accent text on the dynamic OG image (e.g. #ff0066).", group: "seo", is_public: true },
  { key: "og_bg_color_from", value: "#fafafa", label: "OG background gradient (start)", description: "Hex.", group: "seo", is_public: true },
  { key: "og_bg_color_to", value: "#e5e5e5", label: "OG background gradient (end)", description: "Hex.", group: "seo", is_public: true },
  { key: "og_subtitle", value: "", label: "OG image subtitle", description: "Line shown under the brand name on the dynamic OG image. Empty → falls back to site_tagline.", group: "seo", is_public: true },
  { key: "og_footer_text", value: "", label: "OG image footer text", description: "Optional bottom line on the dynamic OG image (e.g. \"Same-day delivery\"). Empty → omitted.", group: "seo", is_public: true },

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

  // --- Footer copyright ---
  // Storefront's <Copyright> renders the template after replacing:
  //   {year}      → current year
  //   {site_name} → site_name
  //   {ssm}       → ssm_number (empty if unset)
  { key: "copyright_text", value: "© {year} {site_name} {ssm}. All rights reserved.", label: "Copyright text", description: 'Tokens: {year}, {site_name}, {ssm}. Example: "© {year} {site_name} (1486630-H). All rights reserved."', group: "footer", is_public: true },
  { key: "copyright_show_payments", value: "1", label: "Show payment icons", description: 'Set to "1" to show the payment-method strip in the footer copyright row.', group: "footer", is_public: true },

  // --- File storage (S3 / S3-compatible) ---
  // is_public: false on every secret so they DON'T leak via /store/site-config.
  // medusa-config.ts reads these synchronously via psql at boot. Changes
  // require a Medusa restart — use the "Restart server" button below the
  // section, or run `pm2 restart medusa-api` on the host.
  { key: "s3_enabled", value: "", label: "Enable S3 file uploads", description: 'Set to "1" to switch the file provider from local disk to S3. Requires Medusa restart.', group: "storage", is_public: false },
  { key: "s3_endpoint", value: "", label: "S3 endpoint URL (optional)", description: "Leave empty for AWS S3. Set for S3-compatible services: Cloudflare R2 (https://<account>.r2.cloudflarestorage.com), MinIO, DigitalOcean Spaces, Backblaze B2, etc.", group: "storage", is_public: false },
  { key: "s3_region", value: "", label: "Region", description: "AWS region code, e.g. us-east-1, ap-southeast-1, auto (for R2).", group: "storage", is_public: false },
  { key: "s3_bucket", value: "", label: "Bucket name", description: "", group: "storage", is_public: false },
  { key: "s3_access_key_id", value: "", label: "Access key ID", description: "AWS Access Key ID or equivalent for the S3-compatible service.", group: "storage", is_public: false },
  { key: "s3_secret_access_key", value: "", label: "Secret access key", description: "Stored as plain text in the database — protect DB access. Treated as write-only in the admin UI.", group: "storage", is_public: false },
  { key: "s3_file_url", value: "", label: "Public URL prefix", description: 'Public URL where uploaded files are served, e.g. "https://cdn.example.com" or "https://<bucket>.s3.<region>.amazonaws.com". Used to build asset URLs the storefront and Stripe receipts link to.', group: "storage", is_public: false },
  { key: "s3_prefix", value: "", label: "Key prefix (optional)", description: 'Folder under the bucket where files are stored, e.g. "uploads/" or "media/". Trailing slash recommended.', group: "storage", is_public: false },
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
          <Button
            variant="secondary"
            size="small"
            onClick={async () => {
              if (!confirm("Restart Medusa now? Active admin sessions stay signed in. ~5s downtime.")) return
              try {
                await fetch("/admin/restart-server", {
                  method: "POST",
                  credentials: "include",
                })
                toast.success("Server restarting — reloading admin in 6s…")
                setTimeout(() => window.location.reload(), 6000)
              } catch (e: any) {
                toast.error("Restart failed: " + (e?.message ?? e))
              }
            }}
            disabled={saving}
          >
            Restart server
          </Button>
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
                        type={
                          /(^|_)secret($|_)/.test(e.key) ||
                          e.key.endsWith("_access_key")
                            ? "password"
                            : undefined
                        }
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
