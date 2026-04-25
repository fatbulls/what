import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../modules/page"
import PageModuleService from "../../../modules/page/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: PageModuleService = req.scope.resolve(PAGE_MODULE)
  const { limit = 200, offset = 0 } = req.query as Record<string, any>
  const [pages, count] = await svc.listAndCountPages(
    { is_published: true },
    {
      take: Number(limit),
      skip: Number(offset),
      order: { slug: "ASC" },
    },
  )
  res.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  )
  res.json({ pages, count, limit: Number(limit), offset: Number(offset) })
}
