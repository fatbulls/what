"use client";

import { useEffect, useState } from "react";
import Widgets from "./widgets";
import Copyright from "./copyright";
import { footer } from "./data";
import { sdk } from "@lib/medusa";
import { useSiteMenu } from "@lib/use-site-menu";

// Footer is rendered inside the CSR-bail Shell, so it must hydrate on
// the client. Pulls the admin-managed footer menu (menu_key="footer")
// + site-config copyright settings via the same Medusa SDK the rest of
// the storefront uses; falls back to the bundled static `footer` data
// when those endpoints return empty (fresh DB or admin not yet
// configured).
const Footer: React.FC = () => {
  const liveMenu = useSiteMenu("footer", []);
  const [cfg, setCfg] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    sdk.client
      .fetch<{ config: Record<string, string> }>("/store/site-config")
      .then((res) => {
        if (!cancelled) setCfg(res.config ?? {});
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Adapt the menu tree → footer widgets shape. Top-level rows = widget
  // titles; children = link list.
  const liveWidgets = liveMenu.map((top, idx) => ({
    id: `live-${idx}`,
    widgetTitle: top.label,
    lists: (top.children ?? []).map((child, j) => ({
      id: `${top.id}-${j}`,
      title: child.label,
      path: child.href ?? "#!",
    })),
  }));

  const widgets =
    liveWidgets.length > 0 ? liveWidgets : (footer.widgets as any[]);

  // Token-replaced copyright string. Falls back to a sane default until
  // /store/site-config resolves.
  const template =
    cfg.copyright_text ||
    "© {year} {site_name} {ssm}. All rights reserved.";
  const showPayments = (cfg.copyright_show_payments ?? "1") !== "0";
  const copyrightText = template
    .replace(/\{year\}/g, String(new Date().getFullYear()))
    .replace(/\{site_name\}/g, cfg.site_name ?? "Storefront")
    .replace(/\{ssm\}/g, cfg.ssm_number ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <footer className="mt-9 md:mt-11 lg:mt-16 3xl:mt-20 pt-2.5 lg:pt-0 2xl:pt-2">
      <Widgets widgets={widgets} liveTitles={liveWidgets.length > 0} />
      <Copyright
        text={copyrightText}
        payment={showPayments ? footer.payment : undefined}
      />
    </footer>
  );
};

export default Footer;
