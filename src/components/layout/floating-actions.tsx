"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MapPin, MessageSquare } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const FACEBOOK_URL = "https://www.facebook.com/banhcuontayho127";

const GOOGLE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=127+Đinh+Tiên+Hoàng,+Đa+Kao,+TP.HCM";

/* =========================================================
   ANIMATION CONFIG
========================================================= */

const SHAKE_ANIMATION = {
  x: [0, -2, 2, -2, 2, -1, 1, 0],
  rotate: [0, -5, 5, -5, 5, -3, 3, 0],
};

const BASE_BUTTON_CLASS = `
  flex
  h-[50px]
  w-[50px]
  shrink-0
  cursor-pointer
  items-center
  justify-center
  rounded-full
  border-0
  text-white
  shadow-sm

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-white
  focus-visible:ring-offset-2

  md:h-[58px]
  md:w-[58px]
`;

export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  /* =========================================================
     SCROLL LISTENER
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     HANDLERS
  ========================================================= */

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
    <div
      className="
        fixed
        right-3
        top-1/2
        z-[1000]
        flex
        -translate-y-1/2
        flex-col
        items-center
        gap-3

        md:right-6
        md:gap-4
      "
    >
      {/* =====================================================
          SCROLL TO TOP
      ====================================================== */}

      <motion.button
        type="button"
        onClick={handleScrollTop}
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
        initial={false}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
          y: showScrollTop ? 0 : 10,
        }}
        whileHover={{
          y: -3,
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.92,
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className={`
          ${BASE_BUTTON_CLASS}
          bg-[#FF9418]

          ${showScrollTop
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible"
          }
        `}
      >
        <ArrowUp
          className="h-7 w-7 md:h-[34px] md:w-[34px]"
          strokeWidth={3}
        />
      </motion.button>

      {/* =====================================================
          FACEBOOK
      ====================================================== */}
      <motion.button
        type="button"
        onClick={() => openExternalLink(FACEBOOK_URL)}
        aria-label="Liên hệ qua Facebook"
        title="Facebook"

        style={{
          transformOrigin: "50% 20%",
        }}

        animate={
          shouldReduceMotion
            ? undefined
            : {
              rotate: [0, 0, -7, 7, -5, 5, -2, 2, 0, 0],
              scale: [1, 1, 1.08, 1.08, 1.05, 1.05, 1.02, 1.02, 1, 1],
              y: [0, 0, -2, -2, -1, -1, 0, 0, 0, 0],

              boxShadow: [
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 0 0 5px rgba(49,124,72,0.15)",
                "0 0 0 8px rgba(49,124,72,0.08)",
                "0 6px 16px rgba(0,0,0,0.18)",
                "0 6px 16px rgba(0,0,0,0.18)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
              ],
            }
        }

        transition={{
          duration: 1.1,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}

        whileHover={{
          scale: 1.12,
          y: -4,
          rotate: 0,
        }}

        whileTap={{
          scale: 0.92,
        }}

        className={`
    ${BASE_BUTTON_CLASS}
    bg-[#317C48]
  `}
      >
        <MessageSquare
          className="h-7 w-7 md:h-[34px] md:w-[34px]"
          fill="currentColor"
          strokeWidth={2.5}
        />
      </motion.button>

      {/* =====================================================
          GOOGLE MAPS
      ====================================================== */}



      <motion.button
        type="button"
        onClick={() => openExternalLink(FACEBOOK_URL)}
        aria-label="Liên hệ qua Facebook"
        title="Facebook"

        style={{
          transformOrigin: "50% 20%",
        }}

        animate={
          shouldReduceMotion
            ? undefined
            : {
              rotate: [0, 0, -7, 7, -5, 5, -2, 2, 0, 0],
              scale: [1, 1, 1.08, 1.08, 1.05, 1.05, 1.02, 1.02, 1, 1],
              y: [0, 0, -2, -2, -1, -1, 0, 0, 0, 0],

              boxShadow: [
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 0 0 5px rgba(49,124,72,0.15)",
                "0 0 0 8px rgba(49,124,72,0.08)",
                "0 6px 16px rgba(0,0,0,0.18)",
                "0 6px 16px rgba(0,0,0,0.18)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
                "0 4px 10px rgba(0,0,0,0.12)",
              ],
            }
        }

        transition={{
          duration: 1.1,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}

        whileHover={{
          scale: 1.12,
          y: -4,
          rotate: 0,
        }}

        whileTap={{
          scale: 0.92,
        }}

        className={`
    ${BASE_BUTTON_CLASS}
    bg-[#F51E27]
  `}
      >
        <MapPin className="h-8 w-8 md:h-9 md:w-9" />
      </motion.button>
    </div>
  );
}