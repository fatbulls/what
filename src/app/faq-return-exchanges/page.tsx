"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import Accordion from "@components/common/accordion";
import PageHeader from "@components/ui/page-header";
import { faq_return_exchanges } from "@settings/faq.settings";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {QueryClient} from "react-query";
import {API_ENDPOINTS} from "@framework/utils/endpoints";
import {fetchSettings} from "@framework/settings/settings.query";
import { Seo } from "@components/seo";
export default function FAQReturnExchanges() {
    const description =
        "Get answers on Because You Florist returns, exchanges, timeframes, and conditions.";
    return (
        <>
        
        <Seo
          pageName="Return & Exchanges FAQ"
          title="Return & Exchanges FAQ"
          description={description}
          canonicalPath="/faq-return-exchanges"
          breadcrumbs={[
            { name: "Home", item: "/" },
            { name: "FAQ", item: "/faq" },
            { name: "Return & Exchanges", item: "/faq-return-exchanges" },
          ]}
          schema={{
            type: "webPage",
            data: {
              title: "Return & Exchanges FAQ",
              description,
            },
          }}
      />
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


