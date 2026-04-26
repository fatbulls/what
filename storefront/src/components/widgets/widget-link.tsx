"use client";

import type { FC } from "react";
import Link from "@components/ui/link";
import { useTranslation } from "next-i18next";
import { useSettings } from "@contexts/settings.context";
import { useAtom } from "jotai";
import { authorizationAtom } from "@store/authorization-atom";
import { useUI } from "@contexts/ui.context";

// Sentinel paths in footer/data.tsx that get rewritten at render time
// from runtime state (admin site-config, auth state, modal context).
// Avoids each list entry needing its own click handler when only the
// behavior or URL is data-driven.
const WHATSAPP_SENTINEL = "__WHATSAPP_URL__";
const MY_ACCOUNT_SENTINEL = "__MY_ACCOUNT_LINK__";
const FORGET_PASSWORD_SENTINEL = "__OPEN_FORGET_PASSWORD__";

interface Props {
  className?: string;
  data: {
    widgetTitle?: string;
    lists: {
      id: string;
      path?: string;
      title: string;
      icon?: any;
    }[];
  };
}

const WidgetLink: FC<Props> = ({ className, data }) => {
  const { widgetTitle, lists } = data;
  const { t } = useTranslation("footer");
  const settings = useSettings();
  const whatsappUrl = (settings as any)?.whatsappUrl as string | undefined;
  const [isAuthorized] = useAtom(authorizationAtom);
  const { setModalView, openModal } = useUI();

  function openLogin() {
    setModalView("LOGIN_VIEW");
    openModal();
  }
  function openForgetPassword() {
    setModalView("FORGET_PASSWORD");
    openModal();
  }

  return (
    <div className={`${className}`}>
      <h4 className="text-heading text-sm md:text-base xl:text-lg font-semibold mb-5 2xl:mb-6 3xl:mb-7">
        {t(`${widgetTitle}`)}
      </h4>
      <ul className="text-xs md:text-[13px] lg:text-sm text-body flex flex-col space-y-3 lg:space-y-3.5">
        {lists.map((list) => {
          const linkClass =
            "transition-colors duration-200 hover:text-black";
          const label = t(`${list.title}`);
          const iconNode = list.icon ? (
            <span className="ltr:mr-3 rtl:ml-3 relative top-0.5 lg:top-1 text-sm lg:text-base">
              {list.icon}
            </span>
          ) : null;

          // Behavior sentinels — render as <button> driving a modal /
          // auth-aware navigation instead of a static <Link>.
          if (list.path === MY_ACCOUNT_SENTINEL) {
            const node = isAuthorized ? (
              <Link href="/my-account" className={linkClass}>
                {label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className={`${linkClass} text-left`}
              >
                {label}
              </button>
            );
            return (
              <li
                key={`widget-list--key${list.id}`}
                className="flex items-baseline"
              >
                {iconNode}
                {node}
              </li>
            );
          }
          if (list.path === FORGET_PASSWORD_SENTINEL) {
            return (
              <li
                key={`widget-list--key${list.id}`}
                className="flex items-baseline"
              >
                {iconNode}
                <button
                  type="button"
                  onClick={openForgetPassword}
                  className={`${linkClass} text-left`}
                >
                  {label}
                </button>
              </li>
            );
          }

          // URL sentinels — substitute the path, then fall through to
          // the standard Link/<a> render below.
          let path = list.path ?? "#!";
          if (path === WHATSAPP_SENTINEL) {
            path = whatsappUrl || "/contact-us";
          }

          const isExternal = /^https?:\/\//i.test(path);
          const isDownloadable = /\.(xml|pdf|txt|json)$/i.test(path);
          const shouldUseNextLink =
            !isExternal && !isDownloadable && !path.startsWith("javascript:");

          return (
            <li
              key={`widget-list--key${list.id}`}
              className="flex items-baseline"
            >
              {iconNode}
              {shouldUseNextLink ? (
                <Link href={path} prefetch={false} className={linkClass}>
                  {label}
                </Link>
              ) : (
                <a
                  href={path}
                  className={linkClass}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default WidgetLink;
