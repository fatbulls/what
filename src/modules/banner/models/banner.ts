import { model } from "@medusajs/framework/utils"

// Hero / promotional banner shown on the storefront home page slider.
// Storefront caps the visible count at 6 — admins can store more, the
// rest stay as drafts.
const Banner = model.define("banner", {
  id: model.id().primaryKey(),
  // Where the banner renders. "hero" is the home-page slider; reserve
  // "promo" / "footer" for future variants without a schema change.
  slot: model.text().default("hero"),
  title: model.text(),
  // Public-facing URL the banner links to (e.g. /category/birthday). May
  // be relative or absolute. Empty → banner is decorative.
  link: model.text().nullable(),
  // Desktop image — required.
  image_url: model.text(),
  // Optional mobile-specific image. Storefront falls back to image_url
  // if empty.
  image_url_mobile: model.text().nullable(),
  position: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default Banner
