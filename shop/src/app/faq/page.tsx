"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import Accordion from "@components/common/accordion";
import PageHeader from "@components/ui/page-header";
import { faq } from "@settings/faq.settings";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {QueryClient} from "@tanstack/react-query";
import {API_ENDPOINTS} from "@framework/utils/endpoints";
import {fetchSettings} from "@framework/settings/settings.query";
import { Seo } from "@components/seo";

export default function FAQ() {
  const description =
    "Find answers to common questions about Because You Florist orders, delivery, and customization.";
  return (
    <>
      <Seo
        pageName="FAQ"
        title="FAQ"
        description={description}
        canonicalPath="/faq"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "FAQ", item: "/faq" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "FAQ",
            description,
          },
        }}
      />
      <PageHeader pageHeader="text-page-faq" />
      <Container>
        <div className="py-16 lg:py-20 px-0 max-w-5xl mx-auto space-y-4">
          <Accordion items={faq} translatorNS="faq" />
        </div>
        <Subscription />
      </Container>
    </>
  );
}


