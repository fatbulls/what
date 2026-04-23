import type { FC } from "react";
import usePrice from "@lib/use-price";
import { useTranslation } from "next-i18next";
import { Image } from "@components/ui/image";
import { productPlaceholder } from "@lib/placeholders";
import Link from "@components/ui/link";

interface OrderItemsProps {
  products: any[];
}

const OrderItemRow: FC<{ product: any }> = ({ product }) => {
  const { price: unitPrice } = usePrice({ amount: product?.pivot?.unit_price });
  const { price: lineTotal } = usePrice({ amount: product?.pivot?.subtotal });

  const variationTitle = product?.pivot?.variation_option_id
    ? product?.variation_options?.find(
        (vo: any) => vo?.id === product?.pivot?.variation_option_id
      )?.title
    : undefined;

  const name = variationTitle ? `${product.name} - ${variationTitle}` : product.name;
  const productUrl = `/products/${product.slug}`;

  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="px-0 py-4 align-top">
        <Link href={productUrl} className="flex items-center">
          <span className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
            <Image
              src={product.image?.thumbnail ?? productPlaceholder}
              alt={name}
              className="object-cover"
              fill
            />
          </span>
          <span className="ml-4 flex flex-col overflow-hidden">
            <span className="text-[15px] text-body truncate">
              {name}
              <span className="font-semibold text-heading"> x&nbsp;{product.unit}</span>
            </span>
            <span className="text-[15px] font-semibold text-accent">
              {unitPrice}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 text-center text-[15px] font-semibold text-heading">
        {product?.pivot?.order_quantity}
      </td>
      <td className="px-4 py-4 text-center text-[15px] font-semibold text-heading">
        {lineTotal}
      </td>
    </tr>
  );
};

export const OrderItems: FC<OrderItemsProps> = ({ products }) => {
  const { t } = useTranslation("common");

  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <div className="orderDetailsTable w-full overflow-x-auto">
      <table className="min-w-[540px] w-full">
        <thead>
          <tr className="text-left text-sm font-semibold text-heading">
            <th className="py-3 pr-4 ltr:pl-0 rtl:pr-0">{t("text-product")}</th>
            <th className="py-3 px-4 text-center">{t("text-quantity")}</th>
            <th className="py-3 px-4 text-center">{t("text-price")}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <OrderItemRow
              key={
                product.pivot?.variation_option_id
                  ? `variation-${product.pivot.variation_option_id}`
                  : `product-${product.id ?? product.created_at}`
              }
              product={product}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
