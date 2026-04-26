"use client";

import type { FC } from "react";
import { useSettings } from "@contexts/settings.context";
import Link from "@components/ui/link";
import { useTranslation } from "next-i18next";
import { ROUTES } from "@lib/routes";

const WidgetContact: FC = () => {
  const { t } = useTranslation();
  const settings = useSettings();

  const contactDetails = settings?.contactDetails;

  return (
    <div>
      <h4 className="text-heading text-sm md:text-base xl:text-lg font-semibold mb-5 2xl:mb-6 3xl:mb-7">
        {t(`text-contact`)}
      </h4>
      <ul className="text-xs md:text-[13px] lg:text-sm text-body flex flex-col space-y-3 lg:space-y-3.5">
        {ROUTES?.CONTACT && (
          <li className="flex items-baseline">
            <Link
              href={ROUTES.CONTACT}
              className="transition-colors duration-200 hover:text-black"
            >
              {t(`text-page-contact-us`)}
            </Link>
          </li>
        )}

        {contactDetails?.email && (
          <li className="flex items-baseline">
            <a
              href="mailto:support@becauseyou.com.my"
              className="transition-colors duration-200 hover:text-black truncate"
            >
              {t("text-email")}
            </a>
          </li>
        )}

        {/*contactDetails?.website && (
          <li className="flex items-baseline">
            <Link href={contactDetails.website}>
              <a className="transition-colors duration-200 hover:text-black truncate">
                  {t("text-website")}
              </a>
            </Link>
          </li>
        )*/}

        {/*
          <li className="flex items-baseline">
            <Link href="https://api.whatsapp.com/send/?phone=601155508866">
              <a className="transition-colors duration-200 hover:text-black truncate">
                  Whatsapp
              </a>
            </Link>
          </li>
        */}


      </ul>
    </div>
  );
};

export default WidgetContact;
