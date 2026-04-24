import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MENU_MODULE } from "../../../../modules/menu"
import MenuModuleService from "../../../../modules/menu/service"

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: MenuModuleService = req.scope.resolve(MENU_MODULE)
  const { id } = req.params as { id: string }
  const body = (req.body ?? {}) as Record<string, any>
  const patch: Record<string, any> = { id }
  if (body.label !== undefined) patch.label = String(body.label)
  if (body.href !== undefined) patch.href = body.href ?? null
  if (body.parent_id !== undefined) patch.parent_id = body.parent_id ?? null
  if (body.position !== undefined) patch.position = Number(body.position)
  if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active)
  if (body.menu_key !== undefined) patch.menu_key = String(body.menu_key)
  const updated = await svc.updateMenuItems(patch)
  res.json({ item: Array.isArray(updated) ? updated[0] : updated })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc: MenuModuleService = req.scope.resolve(MENU_MODULE)
  const { id } = req.params as { id: string }
  // Also delete descendants to keep the tree clean.
  const [all] = await svc.listAndCountMenuItems({}, { take: 1000 })
  const toDelete: string[] = []
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()!
    toDelete.push(cur)
    for (const it of all) if ((it as any).parent_id === cur) stack.push(it.id)
  }
  await svc.deleteMenuItems(toDelete)
  res.status(204).send()
}
