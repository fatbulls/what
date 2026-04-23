import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const blog: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const id = req.params.id
  try {
    const post = await blog.retrieveBlogPost(id)
    res.json({ post })
  } catch (e: any) {
    res.status(404).json({ message: e?.message || "not found" })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const blog: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const id = req.params.id
  const body = (req.body ?? {}) as Record<string, any>
  const payload: Record<string, any> = { id }
  if (body.slug !== undefined) payload.slug = body.slug
  if (body.title !== undefined) payload.title = body.title
  if (body.excerpt !== undefined) payload.excerpt = body.excerpt
  if (body.content !== undefined) payload.content = body.content
  if (body.thumbnail !== undefined) payload.thumbnail = body.thumbnail
  if (body.author_name !== undefined) payload.author_name = body.author_name
  if (body.tags !== undefined) payload.tags = body.tags
  if (body.is_published !== undefined) {
    payload.is_published = Boolean(body.is_published)
    if (payload.is_published) {
      payload.published_at = body.published_at ? new Date(body.published_at) : new Date()
    } else {
      payload.published_at = null
    }
  } else if (body.published_at !== undefined) {
    payload.published_at = body.published_at ? new Date(body.published_at) : null
  }

  const post = await blog.updateBlogPosts([payload])
  res.json({ post: Array.isArray(post) ? post[0] : post })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const blog: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const id = req.params.id
  await blog.deleteBlogPosts([id])
  res.status(200).json({ id, deleted: true })
}
