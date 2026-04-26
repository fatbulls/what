"use client";

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
import {
  checkoutAtom,
  orderTrackingNumberAtom,
  orderIdAtom,
  checkoutEmailAtom,
  billingSameAsShippingAtom,
} from "@store/checkout";
import {
  calculatePaidTotal,
  calculateTotal,
} from "@store/quick-cart/cart.utils";
import { useTranslation } from "next-i18next";
import { trackPurchase } from "@lib/analytics";
import useUser from "@framework/auth/use-user";

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
      customer_contact,
      payment_gateway,
      payment_intent_id,
      messageCard,
      delivery_date,
    },
  ] = useAtom(checkoutAtom);
  const [orderTrackingNumber, setOrderTrackingNumber] = useAtom(orderTrackingNumberAtom);
  const [, setOrderId] = useAtom(orderIdAtom);
  const [checkoutEmail] = useAtom(checkoutEmailAtom);
  const [sameAs] = useAtom(billingSameAsShippingAtom);
  const { me } = useUser();
  // Effective contact: signed-in user's email > guest's typed email > the
  // phone number on the shipping address (useful for SMS-only orders).
  const effectiveContact =
    me?.email ||
    checkoutEmail ||
    (shipping_address as any)?.address?.phone_number ||
    (shipping_address as any)?.phone_number ||
    customer_contact ||
    "";
  const effectiveBilling = sameAs ? shipping_address : billing_address;

  useEffect(() => {
    setErrorMessage(null);
  }, [payment_gateway]);

  // Medusa's cart.complete() revalidates stock + recomputes totals on submit.
  // We pass a local estimate here; the server response overrides it.
  const available_items = items;
  const subtotal = calculateTotal(available_items);
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax: 0,
      shipping_charge: 0,
    },
    0
  );
  const handlePlaceOrder = () => {
    if (!effectiveContact) {
      setErrorMessage(
        t("common:contact-or-email-required", {
          defaultValue: "Please provide an email or phone number.",
        }),
      );
      return;
    }
    if (!payment_gateway) {
      setErrorMessage(t("common:text-gateway-required"));
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
        router.push(`/orders/${orderTrackingNumber}`);
        return;
      }
    }

    setPlaceOrderClicked(true);
    setPlaceOrderLoading(true);

    const baseStatus = orderStatusData?.orderStatuses?.data?.[0]?.id ?? "1";

    const input: any = buildOrderInput({
      availableItems: available_items ?? [],
      subtotal,
      total,
      deliveryTimeTitle: delivery_time?.title,
      deliveryDate: delivery_date,
      customerContact: effectiveContact,
      paymentGateway: payment_gateway,
      billingAddress: (effectiveBilling as any)?.address && (effectiveBilling as any).address,
      shippingAddress: shipping_address?.address && shipping_address.address,
      messageCard,
      status: payment_gateway === 'STRIPE' ? 2 : baseStatus,
      paymentIntentId: payment_intent_id ?? undefined,
      extra: payment_gateway === 'STRIPE' ? { payment_pending: true } : undefined,
    });

    if (payment_gateway === "DIRECT_BANK_TRANSFER") {
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

          router.push(`/orders/${order?.tracking_number}`);
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
    effectiveContact,
    payment_gateway,
    effectiveBilling,
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
