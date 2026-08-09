"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageSquare, MapPin } from "lucide-react";
import styles from "./FloatingActions.module.css";

const FACEBOOK_URL = "https://www.facebook.com/banhcuontayho127";

const GOOGLE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=127+Đinh+Tiên+Hoàng,+Đa+Kao,+TP.HCM";

export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.floatingActions}>
      {/* Scroll to top */}
      <button
        type="button"
        className={`${styles.actionButton} ${styles.scrollTop} ${
          showScrollTop ? styles.visible : styles.hidden
        }`}
        onClick={handleScrollTop}
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
      >
        <ArrowUp size={34} strokeWidth={3} />
      </button>

      {/* Facebook */}
      <button
        type="button"
        className={`${styles.actionButton} ${styles.facebook}`}
        onClick={() => openExternalLink(FACEBOOK_URL)}
        aria-label="Liên hệ qua Facebook"
        title="Facebook"
      >
        <MessageSquare size={34} fill="currentColor" strokeWidth={2.5} />
      </button>

      {/* Google Maps */}
      <button
        type="button"
        className={`${styles.actionButton} ${styles.map}`}
        onClick={() => openExternalLink(GOOGLE_MAP_URL)}
        aria-label="Xem vị trí trên Google Maps"
        title="Google Maps"
      >
        <MapPin size={36}  />
      </button>
    </div>
  );
}