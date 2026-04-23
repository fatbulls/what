"use client";

import AccountLayout from "@components/my-account/account-layout";
import ErrorMessage from "@components/ui/error-message";
import Spinner from "@components/ui/loaders/spinner/spinner";
import AccountAddress from "@components/my-account/account-address";
import useUser from "@framework/auth/use-user";
import { useTranslation } from "next-i18next";
import { Seo } from "@components/seo";


export default function AccountDetailsPage() {
  const { me, loading, error } = useUser();
  const { t } = useTranslation();
  const description =
    "Manage your saved delivery and billing addresses for seamless Because You Florist checkouts.";

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Seo
        pageName="Account Address"
        title="Manage Addresses"
        description={description}
        canonicalPath="/my-account/address"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "My Account", item: "/my-account" },
          { name: "Addresses", item: "/my-account/address" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "Manage Addresses",
            description,
          },
        }}
        noIndex
      />
      <AccountLayout>
        {loading ? (
          <Spinner showText={false} />
        ) : (
          <AccountAddress
            addresses={me.address}
            userId={me.id}
            label={t("text-account-address")}
          />
        )}
      </AccountLayout>
    </>
  );
}

AccountDetailsPage.authenticate = true;
