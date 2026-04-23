"use client";

import { useTranslation } from "next-i18next";
import { billingAddressAtom, shippingAddressAtom } from "@store/checkout";
import dynamic from "next/dynamic";
import useUser from "@framework/auth/use-user";
import { AddressType } from "@framework/utils/constants";
import { Address } from "@framework/types";
import Divider from "@components/ui/divider";
import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import { Seo } from "@components/seo";


const ScheduleGrid = dynamic(
  () => import("@components/checkout/schedule/schedule-grid")
);
const MessageCard = dynamic(
    () => import("@components/checkout/message-card")
);
const AddressGrid = dynamic(() => import("@components/checkout/address-grid"));
const ContactGrid = dynamic(
  () => import("@components/checkout/contact/contact-grid")
);
const RightSideView = dynamic(
  () => import("@components/checkout/right-side-view")
);

export default function CheckoutPage() {
  const { me } = useUser();
  const { t } = useTranslation();
  const description =
    "Secure checkout for Because You Florist—confirm delivery schedules, addresses, and payment details.";
  
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
          data: {
            title: "Checkout",
            description,
          },
        }}
      />
      <Divider className="mb-0" />
      <Container>
        <div className="py-8 lg:py-10 xl:py-14 max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start m-auto lg:space-x-7 xl:space-x-12 rtl:space-x-reverse w-full">
            <div className="w-full space-y-6">
              <ContactGrid
                className="shadow-checkoutCard border border-gray-100 rounded-md p-5 md:p-7 bg-white"
                //@ts-ignore
                userId={me?.id!}
                profileId={me?.profile?.id!}
                contact={me?.profile?.contact!}
                label={t("text-contact-number")}
                count={1}
              />
              <AddressGrid
                  userId={me?.id!}
                  className="shadow-checkoutCard border border-gray-100 rounded-md p-5 md:p-7 bg-white"
                  label={t("text-shipping-address")}
                  count={2}
                  //@ts-ignore
                  addresses={me?.address?.filter(
                      (address: Address) => address?.type === AddressType.Shipping
                  )}
                  isShipping={true}
                  atom={shippingAddressAtom}
                  type={AddressType.Shipping}
              />
              <AddressGrid
                userId={me?.id!}
                className="shadow-checkoutCard border border-gray-100 rounded-md p-5 md:p-7 bg-white"
                label={t("text-billing-address")}
                count={3}
                //@ts-ignore
                addresses={me?.address?.filter(
                  (address: Address) => address?.type === AddressType.Billing
                )}
                isShipping={false}
                atom={billingAddressAtom}
                type={AddressType.Billing}
              />
              <ScheduleGrid
                className="shadow-checkoutCard border border-gray-100 rounded-md p-5 md:p-7 bg-white"
                label={t("text-delivery-schedule")}
                count={4}
              />
              <MessageCard
                  className="shadow-checkoutCard border border-gray-100 rounded-md p-5 md:p-7 bg-white"
                  label={t("text-message-card")}
                  count={5}
                  messageCardContent={"Message Card content add this "}
              />
            </div>
            <div className="w-full lg:w-[320px] xl:w-[440px] flex-shrink-0 mt-10 sm:mt-12 lg:mt-0">
              <RightSideView />
            </div>
          </div>
        </div>
        <Subscription />
      </Container>
    </>
  );
}

CheckoutPage.authenticate = true;
