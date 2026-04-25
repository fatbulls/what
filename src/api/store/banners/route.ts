import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../modules/banner"
import BannerModuleService from "../../../modules/banner/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: BannerModuleService = req.scope.resolve(BANNER_MODULE)
  const slot = (req.query as any)?.slot ?? "hero"
  const limit = Math.min(Number((req.query as any)?.limit ?? 6), 6)
  const [items] = await svc.listAndCountBanners(
    { slot: String(slot), is_active: true },
    { take: limit, order: { position: "ASC" } },
  )
  res.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  )
  res.json({ banners: items })
}
