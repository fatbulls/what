"use client";

import Container from "@components/ui/container";
import BlogBanner from "@components/blog/blog-banner";
import BlogList from "@components/blog/blog-list";
import { useBlogsQuery } from "@framework/blog/blog.query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Seo } from "@components/seo";
import { siteSettings } from "@settings/site.settings";
import { useSettings } from "@contexts/settings.context";
export default function BlogPage() {
  const { data } = useBlogsQuery();
  const settings = useSettings();
  const baseDescription =
    "Latest floral inspiration, gifting tips, and Because You Florist updates.";
  return (
    <>
      <Seo
        pageName="Blog"
        title="Our Blog"
        description={baseDescription}
        canonicalPath="/blog"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Blog", item: "/blog" },
        ]}
        schema={{
          type: "webPage",
          data: {
            title: "Our Blog",
            description: baseDescription,
            image: siteSettings?.logo?.url ?? settings?.logo?.original,
          },
        }}
      />
      <BlogBanner />
      <Container>
        <BlogList blogs={data?.blogs} />
      </Container>
    </>
  );
}

