import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

// Shared-secret webhook called by the Medusa admin after content edits, to
// invalidate ISR caches immediately instead of waiting for the soft revalidate
// window. Accepts:
//   POST /api/revalidate?secret=…&tag=site-config
//   POST /api/revalidate?secret=…&path=/blog
// Multiple `tag` / `path` query params are accepted.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const tags = url.searchParams.getAll("tag");
  const paths = url.searchParams.getAll("path");
  for (const t of tags) revalidateTag(t);
  for (const p of paths) revalidatePath(p);
  return NextResponse.json({ ok: true, tags, paths });
}

export async function GET(req: Request) {
  return POST(req);
}
