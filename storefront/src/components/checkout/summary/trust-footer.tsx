"use client";

import { useSiteConfig, getConfigValue } from "@lib/use-site-config";

// Small trust strip under the Place Order button. Copy is driven entirely by
// site-config so admins can tweak without a redeploy.
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 1a4 4 0 00-4 4v3H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 7V5a2 2 0 10-4 0v3h4z"
      clipRule="evenodd"
    />
  </svg>
);

const TrustFooter: React.FC = () => {
  const cfg = useSiteConfig();
  const ssm = getConfigValue(cfg, "ssm_number");
  const pill = getConfigValue(cfg, "checkout_delivery_pill", "");

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-xs text-body">
        <LockIcon />
        <span>
          Secured by Stripe
          {ssm ? ` · SSM ${ssm}` : ""}
        </span>
      </div>
      {pill ? (
        <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-heading">
          {pill}
        </div>
      ) : null}
    </div>
  );
};

export default TrustFooter;
