"use client";

import { useTranslation } from "next-i18next";
import { useAtom } from "jotai";
import { ROUTES } from "@lib/routes";
import Link from "@components/ui/link";
import Input from "@components/ui/input";
import { checkoutEmailAtom } from "@store/checkout";

interface Props {
  count: number;
  className?: string;
  me?: { email?: string } | null;
}

// Section 1 of the consolidated checkout. Signed-in users see a pill with
// their email + a link to switch accounts; guests see a single email input.
// The old multi-field contact-grid (phone + OTP modal) is gone — phone is
// now collected on the delivery address.
const ContactBlock: React.FC<Props> = ({ count, className, me }) => {
  const { t } = useTranslation("common");
  const [email, setEmail] = useAtom(checkoutEmailAtom);

  const signedIn = Boolean(me?.email);

  return (
    <div className={className}>
      <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <span>{count}.</span>
        <span>{t("text-contact", { defaultValue: "Contact" })}</span>
      </div>

      {signedIn ? (
        <div className="flex items-center justify-between flex-wrap gap-3 rounded-md border border-gray-100 bg-gray-50 px-4 py-3">
          <span className="text-sm text-heading font-medium">
            {t("text-signed-in-as", { defaultValue: "Signed in as" })}{" "}
            <span className="font-semibold">{me?.email}</span>
          </span>
          <Link
            href={ROUTES.LOGOUT}
            className="text-sm text-accent underline hover:no-underline"
          >
            {t("text-use-different-email", {
              defaultValue: "Use a different email",
            })}
          </Link>
        </div>
      ) : (
        <Input
          labelKey={t("forms:label-email") || "Email address"}
          name="email"
          type="email"
          inputClassName="bg-white"
          placeholder="you@example.com"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
        />
      )}
    </div>
  );
};

export default ContactBlock;
