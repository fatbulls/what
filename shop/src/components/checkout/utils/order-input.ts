import { formatOrderedProduct } from '@lib/format-ordered-product';
import { Item } from '@store/quick-cart/cart.utils';

interface BuildOrderInputProps {
  availableItems: Item[];
  subtotal: number;
  total: number;
  verifiedTotalTax?: number;
  verifiedShipping?: number;
  couponId?: number | null;
  discount?: number | null;
  deliveryTimeTitle?: string;
  deliveryDate?: string | null;
  customerContact: string;
  paymentGateway: string;
  billingAddress?: any;
  shippingAddress?: any;
  messageCard?: string | null;
  status?: number | string;
  paymentIntentId?: string | null;
  extra?: Record<string, unknown>;
}

export const buildOrderInput = ({
  availableItems,
  subtotal,
  total,
  verifiedTotalTax,
  verifiedShipping,
  couponId,
  discount,
  deliveryTimeTitle,
  deliveryDate,
  customerContact,
  paymentGateway,
  billingAddress,
  shippingAddress,
  messageCard,
  status,
  paymentIntentId,
  extra,
}: BuildOrderInputProps) => {
  const input: Record<string, unknown> = {
    //@ts-ignore
    products: availableItems?.map((item) => formatOrderedProduct(item)),
    status,
    amount: subtotal,
    coupon_id: couponId ? Number(couponId) : undefined,
    discount: discount ?? 0,
    paid_total: total,
    sales_tax: verifiedTotalTax,
    delivery_fee: verifiedShipping,
    total,
    delivery_time: deliveryTimeTitle,
    delivery_date: deliveryDate,
    customer_contact: customerContact,
    payment_gateway: paymentGateway,
    billing_address: billingAddress ? { ...billingAddress } : {},
    shipping_address: shippingAddress ? { ...shippingAddress } : {},
    messageCard,
  };

  if (paymentIntentId) {
    input.payment_intent_id = paymentIntentId;
  }

  if (extra) {
    Object.assign(input, extra);
  }

  delete input.billing_address.__typename;
  delete input.shipping_address.__typename;

  return input;
};
