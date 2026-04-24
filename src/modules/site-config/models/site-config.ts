import { model } from "@medusajs/framework/utils"

// Key/value store for tenant-editable runtime settings that the storefront
// reads on every ISR cycle. Each row is one setting — e.g. `gtm_container_id`,
// `ga4_measurement_id`, `contact_phone`. `is_public=true` rows are exposed via
// the /store/* API; private rows (secrets, internal flags) are admin-only.
const SiteConfig = model.define("site_config", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  value: model.text().nullable(),
  label: model.text().nullable(),
  description: model.text().nullable(),
  group: model.text().nullable(),
  is_public: model.boolean().default(true),
})

export default SiteConfig
