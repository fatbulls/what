import { formatOrderedProduct } from "@lib/format-ordered-product";
import { useState } from "react";
import ValidationError from "@components/ui/validation-error";
import { useVerifyCheckoutMutation } from "@framework/checkout/checkout.query";
import { useAtom } from "jotai";
import {
  billingAddressAtom,
  shippingAddressAtom,
  messageCardAtom,
  verifiedResponseAtom,
} from "@store/checkout";
import Button from "@components/ui/button";
import { useCart } from "@store/quick-cart/cart.context";
import { useTranslation } from "next-i18next";

export const CheckAvailabilityAction: React.FC = (props) => {
  const { t } = useTranslation("common");
  const [billing_address] = useAtom(billingAddressAtom);
  const [shipping_address] = useAtom(shippingAddressAtom);
  const [messageCard] = useAtom(messageCardAtom);
  const [_, setVerifiedResponse] = useAtom(verifiedResponseAtom);

  const [errorMessage, setError] = useState("");
  const { items, total, isEmpty } = useCart();

  const {
    mutate: verifyCheckout,
    isLoading: loading,
  } = useVerifyCheckoutMutation();

  function handleVerifyCheckout() {
    console.log(messageCard, !messageCard);
    if (billing_address && shipping_address && messageCard) {
      verifyCheckout(
        {
          amount: total,
          products: items?.map((item) => formatOrderedProduct(item)),
          billing_address: {
            ...(billing_address?.address && billing_address.address),
          },
          shipping_address: {
            ...(shipping_address?.address && shipping_address.address),
          },
        },
        {
          onSuccess: (data) => {
            setVerifiedResponse(data);
          },
          onError: (error: any) => {
            setError(error?.response?.data?.message);
          },
        }
      );
    } else {
      if(!messageCard) {
         setError("Message card is missing");
      } else {
        setError("error-add-both-address");
      }
    }
  }

  return (
    <>
      <Button
        loading={loading}
        className="w-full"
        onClick={handleVerifyCheckout}
        disabled={isEmpty}
        {...props}
      />
      {errorMessage && (
        <div className="mt-3">
          <ValidationError message={t(errorMessage)} />
        </div>
      )}
    </>
  );
};
