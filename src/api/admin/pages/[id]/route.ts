import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../../modules/page"
import PageModuleService from "../../../../modules/page/service"

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: PageModuleService = req.scope.resolve(PAGE_MODULE)
  const { id } = req.params as { id: string }
  const body = (req.body ?? {}) as Record<string, any>
  const patch: Record<string, any> = { id }
  for (const k of ["slug", "title", "content", "meta_description"] as const) {
    if (body[k] !== undefined) patch[k] = body[k]
  }
  if (body.is_published !== undefined)
    patch.is_published = Boolean(body.is_published)
  const updated = await svc.updatePages(patch)
  res.json({ page: Array.isArray(updated) ? updated[0] : updated })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: PageModuleService = req.scope.resolve(PAGE_MODULE)
  const { id } = req.params as { id: string }
  await svc.deletePages([id])
  res.status(204).send()
}
