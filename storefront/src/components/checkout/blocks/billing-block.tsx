"use client";

import { useAtom, WritableAtom } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { Address } from "@framework/types";
import {
  billingAddressAtom,
  shippingAddressAtom,
  billingSameAsShippingAtom,
} from "@store/checkout";
import InlineAddressForm from "./inline-address-form";

interface Props {
  count: number;
  className?: string;
  userId: string;
  addresses: Address[] | undefined;
}

// Section 4. Default "same as delivery" covers 95% of gift-florist orders.
// Uncheck to fill a separate billing address — same inline form as delivery.
const BillingBlock: React.FC<Props> = ({ count, className, addresses }) => {
  const { t } = useTranslation("common");
  const [sameAs, setSameAs] = useAtom(billingSameAsShippingAtom);
  const [shipping] = useAtom(
    shippingAddressAtom as WritableAtom<Address | null, Address>,
  );
  const [billing, setBilling] = useAtom(
    billingAddressAtom as WritableAtom<Address | null, Address>,
  );

  // Mirror shipping whenever "same as" is checked.
  useEffect(() => {
    if (sameAs && shipping && shipping !== billing) {
      setBilling(shipping);
    }
  }, [sameAs, shipping, billing, setBilling]);

  return (
    <div className={className}>
      <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <span>{count}.</span>
        <span>
          {t("text-billing-address", { defaultValue: "Billing Address" })}
        </span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer mb-5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={sameAs}
          onChange={(e) => setSameAs(e.target.checked)}
        />
        <span className="text-sm text-heading font-medium">
          {t("text-billing-same-as-shipping", {
            defaultValue: "Billing address same as delivery",
          })}
        </span>
      </label>

      {!sameAs && (
        <InlineAddressForm
          atom={billingAddressAtom as any}
          savedAddresses={addresses}
          type="billing"
        />
      )}
    </div>
  );
};

export default BillingBlock;
