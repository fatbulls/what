import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../modules/faq"
import FaqModuleService from "../../../modules/faq/service"
import { revalidateStorefront } from "../../../lib/revalidate-storefront"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const slot = (req.query as any)?.slot ?? "main"
  const [items] = await svc.listAndCountFaqItems(
    { slot: String(slot) },
    { take: 200, order: { position: "ASC" } },
  )
  res.json({ items })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const body = (req.body ?? {}) as Record<string, any>
  const payload = {
    slot: String(body.slot || "main"),
    position: Number(body.position ?? 0),
    question: String(body.question || "").trim(),
    answer: String(body.answer || ""),
    is_active: body.is_active !== false,
  }
  if (!payload.question) {
    res.status(400).json({ message: "question is required" })
    return
  }
  const [created] = await svc.createFaqItems([payload])
  revalidateStorefront({ tags: [`faq:${payload.slot}`] })
  res.status(201).json({ item: created })
}
