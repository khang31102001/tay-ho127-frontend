type JsonLdProps = {
  data: object | object[];
};

/**
 * Render 1 hoặc nhiều JSON-LD <script> tag (Task 19). Server Component thuần
 * (không "use client", không state/effect) — render được ở Server Component
 * cha (layout/page), không gây hydration mismatch vì nội dung không đổi giữa
 * server/client.
 *
 * An toàn (Task 33): escape "<" thành "<" trước khi nhúng — chặn khả
 * năng phá vỡ tag </script> bằng field text trong data (vd. tên sản phẩm chứa
 * "</script><script>..."), dù mọi field đầu vào đều đã qua JSON.stringify
 * (không phải HTML thô).
 */
function toSafeJsonLdString(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-danger
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLdString(item) }}
        />
      ))}
    </>
  );
}
