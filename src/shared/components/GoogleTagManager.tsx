import Script from "next/script";

type GoogleTagManagerProps = {
  gtmId: string;
};

/**
 * Snippet chuẩn của Google Tag Manager. Chỉ render ở app/(site)/layout.tsx — Admin không đo.
 * gtmId đã được kiểm định dạng (core/config/analytics.ts) trước khi nhúng vào script inline.
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
