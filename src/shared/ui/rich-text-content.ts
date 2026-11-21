/**
 * Typography cho HTML sinh từ RichTextEditor — dùng chung cho vùng soạn thảo, tab
 * "Xem trước" và nơi Site render nội dung (tin tức, mô tả chi tiết sản phẩm) để
 * Admin thấy đúng như khách sẽ thấy. Project không dùng @tailwindcss/typography
 * nên style từng thẻ bằng arbitrary variant.
 *
 * Đặt ở module không "use client" để Server Component import được.
 */
export const RICH_TEXT_CONTENT_CLASS = [
  "max-w-none text-[15px] leading-7 text-brand-ink",
  "[&_p]:my-2",
  "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-[20px] [&_h2]:font-black",
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[17px] [&_h3]:font-black",
  "[&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:text-[15px] [&_h4]:font-black",
  "[&_a]:text-brand-red [&_a]:underline",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-line [&_blockquote]:pl-4 [&_blockquote]:text-brand-muted",
  "[&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:text-[13px]",
  "[&_hr]:my-6 [&_hr]:border-brand-line",
  "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg",
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px]",
  "[&_td]:border [&_td]:border-brand-line [&_td]:px-2 [&_td]:py-1 [&_td]:align-top",
  "[&_th]:border [&_th]:border-brand-line [&_th]:bg-black/5 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-bold",
].join(" ");
