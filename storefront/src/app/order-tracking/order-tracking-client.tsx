"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import Container from "@components/ui/container";
import PageHeader from "@components/ui/page-header";
import Input from "@components/ui/input";
import Button from "@components/ui/button";
import OrderView from "@components/orders/order-view";
import { OrderService } from "@framework/orders/order.service";

interface FormValues {
  tracking_number: string;
  email: string;
}

const schema = yup.object().shape({
  tracking_number: yup
    .string()
    .trim()
    .required("forms:error-tracking-number-required"),
  email: yup
    .string()
    .trim()
    .email("forms:error-email-format")
    .required("forms:error-email-required"),
});

const defaultValues: FormValues = {
  tracking_number: "",
  email: "",
};

export default function OrderTrackingClient() {
  const { t } = useTranslation();
  const [order, setOrder] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema), defaultValues });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setNotFound(false);
    try {
      // OrderService.findOne accepts the legacy `tracking-number/<id>`
      // shape and resolves Medusa display_id → /store/orders. Anonymous
      // lookup; no auth cookie required.
      const res = await OrderService.findOne(
        `tracking-number/${values.tracking_number.trim()}`,
      );
      const found = res?.data;
      // Privacy guard: require the email match the order's customer
      // email so randomly enumerating display_ids doesn't leak details.
      const orderEmail = String(
        found?.customer?.email ?? found?.email ?? "",
      ).toLowerCase();
      const submittedEmail = values.email.trim().toLowerCase();
      if (!found || (orderEmail && orderEmail !== submittedEmail)) {
        setOrder(null);
        setNotFound(true);
        return;
      }
      setOrder(found);
    } catch (e: any) {
      toast.error(e?.message || "Failed to look up order");
      setNotFound(true);
    } finally {
      setSubmitting(false);
    }
  }

  function reseat() {
    reset(defaultValues);
    setOrder(null);
    setNotFound(false);
  }

  return (
    <>
      <PageHeader pageHeader="text-track-your-order" />
      <Container>
        {order ? (
          <div className="py-10 lg:py-14 max-w-3xl mx-auto">
            <OrderView order={order} />
            <div className="text-center mt-2">
              <Button
                variant="slim"
                onClick={reseat}
                className="text-sm"
              >
                {t("common:text-track-different-order", {
                  defaultValue: "Track a different order",
                })}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 lg:py-10 max-w-xl mx-auto space-y-6 lg:space-y-8">
            {/* Help copy — left-aligned, no duplicate H2 (the page hero
                above already announces "Track Your Order"). The wrapper's
                space-y handles the gap to the form below; relying on the
                <p>'s margin-bottom doesn't work because tailwind.css's
                base layer has `p:last-of-type { margin-bottom: 0 }`,
                which matches a lone <p> and zeroes out its mb-* utility. */}
            <p className="text-sm text-body leading-6">
              {t("common:text-order-tracking-help", {
                defaultValue:
                  "Enter your order number and the email address you used at checkout to view your order status.",
              })}
            </p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col space-y-5"
            >
              <Input
                labelKey="forms:label-tracking-number"
                placeholderKey="forms:placeholder-tracking-number"
                {...register("tracking_number")}
                errorKey={t(errors.tracking_number?.message!)}
                variant="solid"
              />
              <Input
                labelKey="forms:label-email-required"
                type="email"
                placeholderKey="forms:placeholder-email"
                {...register("email")}
                errorKey={t(errors.email?.message!)}
                variant="solid"
              />
              <Button
                type="submit"
                loading={submitting}
                disabled={submitting}
                className="h-12 lg:h-12 mt-2 text-sm lg:text-base w-full"
              >
                {t("common:text-track-order", { defaultValue: "Track Order" })}
              </Button>
            </form>

            {notFound ? (
              <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {t("common:text-order-not-found", {
                  defaultValue:
                    "We couldn't find an order matching that tracking number and email. Please double-check and try again.",
                })}
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </>
  );
}
