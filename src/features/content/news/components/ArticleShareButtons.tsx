"use client";

import { useEffect, useState } from "react";
import { Check, Link2, MoreHorizontal, Share2 } from "lucide-react";

type ArticleShareButtonsProps = {
  title: string;
};

const BUTTON_CLASS =
  "focus-ring inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-white px-3.5 py-2 text-xs font-bold text-brand-ink transition hover:border-brand-red hover:text-brand-red";

/**
 * Chia sẻ bài: Facebook, sao chép link và nút chia sẻ của hệ điều hành (chỉ hiện khi trình duyệt
 * hỗ trợ navigator.share — thường là điện thoại, nơi có sẵn Zalo/Messenger). Lấy URL từ
 * window.location sau khi mount để luôn đúng domain đang chạy.
 */
export function ArticleShareButtons({ title }: ArticleShareButtonsProps) {
  const [url, setUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href.split("#")[0]);
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Trình duyệt chặn clipboard (http, quyền...) — không có gì để làm thêm.
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Người dùng đóng hộp thoại chia sẻ.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-brand-muted">Chia sẻ</span>

      <a
        href={url ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` : undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON_CLASS}
      >
        <Share2 size={14} aria-hidden="true" />
        Facebook
      </a>

      <button type="button" onClick={handleCopy} disabled={!url} className={BUTTON_CLASS}>
        {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Đã sao chép" : "Sao chép link"}</span>
      </button>

      {canNativeShare && (
        <button type="button" onClick={handleNativeShare} className={BUTTON_CLASS}>
          <MoreHorizontal size={14} aria-hidden="true" />
          Khác
        </button>
      )}
    </div>
  );
}
