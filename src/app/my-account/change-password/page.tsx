"use client";

import AccountLayout from "@components/my-account/account-layout";
import ChangePassword from "@components/my-account/change-password";
import { Seo } from "@components/seo";


export default function ChangePasswordPage() {
  const description =
    "Update the password for your Because You Florist account to keep orders secure.";
  return (
    <>
      <Seo
        pageName="Change Password"
        title="Change Password"
        description={description}
        canonicalPath="/my-account/change-password"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "My Account", item: "/my-account" },
          { name: "Change Password", item: "/my-account/change-password" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "Change Password",
            description,
          },
        }}
        noIndex
      />
      <AccountLayout>
        <ChangePassword />
      </AccountLayout>
    </>
  );
}

ChangePasswordPage.authenticate = true;
