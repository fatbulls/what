import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../../modules/banner"
import BannerModuleService from "../../../../modules/banner/service"
import { revalidateStorefront } from "../../../../lib/revalidate-storefront"

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: BannerModuleService = req.scope.resolve(BANNER_MODULE)
  const { id } = req.params as { id: string }
  const body = (req.body ?? {}) as Record<string, any>
  const patch: Record<string, any> = { id }
  for (const k of [
    "slot",
    "title",
    "link",
    "image_url",
    "image_url_mobile",
  ] as const) {
    if (body[k] !== undefined) patch[k] = body[k]
  }
  if (body.position !== undefined) patch.position = Number(body.position)
  if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active)
  const updated = await svc.updateBanners(patch)
  const item = Array.isArray(updated) ? updated[0] : updated
  revalidateStorefront({
    tags: [`banners:${(item as any)?.slot ?? "hero"}`],
  })
  res.json({ item })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: BannerModuleService = req.scope.resolve(BANNER_MODULE)
  const { id } = req.params as { id: string }
  await svc.deleteBanners(id)
  revalidateStorefront({ tags: ["banners:hero"] })
  res.status(204).send()
}
