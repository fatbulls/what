import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONFIG_MODULE } from "../../../modules/site-config"
import SiteConfigModuleService from "../../../modules/site-config/service"

const VALID_KEY = /^[a-z0-9_.-]{1,64}$/i

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
  const { group } = req.query as Record<string, any>
  const filters: Record<string, any> = {}
  if (group) filters.group = String(group)
  const [entries] = await svc.listAndCountSiteConfigs(filters, {
    take: 500,
    order: { group: "ASC", key: "ASC" },
  })
  res.json({ entries })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Upsert: one admin request sets many keys at once.
  const svc: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
  const body = (req.body ?? {}) as Record<string, any>
  const entries = Array.isArray(body.entries) ? body.entries : [body]
  const results: any[] = []

  for (const e of entries) {
    const key = String(e.key || "").trim()
    if (!VALID_KEY.test(key)) {
      res.status(400).json({ message: `invalid key: ${key}` })
      return
    }
    const payload = {
      key,
      value: e.value ?? null,
      label: e.label ?? null,
      description: e.description ?? null,
      group: e.group ?? null,
      is_public: e.is_public !== false,
    }
    const [existing] = await svc.listSiteConfigs({ key })
    if (existing) {
      const updated = await svc.updateSiteConfigs({ id: existing.id, ...payload })
      results.push(updated)
    } else {
      const created = await svc.createSiteConfigs(payload)
      results.push(created)
    }
  }
  res.status(200).json({ entries: results })
}
