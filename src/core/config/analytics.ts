/**
 * Mã đo lường của Site. Biến RUNTIME, chỉ server (không phải NEXT_PUBLIC_*): đọc lúc render ở app/(site)/layout.tsx
 * (force-dynamic) nên đổi giá trị chỉ cần sửa compose trên VPS rồi restart container, không phải build lại.
 *
 * GTM_ID=GTM-XXXXXXX bật Google Tag Manager; GA4, Google Ads, Meta Pixel... cấu hình trong container GTM, không thêm
 * script nào khác vào code. Rỗng hoặc sai định dạng → không nhúng gì (local, UAT không đo).
 */
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

export function getGtmId(): string | undefined {
  const gtmId = process.env.GTM_ID?.trim();
  return gtmId && GTM_ID_PATTERN.test(gtmId) ? gtmId : undefined;
}
