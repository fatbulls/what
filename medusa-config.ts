import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

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
