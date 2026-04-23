"use client";

import { useEffect } from "react";
import { signOut as socialLoginSignOut } from "next-auth/client";
import Cookies from "js-cookie";
import { AUTH_TOKEN } from "@lib/constants";
import { useLogoutMutation } from "@framework/auth/auth.query";
import { useAtom } from "jotai";
import { authorizationAtom } from "@store/authorization-atom";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import PageLoader from "@components/ui/page-loader/page-loader";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { clearCheckoutAtom } from "@store/checkout";
import { Seo } from "@components/seo";

const Logout = () => {
  const { mutate } = useLogoutMutation();
  const { pathname, ...router } = useRouter();
  const [, authorize] = useAtom(authorizationAtom);
  const [, resetCheckout] = useAtom(clearCheckoutAtom);
  const description = "Signing out from Because You Florist.";

  useEffect(() => {
    (async () => {
      resetCheckout();
      await socialLoginSignOut({ redirect: false });
      mutate(undefined, {
        onSuccess: () => {
          Cookies.remove(AUTH_TOKEN);
          authorize(false);
          router.push("/");
        },
      });
    })();
  }, []);

  return (
    <>
      <Seo
        pageName="Logout"
        title="Logging out"
        description={description}
        canonicalPath={pathname ?? "/logout"}
        noIndex
        schema={{
          type: "webPage",
          data: {
            title: "Logging out",
            description,
          },
        }}
      />
      <PageLoader />
    </>
  );
};

export default Logout;

