import type { HTMLAttributes } from "react";
import cn from "classnames";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "full" | "none";
}

const baseRounded: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const Skeleton = ({
  className,
  rounded = "md",
  ...divProps
}: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse bg-gray-200/80",
      baseRounded[rounded] ?? baseRounded.md,
      className
    )}
    {...divProps}
  />
);

export default Skeleton;
