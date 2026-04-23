"use client";

import AccountLayout from "@components/my-account/account-layout";
import ProfileEmailAddress from "@components/profile/profile-email-address";
import useUser from "@framework/auth/use-user";
import { Seo } from "@components/seo";


export default function ChangeEmailAddress() {
  const { me } = useUser();
  const description =
    "Add or update the email tied to your Because You Florist account for notifications and password access.";

  return (
    <>
      <Seo
        pageName="Email Address"
        title="Update Email Address"
        description={description}
        canonicalPath="/my-account/email"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "My Account", item: "/my-account" },
          { name: "Email Address", item: "/my-account/email" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "Update Email Address",
            description,
          },
        }}
        noIndex
      />
      <AccountLayout>
        {me?.id ? (
          <ProfileEmailAddress userId={me.id} email={me?.email} />
        ) : null}
      </AccountLayout>
    </>
  );
}

ChangeEmailAddress.authenticate = true;
