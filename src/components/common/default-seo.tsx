import { DefaultSeo as NextDefaultSeo } from "next-seo";
import { useSettings } from "@contexts/settings.context";

const DefaultSeo = () => {
  const settings = useSettings();
  const siteTitle = settings?.siteTitle || "Because You Florist";

  return (
    <NextDefaultSeo
      defaultTitle={settings?.seo?.metaTitle || siteTitle}
      titleTemplate={`%s | ${siteTitle}`}
      additionalMetaTags={[
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1 maximum-scale=1",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "theme-color",
          content: "#ffffff",
        },
      ]}
      additionalLinkTags={[
        {
          rel: "apple-touch-icon",
          href: "icons/apple-icon-180.png",
        },
        {
          rel: "manifest",
          href: "/manifest.json",
        },
      ]}
    />
  );
};

export default DefaultSeo;
