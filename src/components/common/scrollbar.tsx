"use client";

import cn from "classnames";
import { useEffect, useState, type FC, type ReactNode, type CSSProperties } from "react";

type ScrollbarProps = {
  options?: any;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

/**
 * overlayscrollbars-react@0.2.2 + overlayscrollbars@1.13.1 both access
 * `document` at module import time, which crashes App Router's SSR pass even
 * when the file is marked "use client". Mount the actual component via a
 * post-hydration `require()` so the package never loads on the server at all.
 * While SSR / pre-hydration, we render a plain div — scrollbars come online
 * once React attaches.
 */
const Scrollbar: FC<ScrollbarProps> = ({
  options,
  children,
  style,
  className,
  ...props
}) => {
  const [Component, setComponent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod: any = await import("overlayscrollbars-react");
      await import("overlayscrollbars/css/OverlayScrollbars.css");
      if (mounted) {
        setComponent(() => mod.OverlayScrollbarsComponent);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!Component) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <Component
      options={{
        className: cn("os-theme-thin", className),
        scrollbars: {
          autoHide: "scroll",
        },
        ...options,
      }}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Scrollbar;
