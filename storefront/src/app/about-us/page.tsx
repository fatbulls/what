import type { Metadata } from "next";
import AboutUsClient from "./about-us-client";
import { loadPage } from "@lib/cms-page";

const SLUG = "about-us";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadPage(SLUG);
  const title = page?.title || "About Us";
  const description =
    page?.meta_description ||
    "Learn about What Shop, our same-day delivery promise, and the team crafting every order.";
  return {
    title,
    description,
    alternates: { canonical: "/about-us" },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/about-us",
    },
  };
}

// Slugify h2 heading text → DOM id used by both the side nav and the
// scroll-spy target. Server-side so SSR ships the rendered HTML with
// stable ids and the post-hydration nav doesn't have to re-scan.
function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

// Walk the admin-edited HTML, extract <h2> headings into a {title,id}
// list (for the side nav), and rewrite each <h2> to carry its id.
// Plain regex parser — admin content is HTML from Tiptap which doesn't
// nest <h2> inside other <h2>, so the simple shape is safe.
function processSections(rawHtml: string): {
  html: string;
  sections: { id: string; title: string }[];
} {
  const sections: { id: string; title: string }[] = [];
  const seen = new Set<string>();
  const html = rawHtml.replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (_match, attrs, inner) => {
      const text = String(inner).replace(/<[^>]+>/g, "").trim();
      let id = slugifyHeading(text);
      // Disambiguate duplicate headings deterministically.
      let n = 2;
      while (seen.has(id)) id = `${slugifyHeading(text)}-${n++}`;
      seen.add(id);
      sections.push({ id, title: text });
      const stripIdAttr = String(attrs ?? "").replace(/\sid="[^"]*"/, "");
      return `<h2${stripIdAttr} id="${id}" class="text-lg md:text-xl lg:text-2xl text-heading font-bold mb-4 mt-10 first:mt-0 scroll-mt-24">${inner}</h2>`;
    },
  );
  return { html, sections };
}

export default async function AboutUsPage() {
  const page = await loadPage(SLUG);
  const { html, sections } = processSections(page?.content ?? "");
  return (
    <AboutUsClient
      pageTitle={page?.title ?? "About Us"}
      contentHtml={html}
      sections={sections}
    />
  );
}
