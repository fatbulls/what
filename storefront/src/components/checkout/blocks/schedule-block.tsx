"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { DatePicker } from "antd";
import { RadioGroup } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import cn from "classnames";
import { useSettings } from "@contexts/settings.context";
import { deliveryDateAtom, deliveryTimeAtom } from "@store/checkout";

interface Props {
  count: number;
  className?: string;
}

// Separate section 3 card. Only Same Day Delivery surfaces a date + time
// picker — Standard / Scheduled just pick the tier and move on. If you
// later want date selection for Scheduled, flip the `showPicker` condition.
const ScheduleBlock: React.FC<Props> = ({ count, className }) => {
  const { t } = useTranslation("common");
  const { deliveryTime: schedules } = useSettings();
  const [date, setDate] = useAtom(deliveryDateAtom);
  const [selected, setSelected] = useAtom(deliveryTimeAtom);

  // Default to first tier on mount.
  useEffect(() => {
    if (!selected && schedules?.[0]) setSelected(schedules[0]);
  }, [schedules, selected, setSelected]);

  const isSameDay = /same[\s-]?day/i.test(selected?.title ?? "");

  // Same-day = today. Lock the date picker to the current day so the driver
  // routing is unambiguous.
  const disabledDate = (current: any) => {
    if (!current) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return current.valueOf() < today.valueOf() || current.valueOf() > end.valueOf();
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <span>{count}.</span>
        <span>
          {t("text-delivery-schedule", { defaultValue: "Delivery Schedule" })}
        </span>
      </div>

      <RadioGroup value={selected} onChange={setSelected}>
        <RadioGroup.Label className="sr-only">
          {t("text-delivery-schedule")}
        </RadioGroup.Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {schedules?.map((s: any) => (
            <RadioGroup.Option key={s.id} value={s}>
              {({ checked }) => (
                <div
                  className={cn(
                    "w-full h-full p-4 rounded border cursor-pointer",
                    checked
                      ? "border-gray-600 bg-white shadow-600"
                      : "border-gray-200 bg-white hover:border-gray-300",
                  )}
                >
                  <div className="text-sm font-semibold text-heading">
                    {s.title}
                  </div>
                  {s.description ? (
                    <div className="text-xs text-body mt-1">
                      {s.description}
                    </div>
                  ) : null}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {isSameDay && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <label className="block text-sm font-semibold text-heading mb-2">
            {t("text-delivery-date", { defaultValue: "Delivery date" })}
          </label>
          <DatePicker
            className="state-select w-full h-10"
            disabledDate={disabledDate}
            placeholder={t("forms:label-delivery-date") || "Today"}
            value={date ? (undefined as any) : undefined}
            onChange={(_d: any, ds: string) => setDate(ds || null)}
          />
          <p className="text-xs text-body mt-2">
            {t("text-same-day-cutoff", {
              defaultValue:
                "Order before 2:00 PM for same-day delivery. After 2:00 PM we deliver the next business day.",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleBlock;
