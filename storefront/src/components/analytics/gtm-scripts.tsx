// Server component. Renders the GTM + Consent Mode v2 init scripts into
// <head>/<body>, driven entirely by admin-editable site-config.
//
// Design notes:
// - Consent Mode v2 defaults fire BEFORE gtm.js so GTM can respect them
//   immediately. Ad-related signals start `denied` in EEA/UK; everywhere
//   else follows `consent_default_region`.
// - GA4 direct beacon is OPTIONAL — GTM alone is enough; but power users can
//   set `ga4_measurement_id` for a direct gtag tag independent of GTM.
// - Facebook / TikTok / Hotjar are similarly opt-in via their own IDs.

import Script from "next/script";
import { loadSiteConfig, getConfigValue } from "@lib/site-config";

type Props = { position?: "head" | "body" };

export default async function GtmScripts({ position = "head" }: Props) {
  const cfg = await loadSiteConfig();
  const gtmId = getConfigValue(cfg, "gtm_container_id");
  const ga4Id = getConfigValue(cfg, "ga4_measurement_id");
  const fbPixel = getConfigValue(cfg, "facebook_pixel_id");
  const tiktokPixel = getConfigValue(cfg, "tiktok_pixel_id");
  const hotjarId = getConfigValue(cfg, "hotjar_site_id");
  const defaultRegion = getConfigValue(cfg, "consent_default_region", "MY");

  if (position === "body") {
    if (!gtmId) return null;
    return (
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    );
  }

  // Head scripts below:
  return (
    <>
      {/* Consent Mode v2 defaults — always emit so GTM picks them up on load. */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          // Default-deny ad/analytics for EEA + UK + Switzerland; everywhere else
          // follows the tenant's configured default region.
          var EEA_UK_CH = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'];
          gtag('consent','default',{
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted',
            region: EEA_UK_CH,
            wait_for_update: 500
          });
          ${
            defaultRegion && !["GB", "CH"].includes(defaultRegion)
              ? `gtag('consent','default',{
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted',
              functionality_storage: 'granted',
              security_storage: 'granted'
            });`
              : ""
          }
          // Restore stored choice on return visits.
          try {
            var stored = localStorage.getItem('consent_v2');
            if (stored) gtag('consent','update', JSON.parse(stored));
          } catch(e){}
        `}
      </Script>

      {gtmId && (
        <Script id="gtm-loader" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`gtag('js', new Date()); gtag('config', '${ga4Id}', { send_page_view: false });`}
          </Script>
        </>
      )}

      {fbPixel && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixel}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {tiktokPixel && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixel}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {hotjarId && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjarId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </>
  );
}
