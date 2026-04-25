import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Graceful self-restart endpoint. The Medusa process exits with code 0;
// pm2 (which manages this process) auto-restarts on exit by default.
//
// Used by the admin UI's "Restart server" button after editing settings
// that take effect at boot time only — the file storage provider
// (local vs S3), database modules, etc.
//
// The timeout lets Express flush the JSON response before the process
// dies; without it the admin UI would see ECONNRESET instead of a clean
// 200.
export const POST = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.json({ ok: true, message: "Server restarting…" })
  setTimeout(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(0)
  }, 250)
}
