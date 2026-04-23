"use client";

import Container from "@components/ui/container";
import PageHeader from "@components/ui/page-header";
import Subscription from "@components/common/subscription";
import ForgetPasswordForm from "@components/auth/forget-password/forget-password";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { authorizationAtom } from "@store/authorization-atom";
import { useEffect } from "react";
import { ROUTES } from "@lib/routes";
import PageLoader from "@components/ui/page-loader/page-loader";
import { Seo } from "@components/seo";


export default function ForgetPasswordPage() {
  const router = useRouter();
  const [isAuthorized] = useAtom(authorizationAtom);
  const description =
    "Reset your Because You Florist account password securely and regain access to your orders.";

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
          pageName="Forgot Password"
          title="Forgot Password"
          description={description}
          canonicalPath="/forget-password"
          breadcrumbs={[
            { name: "Home", item: "/" },
            { name: "Forgot Password", item: "/forget-password" },
          ]}
          schema={{
            type: "webPage",
            data: {
              title: "Forgot Password",
              description,
            },
          }}
      />
      <PageHeader pageHeader="Forget Password" />
      <Container>
        <div className="py-16 lg:py-20">
          <ForgetPasswordForm layout="page" />
        </div>
        <Subscription />
      </Container>
    </>
  );
}

