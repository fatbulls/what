import { ILFlag } from "@components/icons/ILFlag";
import { SAFlag } from "@components/icons/SAFlag";
import { CNFlag } from "@components/icons/CNFlag";
import { USFlag } from "@components/icons/USFlag";
import { DEFlag } from "@components/icons/DEFlag";
import { ESFlag } from "@components/icons/ESFlag";

export const siteSettings = {
  name: "BecauseYou Florist",
  description:
    "Because You is an online florist located in Klang Valley and Kuala Lumpur. We provide same day delivery florist service to a vast part of Klang Valley areas",
  author: {
    name: "BECAUSE SDN. BHD.",
    websiteUrl: "https://becauseyou.com.my",
    address: "",
  },
  logo: {
    url: "/assets/images/logo.svg",
    alt: "BecauseYou Florist",
    href: "/",
    width: 95,
    height: 30,
  },
  // Admin-editable via site-config `social_whatsapp`; this default is a
  // placeholder fallback so nothing hard-codes the old florist's number.
  chatButtonUrl: "",
  defaultLanguage: "en",
  currency: "MYR",
  site_header: {
    languageMenu: [
      // {
      //   id: "ar",
      //   name: "عربى - AR",
      //   value: "ar",
      //   icon: <SAFlag width="20px" height="15px"/>,
      // },
      {
        id: "zh",
        name: "中文 - ZH",
        value: "zh",
        icon: <CNFlag width="20px" height="15px"/>,
      },
      {
        id: "en",
        name: "English - EN",
        value: "en",
        icon: <USFlag width="20px" height="15px"/>,
      },
      // {
      //   id: "de",
      //   name: "Deutsch - DE",
      //   value: "de",
      //   icon: <DEFlag width="20px" height="15px"/>,
      // },
      // {
      //   id: "he",
      //   name: "rעברית - HE",
      //   value: "he",
      //   icon: <ILFlag width="20px" height="15px"/>,
      // },
      // {
      //   id: "es",
      //   name: "Español - ES",
      //   value: "es",
      //   icon: <ESFlag width="20px" height="15px"/>,
      // },
    ],
  },
  product: {
    placeholderImage: (variant = "list") => {
      return `/assets/placeholder/products/product-${variant}.svg`;
    }
  },
  homePageBlocks: {
    flashSale: {
      slug: "flash-sale",
    },
    featuredProducts: {
      slug: "featured-products"
    },
    onSaleSettings: {
      slug: "season-pick",
    }
  }
};
