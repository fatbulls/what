import { RadioGroup } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Alert from "@components/ui/alert";
import StripePayment from "@components/checkout/payment/stripe";
import CashOnDelivery from "@components/checkout/payment/cash-on-delivery";
import DirectBankTransfer from "@components/checkout/payment/direct-bank-transfer";
import RazerMSPay from "@components/checkout/payment/razer-ms-pay";
import Image from "@components/ui/next-image";
import { useAtom } from "jotai";
import { paymentGatewayAtom, PaymentMethodName } from "@store/checkout";
import cn from "classnames";
import { useCart } from "@store/quick-cart/cart.context";
import { trackAddPaymentInfo } from "@lib/analytics";

type PaymentIcon = {
  src: string;
  width: number;
  height: number;
};

interface PaymentMethodInformation {
  name: string;
  value: PaymentMethodName;
  icon?: PaymentIcon;
  component: React.FunctionComponent;
}
// Payment Methods Mapping Object

const AVAILABLE_PAYMENT_METHODS_MAP: Record<
  PaymentMethodName,
  PaymentMethodInformation
> = {
  /*CASH_ON_DELIVERY: {
    name: "Cash On Delivery",
    value: "CASH_ON_DELIVERY",
    icon: "",
    component: CashOnDelivery,
  },*/
  Razer_MS_PAY: {
    name: "Razer",
    value: "Razer_MS_PAY",
    icon: {
      src: "https://assets.becauseyou.com.my/assets/images/razer.svg",
      width: 100,
      height: 44,
    },
    component: RazerMSPay,
  },
  DIRECT_BANK_TRANSFER: {
    name: "Duitnow / TouchnGo",
    value: "DIRECT_BANK_TRANSFER",
    icon: "",
    component: DirectBankTransfer,
  },
  STRIPE: {
    name: "Stripe",
    value: "STRIPE",
    icon: {
      src: "https://assets.becauseyou.com.my/assets/images/stripe.png",
      width: 937,
      height: 446,
    },
    component: StripePayment,
  },
};

const PaymentGrid: React.FC<{ className?: string }> = ({ className }) => {
  const [gateway, setGateway] = useAtom<PaymentMethodName>(paymentGatewayAtom);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation("common");
  const { items: cartItems, total: cartTotal } = useCart();
  const PaymentMethod = AVAILABLE_PAYMENT_METHODS_MAP[gateway];
  const Component = PaymentMethod?.component ?? StripePayment;

  const handleGatewayChange = (value: PaymentMethodName) => {
    setGateway(value);
    if (cartItems?.length) {
      trackAddPaymentInfo({
        items: cartItems,
        value: cartTotal,
        paymentType: value,
      });
    }
  };
  return (
    <div className={className}>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      <RadioGroup value={gateway} onChange={handleGatewayChange}>
        <RadioGroup.Label className="text-base text-heading font-semibold mb-5 block">
          {t("text-choose-payment")}
        </RadioGroup.Label>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-6">
          {Object.values(AVAILABLE_PAYMENT_METHODS_MAP).map(
            ({ name, icon, value }) => (
              <RadioGroup.Option value={value} key={value}>
                {({ checked }) => (
                  <div
                    className={cn(
                      "w-full h-full py-3 flex items-center justify-center border text-center rounded cursor-pointer relative",
                      checked
                        ? "bg-white border-gray-600 shadow-600"
                        : "bg-white border-gray-100"
                    )}
                  >
                    {icon ? (
                      <Image
                        src={icon.src}
                        alt={name}
                        width={icon.width}
                        height={icon.height}
                        className="h-[30px] w-auto"
                        sizes="120px"
                      />
                    ) : (
                      <span className="text-xs text-heading font-semibold">
                        {name}
                      </span>
                    )}
                  </div>
                )}
              </RadioGroup.Option>
            )
          )}
        </div>
      </RadioGroup>
      <div>
        <Component />
      </div>
    </div>
  );
};

export default PaymentGrid;
