import { MedusaService } from "@medusajs/framework/utils"
import SiteConfig from "./models/site-config"

class SiteConfigModuleService extends MedusaService({
  SiteConfig,
}) {}

export default SiteConfigModuleService
