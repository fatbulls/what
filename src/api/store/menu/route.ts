import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MENU_MODULE } from "../../../modules/menu"
import MenuModuleService from "../../../modules/menu/service"

// Public endpoint — storefront reads this to render the header / mobile
// navigation. Returns a pre-assembled tree so callers don't duplicate the
// flatten-to-tree logic.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: MenuModuleService = req.scope.resolve(MENU_MODULE)
  const menuKey = String((req.query as any)?.key ?? "header")

  const [items] = await svc.listAndCountMenuItems(
    { menu_key: menuKey, is_active: true },
    { take: 500, order: { position: "ASC" } },
  )

  type Node = {
    id: string
    label: string
    href: string | null
    children: Node[]
  }
  const byId = new Map<string, Node>()
  const roots: Node[] = []
  for (const it of items) {
    byId.set(it.id, {
      id: it.id,
      label: (it as any).label,
      href: (it as any).href,
      children: [],
    })
  }
  for (const it of items) {
    const node = byId.get(it.id)!
    const parentId = (it as any).parent_id
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // 60s CDN cache — menu changes are rare and the admin can wait a minute.
  res.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  )
  res.json({ menu: roots })
}
