"use client";

import Container from "@components/ui/container";
import SignUpForm from "@components/auth/sign-up-form";
import PageHeader from "@components/ui/page-header";
import Subscription from "@components/common/subscription";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { authorizationAtom } from "@store/authorization-atom";
import { useEffect } from "react";
import { ROUTES } from "@lib/routes";
import PageLoader from "@components/ui/page-loader/page-loader";
import { Seo } from "@components/seo";


export default function SignUpPage() {
  const router = useRouter();
  const [isAuthorized] = useAtom(authorizationAtom);
  const description =
    "Create your Because You Florist account for seamless checkout, saved addresses, and member rewards.";

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
        pageName="Register"
        title="Register"
        description={description}
        canonicalPath="/signup"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Register", item: "/signup" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "Register",
            description,
          },
        }}
      />
      <PageHeader pageHeader="Register" />
      <Container>
        <div className="py-16 lg:py-20">
          <SignUpForm layout="page" />
        </div>
        <Subscription />
      </Container>
    </>
  );
}

