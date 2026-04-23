import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useCreateOrderMutation,
  useOrderStatusesQuery,
} from "@framework/orders/orders.query";

import ValidationError from "@components/ui/validation-error";
import Button from "@components/ui/button";
import isEmpty from "lodash/isEmpty";
import { buildOrderInput } from "@components/checkout/utils/order-input";
import { useCart } from "@store/quick-cart/cart.context";
import { useAtom } from "jotai";
import { checkoutAtom, discountAtom, orderTrackingNumberAtom, orderIdAtom } from "@store/checkout";
import {
  calculatePaidTotal,
  calculateTotal,
} from "@store/quick-cart/cart.utils";
import { useTranslation } from "next-i18next";
import { trackPurchase } from "@lib/analytics";

export const PlaceOrderAction: React.FC = (props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: createOrder, isLoading: loading } = useCreateOrderMutation();
  const [placeOrderLoading, setPlaceOrderLoading] = useState(loading);
  const [placeOrderClicked, setPlaceOrderClicked] = useState(false);

  const { data: orderStatusData } = useOrderStatusesQuery();

  const { items } = useCart();
  const [
    {
      billing_address,
      shipping_address,
      delivery_time,
      coupon,
      verified_response,
      customer_contact,
      payment_gateway,
      payment_intent_id,
      messageCard,
      delivery_date,
    },
  ] = useAtom(checkoutAtom);
  const [discount] = useAtom(discountAtom);
  const [orderTrackingNumber, setOrderTrackingNumber] = useAtom(orderTrackingNumberAtom);
  const [, setOrderId] = useAtom(orderIdAtom);

  useEffect(() => {
    setErrorMessage(null);
  }, [payment_gateway]);

  const available_items = items?.filter(
    (item) => !verified_response?.unavailable_products?.includes(item.id)
  );

  const subtotal = calculateTotal(available_items);
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax: verified_response?.total_tax!,
      shipping_charge: verified_response?.shipping_charge!,
    },
    Number(discount)
  );
  const handlePlaceOrder = () => {
    if (!customer_contact) {
      setErrorMessage(t("common:contact-number-required"));
      return;
    }
    if (!payment_gateway) {
      setErrorMessage(t("common:text-gateway-required"));
      return;
    }
    if (!messageCard) {
      setErrorMessage('Message card is missing');
      return;
    }
    if (payment_gateway === "STRIPE") {
      if (!payment_intent_id) {
        setErrorMessage(
          t('common:text-stripe-confirm-first', {
            defaultValue: 'Please confirm your Stripe payment before placing the order.',
          })
        );
        return;
      }

      if (orderTrackingNumber) {
        router.push(`/my-account/orders/${orderTrackingNumber}`);
        return;
      }
    }

    setPlaceOrderClicked(true);
    setPlaceOrderLoading(true);
    console.log('placeOrderClicked', placeOrderClicked);
    console.log('loading', loading);
    console.log('payment_intent_id', payment_intent_id);

    const baseStatus = orderStatusData?.orderStatuses?.data?.[0]?.id ?? "1";

    const input: any = buildOrderInput({
      availableItems: available_items ?? [],
      subtotal,
      total,
      verifiedTotalTax: verified_response?.total_tax,
      verifiedShipping: verified_response?.shipping_charge,
      couponId: coupon?.id ? Number(coupon?.id) : null,
      discount: discount ?? 0,
      deliveryTimeTitle: delivery_time?.title,
      deliveryDate: delivery_date,
      customerContact: customer_contact,
      paymentGateway: payment_gateway,
      billingAddress: billing_address?.address && billing_address.address,
      shippingAddress: shipping_address?.address && shipping_address.address,
      messageCard,
      status: payment_gateway === 'STRIPE' ? 2 : baseStatus,
      paymentIntentId: payment_intent_id ?? undefined,
      extra: payment_gateway === 'STRIPE' ? { payment_pending: true } : undefined,
    });

    if (payment_gateway === "DIRECT_BANK_TRANSFER" || 'Razer_MS_PAY' === payment_gateway) {
      input.status = 2; // Pending Payment
    }
    createOrder(input, {
      onSuccess: (order: any) => {
        if (order) {
          trackPurchase(order);
        }
        if (order?.tracking_number) {
          // Enable button loading until go to next page
          setPlaceOrderLoading(true);
          setOrderTrackingNumber(order.tracking_number);
          setOrderId(order?.id ?? null);

          router.push(`/my-account/orders/${order?.tracking_number}`);
        }
      },
      onError: (error: any) => {
        setErrorMessage(error?.response?.data?.message);
      },
    });
  };
  if (payment_gateway === "STRIPE") {
    return null;
  }

  const isAllRequiredFieldSelected = [
    customer_contact,
    payment_gateway,
    billing_address,
    shipping_address,
    delivery_time,
    available_items,
  ].every((item) => !isEmpty(item));
  return (
    <div className="px-6">
      <Button
        loading={placeOrderLoading}
        className="w-full my-5"
        onClick={handlePlaceOrder}
        disabled={!isAllRequiredFieldSelected || placeOrderClicked}
        {...props}
      />
      {errorMessage && (
        <div className="my-3">
          <ValidationError message={errorMessage} />
        </div>
      )}
    </div>
  );
};
