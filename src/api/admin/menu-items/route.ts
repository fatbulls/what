import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MENU_MODULE } from "../../../modules/menu"
import MenuModuleService from "../../../modules/menu/service"
import { revalidateStorefront } from "../../../lib/revalidate-storefront"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: MenuModuleService = req.scope.resolve(MENU_MODULE)
  const menuKey = (req.query as any)?.menu_key ?? "header"
  const [items] = await svc.listAndCountMenuItems(
    { menu_key: menuKey },
    { take: 500, order: { parent_id: "ASC", position: "ASC" } },
  )
  res.json({ items })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: MenuModuleService = req.scope.resolve(MENU_MODULE)
  const body = (req.body ?? {}) as Record<string, any>
  const payload = {
    menu_key: String(body.menu_key || "header"),
    parent_id: body.parent_id ?? null,
    label: String(body.label || "").trim(),
    href: body.href ?? null,
    position: Number(body.position ?? 0),
    is_active: body.is_active !== false,
  }
  if (!payload.label) {
    res.status(400).json({ message: "label is required" })
    return
  }
  const [created] = await svc.createMenuItems([payload])
  revalidateStorefront({ tags: [`menu:${payload.menu_key}`] })
  res.status(201).json({ item: created })
}
