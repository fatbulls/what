import { model } from "@medusajs/framework/utils"

// A flat table with self-referential parent_id — trees are assembled in the
// API layer. Simpler than a nested-set or MPTT scheme for our scale
// (one header menu, ~50 rows total).
const MenuItem = model.define("menu_item", {
  id: model.id().primaryKey(),
  menu_key: model.text(), // e.g. "header" — lets us later add "footer" / "mobile" variants
  parent_id: model.text().nullable(), // null = top-level
  label: model.text(),
  href: model.text().nullable(),
  position: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default MenuItem
