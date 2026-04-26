const path = require("path");

const httpsImageHosts = [
  "demo.b-florist.com",
  "demo.chawkbazar.com",
  "assets.becauseyou.com.my",
  "becauseyou.com.my",
  "uat.becauseyou.com.my",
  "graph.facebook.com",
  "becauseyou-oss.s3.ap-southeast-1.amazonaws.com",
  "s3.ap-southeast-1.amazonaws.com",
  "googleusercontent.com",
  "maps.googleapis.com",
  "chawkbazarapi.redq.io",
  "res.cloudinary.com",
  "s3.amazonaws.com",
  "via.placeholder.com",
  "pickbazarlaravel.s3.ap-southeast-1.amazonaws.com",
  "chawkbazarlaravel.s3.ap-southeast-1.amazonaws.com",
  "picsum.photos",
  "cdninstagram.com",
  "scontent.cdninstagram.com",
  "medusa-public-images.s3.eu-west-1.amazonaws.com",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ChawkBazar's swiper 6 + React 18 StrictMode double-renders trigger
  // `swiper.params.navigation` undefined crashes on mount. Disable it
  // (original ChawkBazar also runs without strict mode).
  reactStrictMode: false,
  transpilePackages: ["rc-util", "rc-picker"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...httpsImageHosts.map((hostname) => ({ protocol: "https", hostname })),
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "194.233.77.181" },
      { protocol: "https", hostname: "localhost" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "next/router": path.resolve(__dirname, "src/shims/next-router.ts"),
      "next-i18next": path.resolve(__dirname, "src/i18n/shim.tsx"),
      "next-auth/client": path.resolve(
        __dirname,
        "src/shims/next-auth-client.ts"
      ),
      // ChawkBazar's framework/rest/*.query.ts files import from
      // "react-query" (v3). The transitive v3 package has its own
      // QueryClientProvider context, separate from the v5 provider we
      // mount in app/providers.tsx — so hooks imported this way throw
      // "No QueryClient set". Alias the bare package name to our
      // v3→v5 compat shim so every hook uses the same v5 client.
      "react-query$": path.resolve(__dirname, "src/shims/rq-compat.ts"),
    };
    return config;
  },
};

// Wrap with Sentry — no-op if NEXT_PUBLIC_SENTRY_DSN is unset (Sentry SDK
// skips init inside baseInit()). The webpack plugin only uploads sourcemaps
// when SENTRY_AUTH_TOKEN is present, so dev/tenants-without-Sentry pay
// zero overhead.
const { withSentryConfig } = require("@sentry/nextjs");
module.exports = withSentryConfig(nextConfig, {
  // Build-time options — safe defaults for a single-tenant self-hosted setup.
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
});
