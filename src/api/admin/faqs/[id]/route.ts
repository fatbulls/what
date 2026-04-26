import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../../modules/faq"
import FaqModuleService from "../../../../modules/faq/service"
import { revalidateStorefront } from "../../../../lib/revalidate-storefront"

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const { id } = req.params as { id: string }
  const body = (req.body ?? {}) as Record<string, any>
  const patch: Record<string, any> = { id }
  for (const k of ["slot", "question", "answer"] as const) {
    if (body[k] !== undefined) patch[k] = body[k]
  }
  if (body.position !== undefined) patch.position = Number(body.position)
  if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active)
  const updated = await svc.updateFaqItems(patch)
  const item = Array.isArray(updated) ? updated[0] : updated
  revalidateStorefront({ tags: [`faq:${(item as any)?.slot ?? "main"}`] })
  res.json({ item })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const { id } = req.params as { id: string }
  const [existing] = await svc.listFaqItems({ id })
  await svc.deleteFaqItems(id)
  revalidateStorefront({
    tags: [`faq:${(existing as any)?.slot ?? "main"}`],
  })
  res.status(204).send()
}
