"use client";

import { useTranslation } from "next-i18next";
import { Address } from "@framework/types";
import { shippingAddressAtom } from "@store/checkout";
import InlineAddressForm from "./inline-address-form";
import GiftNoteToggle from "./gift-note-toggle";

interface Props {
  count: number;
  className?: string;
  userId: string;
  addresses: Address[] | undefined;
}

// Section 2. Fields are directly editable — no modal-to-Add. Saved
// addresses (if the customer has any) surface as a compact quick-fill
// dropdown inside `InlineAddressForm`.
const DeliveryBlock: React.FC<Props> = ({ count, className, addresses }) => {
  const { t } = useTranslation("common");

  return (
    <div className={className}>
      <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <span>{count}.</span>
        <span>
          {t("text-delivery-details", { defaultValue: "Delivery Details" })}
        </span>
      </div>

      <InlineAddressForm
        atom={shippingAddressAtom as any}
        savedAddresses={addresses}
        type="shipping"
      />

      <GiftNoteToggle />
    </div>
  );
};

export default DeliveryBlock;
