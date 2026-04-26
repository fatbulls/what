import { formatOrderedProduct } from '@lib/format-ordered-product';
import { Item } from '@store/quick-cart/cart.utils';

interface BuildOrderInputProps {
  availableItems: Item[];
  subtotal: number;
  total: number;
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
    paid_total: total,
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

  delete (input.billing_address as any).__typename;
  delete (input.shipping_address as any).__typename;

  return input;
};
