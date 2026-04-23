"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import Accordion from "@components/common/accordion";
import PageHeader from "@components/ui/page-header";
import { faq_shipping_delivery } from "@settings/faq.settings";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {QueryClient} from "@tanstack/react-query";
import {API_ENDPOINTS} from "@framework/utils/endpoints";
import {fetchSettings} from "@framework/settings/settings.query";
import { Seo } from "@components/seo";
export default function FAQShippingDelivery() {
    const description =
        "Find answers about delivery coverage, same-day cutoffs, and handling for Because You Florist orders.";
    return (
        <>
        <Seo
          pageName="Shipping & Delivery FAQ"
          title="Shipping & Delivery FAQ"
          description={description}
          canonicalPath="/faq-shipping-delivery"
          breadcrumbs={[
            { name: "Home", item: "/" },
            { name: "FAQ", item: "/faq" },
            { name: "Shipping & Delivery", item: "/faq-shipping-delivery" },
          ]}
          schema={{
            type: "webPage",
            data: {
              title: "Shipping & Delivery FAQ",
              description,
            },
          }}
        />
        
            <PageHeader pageHeader="text-page-faq" />
            <Container>
                <div className="py-16 lg:py-20 px-0 max-w-5xl mx-auto space-y-4">
                    <Accordion items={faq_shipping_delivery} translatorNS="faq" />
                </div>
                <Subscription />
            </Container>
        </>
    );
}


