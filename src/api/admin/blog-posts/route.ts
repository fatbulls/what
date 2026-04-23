import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const blog: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const { q, limit = 50, offset = 0, order } = req.query as Record<string, any>

  const filters: Record<string, any> = {}
  if (q) filters.title = { $ilike: `%${q}%` }

  const [posts, count] = await blog.listAndCountBlogPosts(filters, {
    take: Number(limit),
    skip: Number(offset),
    order: order ? { [String(order).replace(/^-/, "")]: String(order).startsWith("-") ? "DESC" : "ASC" } : { created_at: "DESC" },
  })
  res.json({ posts, count, limit: Number(limit), offset: Number(offset) })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const blog: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const body = (req.body ?? {}) as Record<string, any>
  const payload: Record<string, any> = {
    slug: String(body.slug || "").trim(),
    title: String(body.title || "").trim(),
    excerpt: body.excerpt ?? null,
    content: body.content ?? null,
    thumbnail: body.thumbnail ?? null,
    author_name: body.author_name ?? null,
    tags: Array.isArray(body.tags) ? body.tags : null,
    is_published: Boolean(body.is_published),
    published_at: body.is_published ? (body.published_at ? new Date(body.published_at) : new Date()) : null,
  }
  if (!payload.slug || !payload.title) {
    res.status(400).json({ message: "slug and title are required" })
    return
  }
  const post = await blog.createBlogPosts(payload)
  res.status(201).json({ post })
}
