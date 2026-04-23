import { model } from "@medusajs/framework/utils"

const BlogPost = model.define("blog_post", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  title: model.text(),
  excerpt: model.text().nullable(),
  content: model.text().nullable(), // Markdown / rich text
  thumbnail: model.text().nullable(),
  author_name: model.text().nullable(),
  tags: model.array().nullable(), // e.g. ["flowers", "tips"]
  is_published: model.boolean().default(false),
  published_at: model.dateTime().nullable(),
  views: model.number().default(0),
})

export default BlogPost
