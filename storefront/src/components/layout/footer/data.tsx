export const footer = {
  widgets: [
    {
      id: 3,
      widgetTitle: "widget-title-quick-links",
      lists: [
        {
          id: 1,
          title: "link-flower-shop-kuala-lumpur",
          path: "/flower-shop-kuala-lumpur",
        },
        {
          id: 2,
          title: "link-flower-delivery-in-kl",
          path: "/flower-delivery-in-kl",
        },
        {
          id: 3,
          title: "link-birthday-bouquet-flowers",
          path: "/birthday-bouquet-flowers",
        },
        {
          id: 4,
          title: "link-hand-bouquet",
          path: "/hand-bouquet",
        },
        {
          id: 5,
          title: "link-opening-flower-stand",
          path: "/opening-flower-stand",
        },
        {
          id: 6,
          title: "link-graduation-bouquet",
          path: "/graduation-bouquet",
        },
        {
          id: 7,
          title: "link-condolence-flower",
          path: "/condolence-flower",
        },
        /*{
          id: 1,
          title: "link-support-center",
          path: "/",
        },*/
        /* {
          id: 2,
          title: "link-customer-support",
          path: "__WHATSAPP_URL__",
        }, */
        /* {
          id: 3,
          title: "link-about-us",
          path: "/about-us",
        }, */
        /* {
          id: 4,
          title: "Whatsapp",
          path: "__WHATSAPP_URL__",
        }, */
      ],
    },
    {
      id: 4,
      widgetTitle: "widget-title-customer-care",
      lists: [
        {
          id: 1,
          title: "link-faq",
          path: "/faq",
        },
        {
          id: 2,
          title: "link-shipping",
          path: "/faq-shipping-delivery",
        },
        {
          id: 3,
          title: "link-exchanges",
          path: "/faq-return-exchanges",
        },
        {
          id: 6,
          title: "link-forget-password",
          // Behavior sentinel — widget-link.tsx renders this as a
          // button that pops the FORGET_PASSWORD modal instead of
          // navigating to a non-existent /forget-password page.
          path: "__OPEN_FORGET_PASSWORD__",
        },
        {
          id: 4,
          title: "link-customer-support",
          path: "__WHATSAPP_URL__",
        },
      ],
    },
    {
      id: 5,
      widgetTitle: "widget-title-our-information",
      lists: [
        {
          id: 1,
          title: "link-privacy",
          path: "/privacy",
        },
        {
          id: 2,
          title: "link-terms",
          path: "/terms",
        },
        {
          id: 3,
          title: "link-return-policy",
          path: "/faq-return-exchanges",
        },
        {
          id: 4,
          title: "link-site-map",
          path: "/sitemap.xml",
        },
        {
          id: 5,
          title: "link-about-us",
          path: "/about-us",
        },
      ],
    },
    {
      id: 3,
      widgetTitle: 'widget-services',
      lists: [
        {
          id: 1,
          title: 'link-my-account',
          // Behavior sentinel — widget-link.tsx renders authed users
          // a Link to /my-account, unauthed users a button that pops
          // the LOGIN_VIEW modal directly (no navigation + redirect
          // round-trip via the AccountLayout gate).
          path: '__MY_ACCOUNT_LINK__',
        },
        {
          id: 2,
          title: 'link-order-tracking',
          // Public guest-accessible page; old /my-account/orders required
          // login and bounced unauthed visitors to home.
          path: '/order-tracking',
        },
        {
          id: 4,
          title: "link-blog",
          path: "/blog",
        },
      ],
    },
  ],
  payment: [
    {
      id: 1,
      path: "javascript:void(0)",
      image: "/assets/images/payment/mastercard.png?v2",
      name: "payment-master-card",
      width: 34,
      height: 20,
    },
    {
      id: 2,
      path: "javascript:void(0)",
      image: "/assets/images/payment/visa.png?v2.01",
      name: "payment-visa",
      width: 50,
      height: 20,
    },
    {
      id: 3,
      path: "javascript:void(0)",
      image: "https://assets.becauseyou.com.my/assets/images/logo-fpx.png",
      name: "payment-fpx",
      width: 76,
      height: 20,
    },
    {
      id: 4,
      path: "javascript:void(0)",
      image: "https://assets.becauseyou.com.my/assets/images/tngo.png",
      name: "payment-tngo",
      width: 26,
      height: 20,
    },
    {
      id: 5,
      path: "javascript:void(0)",
      image: "https://assets.becauseyou.com.my/assets/images/grabp.png",
      name: "payment-grabp",
      width: 39,
      height: 20,
    },
  ],
};
