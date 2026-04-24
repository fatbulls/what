import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../../modules/page"
import PageModuleService from "../../../../modules/page/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: PageModuleService = req.scope.resolve(PAGE_MODULE)
  const { slug } = req.params as { slug: string }
  const [page] = await svc.listPages({ slug, is_published: true })
  if (!page) {
    res.status(404).json({ message: "not found" })
    return
  }
  res.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  )
  res.json({ page })
}
