"use client";

import Container from "@components/ui/container";
import Subscription from "@components/common/subscription";
import PageHeader from "@components/ui/page-header";
import { useRouter } from "next/router";
import { ROUTES } from "@lib/routes";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { authorizationAtom } from "@store/authorization-atom";
import PageLoader from "@components/ui/page-loader/page-loader";
import OtpLogin from "@components/auth/otp/otp-login";
import { Seo } from "@components/seo";


export default function OtpLoginPage() {
  const router = useRouter();
  const [isAuthorized] = useAtom(authorizationAtom);
  const description =
    "Sign in to Because You Florist quickly and securely using a one-time password sent to your phone.";

  useEffect(() => {
    (async () => {
      if (isAuthorized) {
        return router.push(ROUTES.ACCOUNT);
      }
    })();
  }, [isAuthorized]);

  if (isAuthorized) return <PageLoader />;

  return (
    <>
      <Seo
        pageName="OTP Login"
        title="OTP Login"
        description={description}
        canonicalPath="/otp-login"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "OTP Login", item: "/otp-login" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "OTP Login",
            description,
          },
        }}
      />
      <PageHeader pageHeader="OTP Login" />
      <Container>
        <div className="py-16 lg:py-20">
          <OtpLogin layout="page" />
        </div>
        <Subscription />
      </Container>
    </>
  );
}

