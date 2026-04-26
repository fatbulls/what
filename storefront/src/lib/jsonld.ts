// JSON-LD builders. Render the returned object inside a
// <script type="application/ld+json"> tag in a server component.
//
// Why dedicated helpers (vs inline objects):
//   - One place enforces shape (Google's structured-data tests are strict).
//   - Tests / future renames don't have to grep across many call sites.

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
  "https://what.com.my";

function abs(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export type BreadcrumbItem = {
  name: string;
  url: string; // relative or absolute; relativized to BASE if absolute
};

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export type FaqEntry = {
  question: string;
  answer: string; // plain text or HTML; passed verbatim to acceptedAnswer.text
};

export function faqPage(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

// Convenience for embedding a single JSON-LD object as a script tag's
// inner string. Use with `dangerouslySetInnerHTML={{ __html: ... }}`.
export function jsonLdString(obj: unknown): string {
  return JSON.stringify(obj);
}
