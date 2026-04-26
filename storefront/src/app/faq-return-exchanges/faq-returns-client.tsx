"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import Accordion from "@components/common/accordion";
import PageHeader from "@components/ui/page-header";
import { faq_return_exchanges } from "@settings/faq.settings";

export default function FAQReturnsClient() {
  return (
    <>
      <PageHeader pageHeader="text-page-faq" />
      <Container>
        <div className="py-16 lg:py-20 px-0 max-w-5xl mx-auto space-y-4">
          <Accordion items={faq_return_exchanges} translatorNS="faq" />
        </div>
        <Subscription />
      </Container>
    </>
  );
}
