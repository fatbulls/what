"use client";

import { RadioGroup } from "@headlessui/react";
import { useAtom } from "jotai";
import { useTranslation } from "next-i18next";
import cn from "classnames";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { paymentGatewayAtom, PaymentMethodName } from "@store/checkout";
import { useCart } from "@store/quick-cart/cart.context";
import { trackAddPaymentInfo } from "@lib/analytics";
import { sdk } from "@lib/medusa";
import { listPaymentProviders } from "@framework/payments/use-medusa-payment-session";

const DirectBankTransfer = dynamic(
  () => import("@components/checkout/payment/direct-bank-transfer"),
  { ssr: false },
);
const StripePayment = dynamic(
  () => import("@components/checkout/payment/stripe"),
  { ssr: false },
);

interface Props {
  // When rendered as a standalone section card, pass `count` (shows the
  // numbered header). When rendered inline inside the summary, pass
  // `inline` instead — drops the number, header copy shrinks to a label.
  count?: number;
  inline?: boolean;
  className?: string;
}

const OPTIONS: Array<{
  value: PaymentMethodName;
  title: string;
  desc: string;
}> = [
  {
    value: "DIRECT_BANK_TRANSFER",
    title: "Bank transfer",
    desc: "DuitNow / TouchNGo / Maybank2u",
  },
  {
    value: "STRIPE",
    title: "Pay online",
    desc: "Card · FPX · GrabPay · Apple/Google Pay",
  },
];

const PaymentBlock: React.FC<Props> = ({ count, inline = false, className }) => {
  const { t } = useTranslation("common");
  const [gateway, setGateway] = useAtom<PaymentMethodName>(paymentGatewayAtom);
  const { items, total } = useCart();
  const [stripeAvailable, setStripeAvailable] = useState(true);

  // Probe the MY region for Stripe; hide the "Pay online" radio when the
  // provider isn't registered (e.g. STRIPE_API_KEY unset on the backend).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { regions } = await sdk.client.fetch<{ regions: any[] }>(
          "/store/regions",
        );
        const region =
          regions?.find((r) =>
            r.countries?.some((c: any) => c.iso_2 === "my"),
          ) ?? regions?.[0];
        if (!region?.id) return;
        const providers = await listPaymentProviders(region.id);
        const hasStripe = providers.some((p) => p.id === "pp_stripe_stripe");
        if (!cancelled) {
          setStripeAvailable(hasStripe);
          // If the user's default gateway is Stripe and it's unavailable,
          // fall back to DBT so the button isn't stuck disabled.
          if (!hasStripe && gateway === "STRIPE") {
            setGateway("DIRECT_BANK_TRANSFER");
          }
        }
      } catch {
        if (!cancelled) setStripeAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (value: PaymentMethodName) => {
    setGateway(value);
    if (items?.length) {
      trackAddPaymentInfo({
        items,
        value: total,
        paymentType: value,
      });
    }
  };

  return (
    <div className={className}>
      {inline ? (
        <div className="text-sm font-semibold text-heading mb-3 mt-2">
          {t("text-payment-method", { defaultValue: "Payment method" })}
        </div>
      ) : (
        <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
          <span>{count}.</span>
          <span>{t("text-payment", { defaultValue: "Payment" })}</span>
        </div>
      )}

      <RadioGroup value={gateway} onChange={onChange} className="space-y-3">
        {OPTIONS.filter((opt) => opt.value !== "STRIPE" || stripeAvailable).map((opt) => (
          <RadioGroup.Option value={opt.value} key={opt.value}>
            {({ checked }) => (
              <div
                className={cn(
                  "flex items-start gap-3 p-4 rounded border cursor-pointer",
                  checked
                    ? "border-gray-600 bg-white shadow-600"
                    : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <span
                  className={cn(
                    "mt-1 h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0",
                    checked ? "border-heading" : "border-gray-300",
                  )}
                >
                  {checked && (
                    <span className="h-2 w-2 rounded-full bg-heading" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-heading">
                    {opt.title}
                  </div>
                  <div className="text-xs text-body">{opt.desc}</div>
                </div>
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>

      <div className="mt-5">
        {gateway === "DIRECT_BANK_TRANSFER" && <DirectBankTransfer />}
        {gateway === "STRIPE" && <StripePayment />}
      </div>
    </div>
  );
};

export default PaymentBlock;
