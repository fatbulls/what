// Build FAQPage JSON-LD from a list of admin-edited FAQ items.
// Used by /app/faq*/page.tsx server components after fetching the
// items from the Medusa faq module (lib/site-faq.ts).
//
// Why server-side: Google's FAQ rich result requires the Q&A to be
// present in the initial HTML payload. The Accordion component
// renders the same items client-side; we mirror them in JSON-LD here.

import { faqPage } from "./jsonld";

type FaqInput = { question: string; answer: string };

// Strip raw HTML so the answer string stays close to the visible plain
// text. Google accepts HTML in the `text` field, but crawlers prefer
// concise snippets.
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

export function buildFaqJsonLd(items: FaqInput[]) {
  const entries = (items ?? [])
    .filter((it) => it?.question && it?.answer)
    .map((it) => ({ question: it.question, answer: htmlToText(it.answer) }));
  if (!entries.length) return null;
  return faqPage(entries);
}
