"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import Accordion from "@components/common/accordion";
import PageHeader from "@components/ui/page-header";

interface Props {
  items: { id: string; question: string; answer: string }[];
}

export default function FAQClient({ items }: Props) {
  // Adapt admin-edited rows to the Accordion's {title, content} shape
  // (it also supports {titleKey, contentKey} for legacy i18n callers).
  const accordionItems = (items ?? []).map((it) => ({
    title: it.question,
    content: it.answer,
  }));
  return (
    <>
      <PageHeader pageHeader="text-page-faq" />
      <Container>
        <div className="py-16 lg:py-20 px-0 max-w-5xl mx-auto space-y-4">
          {accordionItems.length ? (
            <Accordion items={accordionItems} translatorNS="faq" />
          ) : (
            <p className="text-body text-sm text-center py-8">No FAQs yet.</p>
          )}
        </div>
        <Subscription />
      </Container>
    </>
  );
}
