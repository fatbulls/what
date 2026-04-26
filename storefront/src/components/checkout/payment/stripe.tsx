"use client";

import Button from '@components/ui/button';
import ValidationError from '@components/ui/validation-error';
import { useCreateStripePaymentIntentMutation, fetchStripeOrderByIntent } from '@framework/payments/stripe-intent.mutation';
import { useCreateOrderMutation } from '@framework/orders/orders.query';
import { buildOrderInput } from '@components/checkout/utils/order-input';
import { useSettings } from '@contexts/settings.context';
import { useCart } from '@store/quick-cart/cart.context';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@store/quick-cart/cart.utils';
import {
  checkoutAtom,
  stripePaymentIntentAtom,
  orderTrackingNumberAtom,
  orderIdAtom,
} from '@store/checkout';
import getStripe from '@lib/get-stripe';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { trackPurchase } from '@lib/analytics';

const accentColor = '#212121';
const neutralBorder = '#d1d5db';
const isPromiseLike = (value: unknown): value is Promise<any> =>
  !!value && typeof (value as any).then === 'function';
const appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: accentColor,
    colorPrimaryText: accentColor,
    colorText: accentColor,
    colorTextSecondary: accentColor,
    colorIcon: accentColor,
    colorIconHover: accentColor,
    colorActionPrimary: accentColor,
    colorActionPrimaryText: '#ffffff',
    borderRadius: '8px',
    spacingUnit: '6px',
    fontFamily: '"Open Sans", "Helvetica Neue", sans-serif',
  },
  rules: {
    '.Tab': {
      border: `1px solid ${neutralBorder}`,
      borderRadius: '8px',
      padding: '12px',
      transition: 'border-color 0.2s ease',
    },
    '.Tab:hover': {
      borderColor: accentColor,
    },
    '.Tab--selected': {
      borderColor: accentColor,
      boxShadow: 'none',
    },
    '.TabLabel': {
      color: accentColor,
    },
    '.Input': {
      color: accentColor,
      borderColor: neutralBorder,
    },
    '.Input:hover': {
      borderColor: accentColor,
    },
    '.Input--focused': {
      borderColor: accentColor,
      boxShadow: 'none',
    },
    '.Label': {
      color: accentColor,
    },
    '.AccordionTrigger': {
      color: accentColor,
    },
    '.AccordionTrigger:hover': {
      color: accentColor,
    },
    '.LinkButton': {
      color: accentColor,
    },
    '.LinkButton:hover': {
      color: accentColor,
    },
    '.BlockHeader': {
      color: accentColor,
    },
    '.BlockHeaderLink': {
      color: accentColor,
    },
    '.ActionButton': {
      color: accentColor,
    },
    '.ActionButton:hover': {
      color: accentColor,
    },
  },
};

const paymentElementOptions = {
  layout: 'tabs' as const,
};

type StripeFormProps = {
  clientSecret: string;
  onStatus: (status: string) => void;
  onError: (message: string | null) => void;
  ensurePendingOrder?: () => Promise<any> | null;
};

