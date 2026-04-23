"use client";

import AccountLayout from "@components/my-account/account-layout";
import ProfileContactNumber from "@components/profile/profile-contact-number";
import useUser from "@framework/auth/use-user";
import { Seo } from "@components/seo";


export default function ChangeContactNumber() {
  const { me } = useUser();
  const description =
    "Manage the phone numbers tied to your Because You Florist account for order updates.";

  return (
    <>
      <Seo
        pageName="Contact Number"
        title="Update Contact Number"
        description={description}
        canonicalPath="/my-account/contact-number"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "My Account", item: "/my-account" },
          { name: "Contact Number", item: "/my-account/contact-number" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "Update Contact Number",
            description,
          },
        }}
        noIndex
      />
      <AccountLayout>
        <ProfileContactNumber userId={me?.id!} profileId={me?.profile?.id!} contact={me?.profile?.contact!}/>
      </AccountLayout>
    </>
  );
}

ChangeContactNumber.authenticate = true;
