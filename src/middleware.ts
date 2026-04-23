import { NextRequest, NextResponse } from "next/server";

/**
 * Single-region storefront: no URL-based country-code prefix. The previous
 * region-detecting middleware (from Medusa starter) was removed when we
 * dropped `/[countryCode]/`. Region selection happens inside the Medusa
 * data adapter via `NEXT_PUBLIC_DEFAULT_REGION`.
 *
 * We still set a stable `_medusa_cache_id` cookie on first visit so Next.js
 * cache tags can be scoped per-visitor when needed.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = request.cookies.get("_medusa_cache_id");
  if (!existing) {
    response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|locales|robots.txt|sitemap.xml|png|svg|jpg|jpeg|gif|webp).*)",
  ],
};