const StripeForm: React.FC<StripeFormProps> = ({
  clientSecret,
  onStatus,
  onError,
  ensurePendingOrder,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation('common');
  const [, setPaymentIntentId] = useAtom(stripePaymentIntentAtom);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }
    let isMounted = true;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error }) => {
      if (!isMounted) return;
      if (error) {
        onError(
          error.message ??
            t('text-stripe-confirm-error', {
              defaultValue: 'Unable to prepare Stripe payment.',
            })
        );
        return;
      }
      if (!paymentIntent) {
        return;
      }

      const status = paymentIntent.status ?? 'requires_payment_method';
      setPaymentIntentId(paymentIntent.id);

      if (status === 'requires_payment_method') {
        onStatus('idle');
      } else {
        onStatus(status);
      }

      if (
        ['succeeded', 'processing', 'requires_capture'].includes(status)
      ) {
        onError(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [clientSecret, onError, onStatus, setPaymentIntentId, stripe, t]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    onError(null);

    try {
      const pendingResult = ensurePendingOrder?.();
      if (isPromiseLike(pendingResult)) {
        await pendingResult;
      }
    } catch (pendingError) {
      setIsSubmitting(false);
      onError(
        t('text-stripe-intent-error', {
          defaultValue: 'Unable to prepare Stripe payment. Please retry.',
        })
      );
      return;
    }

    const apiBase = (process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? '').replace(/\/$/, '');
    const returnUrl = apiBase
      ? `${apiBase}/stripe/return?shop_url=${encodeURIComponent(window.location.origin)}`
      : `${window.location.origin}/checkout`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(
        error.message ??
          t('text-stripe-confirm-error', {
            defaultValue: 'Payment confirmation failed. Please try again.',
          })
      );
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent) {
      const status = paymentIntent.status ?? 'requires_payment_method';
      setPaymentIntentId(paymentIntent.id);
      onStatus(status);
      if (
        ['succeeded', 'processing', 'requires_capture'].includes(status)
      ) {
        onError(null);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PaymentElement options={paymentElementOptions} />
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!stripe || !elements}
        className="StripePay mt-2 ltr:ml-auto rtl:mr-auto"
      >
        {t('text-confirm')}
      </Button>
    </form>
  );
};

const StripePayment: React.FC = () => {
  const { t } = useTranslation('common');
  const settings = useSettings();
  const router = useRouter();
  const { items } = useCart();
  const [checkout] = useAtom(checkoutAtom);
  // Medusa's cart.complete() is the authoritative totals source; until the
  // native-Stripe path lands in Phase 3, we estimate from the local cart.
  const verifiedResponse: {
    total_tax?: number;
    shipping_charge?: number;
    unavailable_products?: any[];
  } | null = null;
  const discount = 0;
  const [paymentIntentId, setPaymentIntentId] = useAtom(stripePaymentIntentAtom);
  const [orderTrackingNumber, setOrderTrackingNumber] = useAtom(orderTrackingNumberAtom);
  const [, setOrderId] = useAtom(orderIdAtom);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const creationInFlight = useRef(false);
  const lastAmountRef = useRef<number | null>(null);
  const pendingOrderInFlight = useRef(false);
  const returnedFromStripe = useRef(false);
  const [redirectStatus, setRedirectStatus] = useState<string | null>(null);
  const trackedOrdersRef = useRef<Set<string>>(new Set());

  const { mutate: createIntent, isLoading: isCreatingIntent } =
    useCreateStripePaymentIntentMutation();
  const { mutate: createOrder } = useCreateOrderMutation();

  const availableItems = items;

  const baseAmount = useMemo(
    () => calculateTotal(availableItems ?? []),
    [availableItems]
  );

  const paidTotal = useMemo(() => {
    return calculatePaidTotal(
      {
        totalAmount: baseAmount,
        tax: verifiedResponse?.total_tax ?? 0,
        shipping_charge: verifiedResponse?.shipping_charge ?? 0,
      },
      Number(discount ?? 0)
    );
  }, [baseAmount, discount]);

  const currency = useMemo(() => {
    if (typeof settings?.currency === 'string') {
      return settings.currency;
    }
    if (typeof settings?.options?.currency === 'string') {
      return settings.options.currency;
    }
    return 'MYR';
  }, [settings]);

  const resetIntentState = useCallback(() => {
    setPaymentIntentId(null);
    setClientSecret(null);
    setStatusMessage(null);
    setOrderTrackingNumber(null);
    setOrderId(null);
  }, [setOrderId, setOrderTrackingNumber, setPaymentIntentId]);

  const emitPurchaseIfCompleted = useCallback(
    (order: any) => {
      if (!order) {
        return;
      }
      const trackingNumber = order?.tracking_number ?? order?.trackingNumber ?? order?.id;
      if (!trackingNumber) {
        return;
      }
      const slug = order?.status?.slug ?? order?.status;
      const normalized = typeof slug === 'string' ? slug.toLowerCase() : '';
      const isCompleted =
        normalized.includes('completed') ||
        normalized.includes('success') ||
        normalized.includes('paid');
      if (!isCompleted) {
        return;
      }
      if (trackedOrdersRef.current.has(trackingNumber)) {
        return;
      }
      trackedOrdersRef.current.add(trackingNumber);
      trackPurchase(order);
    },
    []
  );

  const prepareIntent = useCallback(() => {
    if (paidTotal <= 0 || creationInFlight.current) {
      return;
    }

    creationInFlight.current = true;
    setErrorMessage(null);

    createIntent(
      {
        amount: paidTotal,
        currency: currency?.toLowerCase(),
        metadata: {
          source: 'shop_checkout',
          customer_contact: checkout?.customer_contact ?? '',
        },
      },
      {
        onSuccess: (data) => {
          lastAmountRef.current = paidTotal;
          setClientSecret(data.client_secret);
          setPaymentIntentId(data.payment_intent_id);
          setStatusMessage(null);
          creationInFlight.current = false;
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ??
            error?.message ??
            t('text-stripe-intent-error', {
              defaultValue: 'Unable to create Stripe payment. Please retry.',
            });
          setErrorMessage(message);
          resetIntentState();
          creationInFlight.current = false;
        },
      }
    );
  }, [checkout?.customer_contact, createIntent, currency, paidTotal, resetIntentState, setPaymentIntentId, t]);

  const ensurePendingOrder = useCallback(async () => {
    if (checkout?.payment_gateway !== 'STRIPE') {
      return null;
    }
    if (!paymentIntentId || !availableItems?.length) {
      return null;
    }
    if (orderTrackingNumber && !pendingOrderInFlight.current) {
      return null;
    }
    if (pendingOrderInFlight.current) {
      return null;
    }
    if (!checkout?.customer_contact) {
      return null;
    }

    const input: any = buildOrderInput({
      availableItems: availableItems ?? [],
      subtotal: baseAmount,
      total: paidTotal,
      deliveryTimeTitle: checkout?.delivery_time?.title,
      deliveryDate: checkout?.delivery_date ?? null,
      customerContact: checkout?.customer_contact ?? '',
      paymentGateway: 'STRIPE',
      billingAddress: checkout?.billing_address?.address && checkout.billing_address.address,
      shippingAddress: checkout?.shipping_address?.address && checkout.shipping_address.address,
      messageCard: checkout?.messageCard ?? null,
      status: 2,
      paymentIntentId,
      extra: { payment_pending: true },
    });

    pendingOrderInFlight.current = true;

    return new Promise<any>((resolve, reject) => {
      createOrder(input, {
        onSuccess: (order: any) => {
          if (order?.tracking_number) {
            setOrderTrackingNumber(order.tracking_number);
            setOrderId(order?.id ?? null);
          }
          emitPurchaseIfCompleted(order);
          pendingOrderInFlight.current = false;
          resolve(order);
        },
        onError: (error: any) => {
          pendingOrderInFlight.current = false;
          reject(error);
        },
      });
    });
  }, [
    availableItems,
    baseAmount,
    checkout,
    createOrder,
    discount,
    orderTrackingNumber,
    paidTotal,
    paymentIntentId,
    setOrderId,
    setOrderTrackingNumber,
    verifiedResponse?.total_tax,
    verifiedResponse?.shipping_charge,
  ]);

  const handleStatusUpdate = useCallback(
    (status: string) => {
      switch (status) {
        case 'idle':
          setStatusMessage(null);
          setErrorMessage(null);
          break;
        case 'succeeded':
          setPaymentStatus('succeeded');
          setStatusMessage(
            t('text-stripe-payment-succeeded', {
              defaultValue: 'Payment confirmed. You can place your order now.',
            })
          );
          setErrorMessage(null);
          returnedFromStripe.current = false;
          break;
        case 'processing':
        case 'requires_capture':
          setPaymentStatus(status);
          setStatusMessage(
            t('text-stripe-payment-processing', {
              defaultValue: 'Payment is processing. We will confirm once it completes.',
            })
          );
          setErrorMessage(null);
          break;
        case 'requires_payment_method':
          setPaymentStatus(status);
          setStatusMessage(null);
          break;
        default:
          setPaymentStatus(status);
          break;
      }
    },
    [t]
  );

  const mapOrderStatusToPaymentStatus = useCallback(
    (statusSlug?: string | null) => {
      if (!statusSlug) {
        return;
      }
      const normalized = statusSlug.toLowerCase();
      if (normalized.includes('paid') || normalized.includes('completed') || normalized.includes('success')) {
        handleStatusUpdate('succeeded');
      } else if (normalized.includes('processing') || normalized.includes('pending')) {
        handleStatusUpdate('processing');
      } else if (normalized.includes('cancel') || normalized.includes('fail')) {
        handleStatusUpdate('requires_payment_method');
      }
    },
    [handleStatusUpdate]
  );

  useEffect(() => {
    if (checkout?.payment_gateway !== 'STRIPE') {
      setOrderTrackingNumber(null);
      setOrderId(null);
    }
  }, [checkout?.payment_gateway, setOrderId, setOrderTrackingNumber]);

  useEffect(() => {
    const secretFromQuery =
      typeof router.query.payment_intent_client_secret === 'string'
        ? router.query.payment_intent_client_secret
        : null;
    const intentFromQuery =
      typeof router.query.payment_intent === 'string'
        ? router.query.payment_intent
        : null;
    const redirectStatusFromQuery =
      typeof router.query.redirect_status === 'string'
        ? router.query.redirect_status
        : null;

    if (secretFromQuery) {
      setClientSecret(secretFromQuery);
    }
    if (intentFromQuery) {
      setPaymentIntentId(intentFromQuery);
      returnedFromStripe.current = true;
      fetchStripeOrderByIntent(intentFromQuery)
        .then((data) => {
          if (data?.tracking_number) {
            setOrderTrackingNumber(data.tracking_number);
            setOrderId(data?.id ?? null);
          }
          emitPurchaseIfCompleted(data);
          const statusSlug = data?.status?.slug ?? null;
          if (statusSlug) {
            mapOrderStatusToPaymentStatus(statusSlug);
          }
        })
        .catch(() => {});
    }
    if (redirectStatusFromQuery) {
      setRedirectStatus(redirectStatusFromQuery);
      returnedFromStripe.current = true;
    }
    if (secretFromQuery || intentFromQuery) {
      const {
        payment_intent,
        payment_intent_client_secret,
        redirect_status: _redirect_status,
        ...rest
      } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, {
        shallow: true,
      });
    }
  }, [mapOrderStatusToPaymentStatus, orderTrackingNumber, router, setOrderId, setOrderTrackingNumber, setPaymentIntentId]);

  useEffect(() => {
    if (paidTotal <= 0) {
      setErrorMessage(
        t('text-stripe-zero-amount', {
          defaultValue: 'Order total must be greater than zero for Stripe payments.',
        })
      );
      resetIntentState();
      lastAmountRef.current = null;
      return;
    }

    if (
      clientSecret &&
      lastAmountRef.current !== null &&
      Math.abs(lastAmountRef.current - paidTotal) < 0.5
    ) {
      return;
    }

    if (returnedFromStripe.current) {
      returnedFromStripe.current = false;
      return;
    }

    if (returnedFromStripe.current) {
      returnedFromStripe.current = false;
    } else {
      resetIntentState();
      prepareIntent();
    }
  }, [clientSecret, paidTotal, prepareIntent, resetIntentState, t]);

  useEffect(() => {
    if (!orderTrackingNumber) return;
    if (!paymentStatus) return;
    if (
      [
        'succeeded',
        'processing',
        'requires_capture',
        'requires_payment_method',
        'payment_failed',
        'canceled',
      ].includes(paymentStatus)
    ) {
      router.push(`/orders/${orderTrackingNumber}`);
    }
  }, [orderTrackingNumber, paymentStatus, router]);

  useEffect(() => {
    if (!redirectStatus) {
      return;
    }
    switch (redirectStatus) {
      case 'succeeded':
        handleStatusUpdate('succeeded');
        break;
      case 'processing':
        handleStatusUpdate('processing');
        break;
      case 'requires_payment_method':
      case 'failed':
      case 'canceled':
        handleStatusUpdate('requires_payment_method');
        setErrorMessage(
          t('text-stripe-requires-payment-method', {
            defaultValue: 'Payment method was declined. Please use a different option.',
          })
        );
        break;
      default:
        break;
    }
    setRedirectStatus(null);
  }, [redirectStatus, handleStatusUpdate, t]);

  return (
    <div className="flex flex-col gap-4">
      {errorMessage ? <ValidationError message={errorMessage} /> : null}
      {statusMessage ? (
        <p className="text-sm text-heading bg-green-50 border border-green-200 rounded px-3 py-2">
          {statusMessage}
        </p>
      ) : null}
      {isCreatingIntent && !clientSecret ? (
        <p className="text-sm text-body">
          {t('text-loading-stripe', {
            defaultValue: 'Preparing secure Stripe checkout...',
          })}
        </p>
      ) : null}
      {clientSecret ? (
        <Elements
          stripe={getStripe()}
          options={{ clientSecret, appearance }}
        >
          <StripeForm
            clientSecret={clientSecret}
            onStatus={handleStatusUpdate}
            onError={setErrorMessage}
            ensurePendingOrder={ensurePendingOrder}
          />
        </Elements>
      ) : null}
      {!clientSecret && !isCreatingIntent && !errorMessage ? (
        <p className="text-sm text-body">
          {t('text-stripe-preparing', {
            defaultValue: 'Stripe payment element will appear once totals are ready.',
          })}
        </p>
      ) : null}
      {paymentIntentId ? (
        <p className="text-xs text-gray-500">
          {t('text-stripe-reference', {
            defaultValue: 'Stripe reference:',
          })}{' '}
          {paymentIntentId}
        </p>
      ) : null}
    </div>
  );
};

export default StripePayment;
