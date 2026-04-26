import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../modules/faq"
import FaqModuleService from "../../../modules/faq/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const slot = (req.query as any)?.slot ?? "main"
  const [items] = await svc.listAndCountFaqItems(
    { slot: String(slot), is_active: true },
    { take: 200, order: { position: "ASC" } },
  )
  res.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  )
  res.json({ items })
}
