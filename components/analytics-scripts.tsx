"use client";

import Script from "next/script";

interface AnalyticsScriptsProps {
  enabled: boolean;
  gtmContainerId?: string;
}

export function AnalyticsScripts({ enabled, gtmContainerId }: AnalyticsScriptsProps) {
  if (!enabled || !gtmContainerId) return null;

  const gtmSrc = `https://www.googletagmanager.com/gtm.js?id=${gtmContainerId}`;

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='${gtmSrc}'+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmContainerId}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="gtm"
        />
      </noscript>
    </>
  );
}