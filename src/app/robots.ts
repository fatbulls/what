import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://194.233.77.181:3003";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/checkout",
          "/*/my-account",
          "/*/my-account/*",
          "/*/signin",
          "/*/signup",
          "/*/forget-password",
          "/*/otp-login",
          "/*/logout",
          "/*/orders/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
