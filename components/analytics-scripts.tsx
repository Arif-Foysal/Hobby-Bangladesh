"use client";

import Script from "next/script";

interface AnalyticsScriptsProps {
  enabled: boolean;
  googleAnalyticsId?: string;
  metaPixelId?: string;
  googleAdsId?: string;
}

export function AnalyticsScripts({
  enabled,
  googleAnalyticsId,
  metaPixelId,
  googleAdsId,
}: AnalyticsScriptsProps) {
  if (!enabled) return null;

  const hasGA = !!googleAnalyticsId;
  const hasPixel = !!metaPixelId;
  const hasAds = !!googleAdsId;
  const hasGtag = hasGA || hasAds;

  return (
    <>
      {hasGtag && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId ?? googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              ${hasGA ? `gtag('config', '${googleAnalyticsId}');` : ""}
              ${hasAds ? `gtag('config', '${googleAdsId}');` : ""}
            `}
          </Script>
        </>
      )}

      {hasPixel && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {hasPixel && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
}