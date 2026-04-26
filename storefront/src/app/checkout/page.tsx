"use client";

import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import useUser from "@framework/auth/use-user";
import { AddressType } from "@framework/utils/constants";
import { Address } from "@framework/types";
import Divider from "@components/ui/divider";
import Container from "@components/ui/container";
import { Seo } from "@components/seo";

const ContactBlock = dynamic(
  () => import("@components/checkout/blocks/contact-block"),
);
const DeliveryBlock = dynamic(
  () => import("@components/checkout/blocks/delivery-block"),
);
const ScheduleBlock = dynamic(
  () => import("@components/checkout/blocks/schedule-block"),
);
const BillingBlock = dynamic(
  () => import("@components/checkout/blocks/billing-block"),
);
const CheckoutSummary = dynamic(
  () => import("@components/checkout/summary/checkout-summary"),
);

const CARD_CLASS =
  "shadow-checkoutCard border border-gray-100 rounded-md p-5 md:p-7 bg-white";

export default function CheckoutPage() {
  const { me } = useUser();
  const { t } = useTranslation();
  const description =
    "Secure checkout — confirm delivery, addresses, and payment.";

  const shippingAddresses: Address[] = (me?.address ?? []).filter(
    (a: Address) => a?.type === AddressType.Shipping,
  );
  const billingAddresses: Address[] = (me?.address ?? []).filter(
    (a: Address) => a?.type === AddressType.Billing,
  );

  return (
    <>
      <Seo
        pageName="Checkout"
        title="Checkout"
        description={description}
        canonicalPath="/checkout"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Cart", item: "/cart" },
          { name: "Checkout", item: "/checkout" },
        ]}
        schema={{
          type: "webPage",
          data: { title: "Checkout", description },
        }}
      />
      <Divider className="mb-0" />
      <Container>
        <div className="py-8 lg:py-10 xl:py-14 max-w-[1280px] mx-auto">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_440px]">
            {/* Left column: 4 numbered blocks; payment lives in the summary */}
            <div className="space-y-6">
              <ContactBlock count={1} className={CARD_CLASS} me={me} />
              <DeliveryBlock
                count={2}
                className={CARD_CLASS}
                //@ts-ignore
                userId={me?.id ?? ""}
                addresses={shippingAddresses}
              />
              <ScheduleBlock count={3} className={CARD_CLASS} />
              <BillingBlock
                count={4}
                className={CARD_CLASS}
                //@ts-ignore
                userId={me?.id ?? ""}
                addresses={billingAddresses}
              />
            </div>
            {/* Right column: sticky summary with payment + Place Order */}
            <CheckoutSummary />
          </div>
        </div>
      </Container>
    </>
  );
}

// Guest checkout enabled — /checkout no longer forces sign-in.
CheckoutPage.authenticate = false;
