import { loadEnv, defineConfig } from '@medusajs/framework/utils'

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
]
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
  modules,
})
