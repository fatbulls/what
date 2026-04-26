"use client";

import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";
import usePrice from "@lib/use-price";
import { useCart } from "@store/quick-cart/cart.context";
import { calculateTotal } from "@store/quick-cart/cart.utils";
import EmptyCartIcon from "@components/icons/empty-cart";
import ItemCard from "@components/checkout/item/item-card";
import SummaryRow from "./summary-row";
import TrustFooter from "./trust-footer";
import { PlaceOrderAction } from "@components/checkout/action/place-order-action";

// Payment method picker lives inside the summary, just above Place Order —
// this was the original ChawkBazar/VerifiedItemList arrangement and keeps
// the checkout conversion flow tight ("pick method → click pay").
const PaymentBlock = dynamic(
  () => import("@components/checkout/blocks/payment-block"),
  { ssr: false },
);

interface Props {
  className?: string;
}

// Totals here are a local estimate — Medusa's cart.complete() returns
// authoritative totals on submit, which is what the customer actually pays.
const CheckoutSummary: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation("common");
  const { items, isEmpty } = useCart();

  const subtotalAmount = calculateTotal(items);
  const { price: subtotal } = usePrice({ amount: subtotalAmount });
  const { price: total } = usePrice({ amount: subtotalAmount });

  return (
    <div
      className={`shadow-checkoutCard border border-gray-100 rounded-md bg-white lg:sticky lg:top-24 ${className ?? ""}`}
    >
      <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50 rounded-t-md">
        <h2 className="text-base font-semibold text-heading">
          {t("text-order-summary", { defaultValue: "Order summary" })}
        </h2>
      </div>

      <div className="px-6 py-2.5 max-h-[360px] overflow-y-auto">
        {!isEmpty ? (
          items?.map((item) => (
            <ItemCard item={item} key={item.id} notAvailable={false} />
          ))
        ) : (
          <div className="py-8 flex justify-center">
            <EmptyCartIcon />
          </div>
        )}
      </div>

      <div className="px-6">
        <SummaryRow label={t("text-sub-total")} value={subtotal} />
        <SummaryRow
          label={t("text-shipping")}
          value="Calculated on submit"
          muted
        />
        <SummaryRow label={t("text-total")} value={total} emphasized />
      </div>

      <div className="px-6 pt-2 pb-2 border-t border-gray-100">
        <PaymentBlock inline />
      </div>

      <div className="px-6 pb-5">
        <PlaceOrderAction>{t("button-place-order")}</PlaceOrderAction>
        <TrustFooter />
      </div>
    </div>
  );
};

export default CheckoutSummary;
