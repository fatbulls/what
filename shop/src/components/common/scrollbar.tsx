"use client";

import cn from "classnames";
import type { FC, ReactNode, CSSProperties } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

type ScrollbarProps = {
  options?: any;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

const Scrollbar: FC<ScrollbarProps> = ({
  options,
  children,
  style,
  className,
  ...props
}) => {
  return (
    <OverlayScrollbarsComponent
      options={{
        className: cn("os-theme-thin", className),
        scrollbars: {
          autoHide: "scroll",
        },
        ...options,
      }}
      style={style}
      defer
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default Scrollbar;
