import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../modules/banner"
import BannerModuleService from "../../../modules/banner/service"
import { revalidateStorefront } from "../../../lib/revalidate-storefront"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: BannerModuleService = req.scope.resolve(BANNER_MODULE)
  const slot = (req.query as any)?.slot ?? "hero"
  const [items] = await svc.listAndCountBanners(
    { slot: String(slot) },
    { take: 100, order: { position: "ASC" } },
  )
  res.json({ items })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: BannerModuleService = req.scope.resolve(BANNER_MODULE)
  const body = (req.body ?? {}) as Record<string, any>
  const payload = {
    slot: String(body.slot || "hero"),
    title: String(body.title || "").trim(),
    link: body.link ?? null,
    image_url: String(body.image_url || "").trim(),
    image_url_mobile: body.image_url_mobile ?? null,
    position: Number(body.position ?? 0),
    is_active: body.is_active !== false,
  }
  if (!payload.title || !payload.image_url) {
    res.status(400).json({ message: "title and image_url are required" })
    return
  }
  const [created] = await svc.createBanners([payload])
  revalidateStorefront({ tags: [`banners:${payload.slot}`] })
  res.status(201).json({ item: created })
}
