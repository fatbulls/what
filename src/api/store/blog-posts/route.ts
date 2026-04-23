import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const blog: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const { q, limit = 20, offset = 0 } = req.query as Record<string, any>

  const filters: Record<string, any> = { is_published: true }
  if (q) filters.title = { $ilike: `%${q}%` }

  const [posts, count] = await blog.listAndCountBlogPosts(filters, {
    take: Number(limit),
    skip: Number(offset),
    order: { published_at: "DESC" },
  })
  res.json({ posts, count, limit: Number(limit), offset: Number(offset) })
}
