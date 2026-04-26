// Build a FAQPage JSON-LD from a list of i18n key pairs (titleKey,
// contentKey) + the corresponding translation map. Used by
// /app/faq*/page.tsx to emit structured data without ever rendering the
// faq client-side first.
//
// Why server-side: Google's FAQ rich result requires the Q&A to be
// present in the initial HTML payload. The Accordion component renders
// the same strings client-side; we mirror them in JSON-LD here.

import enFaq from "../../public/locales/en/faq.json";
import { faqPage } from "./jsonld";

type FaqEntry = { titleKey: string; contentKey: string };

const messages: Record<string, string> = enFaq as Record<string, string>;

// Strip raw HTML so the answer string stays close to the visible plain
// text. Google's FAQ guidelines accept HTML in the `text` field, but
// crawlers prefer concise snippets.
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

export function buildFaqJsonLd(items: FaqEntry[]) {
  const entries = items
    .map((it) => {
      const q = messages[it.titleKey];
      const a = messages[it.contentKey];
      if (!q || !a) return null;
      return { question: q, answer: htmlToText(a) };
    })
    .filter(Boolean) as { question: string; answer: string }[];
  if (!entries.length) return null;
  return faqPage(entries);
}
