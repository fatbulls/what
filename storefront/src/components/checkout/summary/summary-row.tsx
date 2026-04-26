"use client";

import cn from "classnames";

interface Props {
  label: string;
  value: React.ReactNode;
  emphasized?: boolean;
  muted?: boolean;
}

const SummaryRow: React.FC<Props> = ({
  label,
  value,
  emphasized = false,
  muted = false,
}) => (
  <div
    className={cn(
      "flex justify-between py-3",
      emphasized
        ? "border-t-4 border-double border-gray-100 pt-4 text-base font-semibold text-heading"
        : "text-sm text-body",
    )}
  >
    <span className={cn(muted && "text-body")}>{label}</span>
    <span
      className={cn(
        emphasized ? "text-base font-semibold text-heading" : "text-heading",
      )}
    >
      {value}
    </span>
  </div>
);

export default SummaryRow;
