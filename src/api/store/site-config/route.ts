import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONFIG_MODULE } from "../../../modules/site-config"
import SiteConfigModuleService from "../../../modules/site-config/service"

// Public, unauthenticated endpoint: returns a flat { key: value } object of
// `is_public=true` entries so the storefront can read tenant settings
// (GTM id, social links, phone, etc.) without exposing admin-only secrets.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
  const [entries] = await svc.listAndCountSiteConfigs(
    { is_public: true },
    { take: 500, order: { group: "ASC", key: "ASC" } }
  )
  const config: Record<string, string | null> = {}
  for (const e of entries) config[e.key] = e.value
  // 60s CDN cache: fast for the common case where the storefront ISR revalidates.
  res.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300")
  res.json({ config })
}
