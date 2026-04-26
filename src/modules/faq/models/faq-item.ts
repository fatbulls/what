import { model } from "@medusajs/framework/utils"

// FAQ entry rendered inside the storefront accordion. Slot lets us
// have multiple FAQ pages off the same module (main / shipping /
// returns / future). HTML answer (Tiptap output) so admins can format
// links, lists, emphasis etc.
const FaqItem = model.define("faq_item", {
  id: model.id().primaryKey(),
  slot: model.text().default("main"),
  position: model.number().default(0),
  question: model.text(),
  answer: model.text(),
  is_active: model.boolean().default(true),
})

export default FaqItem
