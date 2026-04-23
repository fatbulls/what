import type { FC } from "react";
import { useTranslation } from "next-i18next";
import dayjs from "dayjs";
import Badge from "@components/ui/badge";
import { formatString } from "@lib/format-string";
import usePrice from "@lib/use-price";
import Link from "@components/ui/link";
import { ROUTES } from "@lib/routes";
interface SuborderItemsProps {
  items: any;
}

const SuborderItems: FC<SuborderItemsProps> = ({ items }) => {
  const { t } = useTranslation("common");

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="subOrderTable w-full text-center text-sm text-body">
        {t("table:empty-table-data")}
      </div>
    );
  }

  return (
    <div className="subOrderTable w-full overflow-x-auto">
      <table className="min-w-[680px] w-full">
        <thead>
          <tr className="text-left text-sm font-semibold text-heading">
            <th className="py-3 pr-4">{t("text-tracking-number")}</th>
            <th className="py-3 pr-4">{t("text-date")}</th>
            <th className="py-3 pr-4">{t("text-status")}</th>
            <th className="py-3 pr-4">{t("text-item")}</th>
            <th className="py-3 pr-4">{t("text-total-price")}</th>
            <th className="py-3 pl-4 text-center" />
          </tr>
        </thead>
        <tbody>
          {items.map((item: any) => (
            <SuborderRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuborderItems;

const SuborderRow: FC<{ item: any }> = ({ item }) => {
  const { t } = useTranslation("common");
  const { price: totalPrice } = usePrice({ amount: item?.paid_total });

  return (
    <tr className="border-b border-gray-100 last:border-b-0 text-sm text-body">
      <td className="py-4 pr-4 font-semibold text-heading">{item?.tracking_number}</td>
      <td className="py-4 pr-4">{dayjs(item?.date ?? item?.created_at).format("MMMM D, YYYY")}</td>
      <td className="py-4 pr-4">
        <Badge text={item?.status?.name} className="font-semibold text-white" />
      </td>
      <td className="py-4 pr-4">{formatString(item?.products?.length, t("text-item"))}</td>
      <td className="py-4 pr-4 font-medium text-heading">{totalPrice}</td>
      <td className="py-4 pl-4 text-center">
        <Link
          href={`${ROUTES.ORDERS}/${item?.tracking_number}`}
          className="inline-flex items-center justify-center text-heading font-semibold underline hover:no-underline"
        >
          {t("text-view")}
        </Link>
      </td>
    </tr>
  );
};
