"use client";

import Container from "@components/ui/container";
import { useTranslation } from "next-i18next";
import { Image } from "@components/ui/image";

interface CopyrightProps {
  // Pre-rendered copyright string from the server — token-replaced
  // template `copyright_text` in site-config. Empty falls back to a
  // sane default so the strip never collapses.
  text?: string;
  payment?: {
    id: string | number;
    path?: string;
    name: string;
    image: string;
    width: number;
    height: number;
  }[];
}
const Copyright: React.FC<CopyrightProps> = ({ text, payment }) => {
  const { t } = useTranslation("footer");
  const displayed =
    text && text.trim() ? text : `© ${new Date().getFullYear()}`;
  return (
    <div className="border-t border-gray-300 pt-5 pb-16 sm:pb-20 md:pb-5 mb-2 sm:mb-0">
      <Container className="flex flex-col-reverse md:flex-row text-center md:justify-between">
        <p className="text-body text-xs md:text-[13px] lg:text-sm leading-6">
          {displayed}
        </p>

        {payment && (
          <ul className="hidden md:flex flex-wrap justify-center items-center space-x-4 xs:space-x-5 lg:space-x-7 rtl:space-x-reverse mb-1 md:mb-0 mx-auto md:mx-0">
            {payment?.map((item) => (
              <li
                className="mb-2 md:mb-0 transition hover:opacity-80"
                key={`payment-list--key${item.id}`}
              >
                <Image
                  src={item.image}
                  alt={t(`${item.name}`)}
                  height={item.height}
                  width={item.width}
                  layout="intrinsic"
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
};

export default Copyright;
