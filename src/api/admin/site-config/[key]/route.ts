import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONFIG_MODULE } from "../../../../modules/site-config"
import SiteConfigModuleService from "../../../../modules/site-config/service"
import { revalidateStorefront } from "../../../../lib/revalidate-storefront"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
  const { key } = req.params as { key: string }
  const [entry] = await svc.listSiteConfigs({ key })
  if (!entry) {
    res.status(404).json({ message: "not found" })
    return
  }
  res.json({ entry })
}

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
  const { key } = req.params as { key: string }
  const body = (req.body ?? {}) as Record<string, any>
  const [existing] = await svc.listSiteConfigs({ key })
  if (!existing) {
    res.status(404).json({ message: "not found" })
    return
  }
  const updated = await svc.updateSiteConfigs({
    id: existing.id,
    value: body.value ?? null,
    label: body.label ?? existing.label,
    description: body.description ?? existing.description,
    group: body.group ?? existing.group,
    is_public: typeof body.is_public === "boolean" ? body.is_public : existing.is_public,
  })
  revalidateStorefront({ tags: ["site-config"] })
  res.json({ entry: updated })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: SiteConfigModuleService = req.scope.resolve(SITE_CONFIG_MODULE)
  const { key } = req.params as { key: string }
  const [existing] = await svc.listSiteConfigs({ key })
  if (!existing) {
    res.status(404).json({ message: "not found" })
    return
  }
  await svc.deleteSiteConfigs(existing.id)
  revalidateStorefront({ tags: ["site-config"] })
  res.status(204).send()
}
