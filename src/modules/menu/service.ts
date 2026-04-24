import { MedusaService } from "@medusajs/framework/utils"
import MenuItem from "./models/menu-item"

class MenuModuleService extends MedusaService({
  MenuItem,
}) {}

export default MenuModuleService
