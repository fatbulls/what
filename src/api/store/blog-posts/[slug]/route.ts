import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const blog: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const slug = req.params.slug
  const [posts] = await blog.listAndCountBlogPosts(
    { slug, is_published: true },
    { take: 1 }
  )
  const post = posts?.[0]
  if (!post) {
    res.status(404).json({ message: "Blog post not found" })
    return
  }
  // Fire-and-forget view increment
  blog
    .updateBlogPosts([{ id: post.id, views: (post.views ?? 0) + 1 }])
    .catch(() => {})
  res.json({ post })
}
