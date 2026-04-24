import { model } from "@medusajs/framework/utils"

// Generic CMS-ish static page. The storefront's /privacy, /terms and other
// content pages render the HTML stored here. Fields chosen to be the bare
// minimum needed for a print-quality legal / about page: title for the
// rendered <h1> + SEO, content as HTML (admin types WYSIWYG later if we
// wire one in, but plain textarea works today), meta_description for
// <meta>. is_published gates visibility.
const Page = model.define("page", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  title: model.text(),
  content: model.text().nullable(),
  meta_description: model.text().nullable(),
  is_published: model.boolean().default(true),
})

export default Page
