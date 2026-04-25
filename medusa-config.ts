import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'
import { execFileSync } from 'node:child_process'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// --- File storage provider ---
//
// Read S3 credentials from the `site_config` table synchronously at boot.
// The admin UI writes these rows; medusa-config.ts is CommonJS and can't
// `await` a Postgres client, so we shell out to `psql` (always installed
// alongside the Postgres server on this VPS). If the query fails (DB
// down on first boot, missing table, etc.), fall back to local file
// storage instead of crashing.
function loadStorageConfigFromDb(): Record<string, string> {
  const url = process.env.DATABASE_URL
  if (!url) return {}
  try {
    // No LIKE escape needed: we don't have any key like "s3X_…" in this
    // keyspace, so 's3_%' (where `_` is a single-character wildcard)
    // matches every key we care about (s3_enabled, s3_bucket, …).
    const out = execFileSync(
      "psql",
      [
        url,
        "-tAF§",
        "-c",
        "SELECT key, COALESCE(value, '') FROM site_config WHERE key LIKE 's3_%'",
      ],
      { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", timeout: 5000 },
    )
    const out_obj: Record<string, string> = {}
    for (const line of out.split("\n")) {
      if (!line) continue
      const idx = line.indexOf("§")
      if (idx < 0) continue
      out_obj[line.slice(0, idx)] = line.slice(idx + 1)
    }
    return out_obj
  } catch (e) {
    // First boot: site_config table may not exist yet. Quietly skip —
    // local file storage covers the common case until S3 is set up.
    return {}
  }
}

const storageCfg = loadStorageConfigFromDb()
const s3Enabled = storageCfg.s3_enabled === "1" || storageCfg.s3_enabled === "true"
console.log(
  `[medusa-config] file storage: ${
    s3Enabled
      ? `S3 (bucket=${storageCfg.s3_bucket || "?"}, region=${storageCfg.s3_region || "?"})`
      : "local"
  }`,
)

const fileProviders: any[] = []
if (
  s3Enabled &&
  storageCfg.s3_bucket &&
  storageCfg.s3_access_key_id &&
  storageCfg.s3_secret_access_key
) {
  fileProviders.push({
    resolve: "@medusajs/file-s3",
    id: "s3",
    options: {
      file_url: storageCfg.s3_file_url || undefined,
      access_key_id: storageCfg.s3_access_key_id,
      secret_access_key: storageCfg.s3_secret_access_key,
      region: storageCfg.s3_region || "us-east-1",
      bucket: storageCfg.s3_bucket,
      endpoint: storageCfg.s3_endpoint || undefined,
      prefix: storageCfg.s3_prefix || undefined,
      // AWS SDK v3 forwards arbitrary keys to s3Client.config; this
      // turns on virtual-host-style URLs for AWS S3 and falls back to
      // path-style for endpoint-targeted services (R2/MinIO).
      additional_client_config: storageCfg.s3_endpoint
        ? { forcePathStyle: true }
        : undefined,
    },
  })
} else {
  fileProviders.push({
    resolve: "@medusajs/file-local",
    id: "local",
    options: {
      upload_dir: "static",
      // Public URL where Medusa serves the static dir. Same host as the
      // backend — admin UI only needs to render thumbnails over the
      // admin host.
      backend_url: `${process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"}/static`,
    },
  })
}

const paymentProviders: any[] = []
if (process.env.STRIPE_API_KEY) {
  paymentProviders.push({
    resolve: "@medusajs/payment-stripe",
    id: "stripe",
    options: {
      apiKey: process.env.STRIPE_API_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      capture: true,
      automatic_payment_methods: true,
    },
  })
}

const modules: any[] = [
  // Custom blog module (./src/modules/blog)
  { resolve: "./src/modules/blog" },
  // Admin-editable runtime settings (GTM id, GA4 id, pixel ids, contact,
  // feature flags). Storefront reads public keys via /store/site-config.
  { resolve: "./src/modules/site-config" },
  // Header + mobile navigation menu — admin-editable tree.
  { resolve: "./src/modules/menu" },
  // Slug-addressable static pages (privacy, terms, etc.).
  { resolve: "./src/modules/page" },
  // Home-page hero banners — admin-uploaded image + link.
  { resolve: "./src/modules/banner" },
  // File storage. Provider chosen at boot from site_config.s3_enabled —
  // see loadStorageConfigFromDb above. Admin can switch via the
  // Site Settings → Storage section + the "Restart server" button.
  {
    key: Modules.FILE,
    resolve: "@medusajs/file",
    options: { providers: fileProviders },
  },
]

// Redis-backed infrastructure replaces the in-memory/local defaults so
// cache, events, locks and workflow queues survive restarts and scale
// horizontally. Enable only when REDIS_URL is set (dev machines without
// Redis fall back to the in-memory versions Medusa ships out of the box).
if (process.env.REDIS_URL) {
  modules.push(
    {
      key: Modules.CACHE,
      resolve: "@medusajs/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      key: Modules.EVENT_BUS,
      resolve: "@medusajs/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: "@medusajs/workflow-engine-redis",
      // `redis.url` despite deprecation warning — the top-level `redisUrl`
      // shape breaks v2 (TypeError on Workflows module load).
      options: { redis: { url: process.env.REDIS_URL } },
    },
    {
      key: Modules.LOCKING,
      resolve: "@medusajs/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/locking-redis",
            id: "redis",
            is_default: true,
            options: { redisUrl: process.env.REDIS_URL },
          },
        ],
      },
    },
  )
}
if (paymentProviders.length > 0) {
  modules.push({
    resolve: "@medusajs/payment",
    options: {
      providers: paymentProviders,
    },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    vite: () => ({
      server: {
        allowedHosts: [
          "admin.what.com.my",
          "what.com.my",
          "194.233.77.181",
          "localhost",
        ],
      },
    }),
  },
  modules,
})
