import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../modules/page"
import PageModuleService from "../../../modules/page/service"
import { revalidateStorefront } from "../../../lib/revalidate-storefront"

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: PageModuleService = req.scope.resolve(PAGE_MODULE)
  const [pages] = await svc.listAndCountPages(
    {},
    { take: 200, order: { slug: "ASC" } },
  )
  res.json({ pages })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: PageModuleService = req.scope.resolve(PAGE_MODULE)
  const body = (req.body ?? {}) as Record<string, any>
  const slug = String(body.slug || "").trim()
  if (!SLUG_RE.test(slug)) {
    res.status(400).json({ message: "slug must be lowercase alphanumeric + dashes" })
    return
  }
  if (!body.title) {
    res.status(400).json({ message: "title is required" })
    return
  }
  const [existing] = await svc.listPages({ slug })
  if (existing) {
    res.status(409).json({ message: `page with slug '${slug}' already exists` })
    return
  }
  const [created] = await svc.createPages([
    {
      slug,
      title: String(body.title),
      content: body.content ?? null,
      meta_description: body.meta_description ?? null,
      is_published: body.is_published !== false,
    },
  ])
  revalidateStorefront({ tags: [`page:${slug}`], paths: [`/${slug}`] })
  res.status(201).json({ page: created })
}
