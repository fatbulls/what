import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../../modules/page"
import PageModuleService from "../../../../modules/page/service"
import { revalidateStorefront } from "../../../../lib/revalidate-storefront"

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
  const page = Array.isArray(updated) ? updated[0] : updated
  const slug = (page as any)?.slug
  if (slug) {
    revalidateStorefront({ tags: [`page:${slug}`], paths: [`/${slug}`] })
  }
  res.json({ page })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: PageModuleService = req.scope.resolve(PAGE_MODULE)
  const { id } = req.params as { id: string }
  const [existing] = await svc.listPages({ id })
  await svc.deletePages([id])
  if (existing?.slug) {
    revalidateStorefront({
      tags: [`page:${existing.slug}`],
      paths: [`/${existing.slug}`],
    })
  }
  res.status(204).send()
}
