"use client";

import { useEffect, useState } from "react";
import {
  ArrowUp,
  MapPin,
  MessageSquare,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "motion/react";

/* =========================================================
 * CONSTANTS
 * ======================================================= */

const FACEBOOK_URL =
  "https://www.facebook.com/banhcuontayho127";

const GOOGLE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=127+Đinh+Tiên+Hoàng,+Đa+Kao,+TP.HCM";

const CONTACT_SCROLL_THRESHOLD = 300;
const SCROLL_TOP_THRESHOLD = 400;

/* =========================================================
 * BASE BUTTON STYLE
 * ======================================================= */

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

/* =========================================================
 * FLOATING ACTIONS
 * ======================================================= */

export default function FloatingActions() {
  const [showContactActions, setShowContactActions] =
    useState(false);

  const [showScrollTop, setShowScrollTop] =
    useState(false);

  const shouldReduceMotion = useReducedMotion();

  /* =========================================================
   * SCROLL LISTENER
   * ======================================================= */

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      setShowContactActions(
        scrollPosition > CONTACT_SCROLL_THRESHOLD,
      );

      setShowScrollTop(
        scrollPosition > SCROLL_TOP_THRESHOLD,
      );
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /* =========================================================
   * HANDLERS
   * ======================================================= */

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openExternalLink = (url: string) => {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /* =========================================================
   * CONTACT BUTTON ANIMATION
   * ======================================================= */

  const contactAnimation = {
    opacity: showContactActions ? 1 : 0,
    scale: showContactActions ? 1 : 0.75,
    x: showContactActions ? 0 : 30,
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
       * SCROLL TO TOP
       * =================================================== */}

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
          duration: 0.25,
          ease: "easeOut",
        }}
        className={`
          ${BASE_BUTTON_CLASS}
          bg-[#FF9418]

          ${
            showScrollTop
              ? "pointer-events-auto visible"
              : "pointer-events-none invisible"
          }
        `}
      >
        <ArrowUp
          className="
            h-7
            w-7

            md:h-[34px]
            md:w-[34px]
          "
          strokeWidth={3}
        />
      </motion.button>

      {/* =====================================================
       * FACEBOOK
       * Scroll > 200 mới xuất hiện
       * =================================================== */}

      <motion.button
        type="button"
        onClick={() =>
          openExternalLink(FACEBOOK_URL)
        }
        aria-label="Liên hệ qua Facebook"
        title="Facebook"
        initial={false}
        animate={
          showContactActions
            ? shouldReduceMotion
              ? {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }
              : {
                  ...contactAnimation,

                  rotate: [
                    0,
                    0,
                    -7,
                    7,
                    -5,
                    5,
                    -2,
                    2,
                    0,
                    0,
                  ],

                  y: [
                    0,
                    0,
                    -2,
                    -2,
                    -1,
                    -1,
                    0,
                    0,
                    0,
                    0,
                  ],

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
            : {
                opacity: 0,
                scale: 0.75,
                x: 30,
                rotate: 0,
                y: 0,
              }
        }
        transition={
          showContactActions
            ? {
                duration: 1.1,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }
            : {
                duration: 0.25,
                ease: "easeOut",
              }
        }
        whileHover={
          showContactActions
            ? {
                scale: 1.12,
                y: -4,
                rotate: 0,
              }
            : undefined
        }
        whileTap={{
          scale: 0.92,
        }}
        style={{
          transformOrigin: "50% 20%",
        }}
        className={`
          ${BASE_BUTTON_CLASS}
          bg-[#317C48]

          ${
            showContactActions
              ? "pointer-events-auto visible"
              : "pointer-events-none invisible"
          }
        `}
      >
        <MessageSquare
          className="
            h-7
            w-7

            md:h-[34px]
            md:w-[34px]
          "
          fill="currentColor"
          strokeWidth={2.5}
        />
      </motion.button>

      {/* =====================================================
       * GOOGLE MAPS
       * Scroll > 200 mới xuất hiện
       * =================================================== */}

      <motion.button
        type="button"
        onClick={() =>
          openExternalLink(GOOGLE_MAP_URL)
        }
        aria-label="Xem địa chỉ trên Google Maps"
        title="Google Maps"
        initial={false}
        animate={
          showContactActions
            ? shouldReduceMotion
              ? {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }
              : {
                  ...contactAnimation,

                  rotate: [
                    0,
                    0,
                    -7,
                    7,
                    -5,
                    5,
                    -2,
                    2,
                    0,
                    0,
                  ],

                  y: [
                    0,
                    0,
                    -2,
                    -2,
                    -1,
                    -1,
                    0,
                    0,
                    0,
                    0,
                  ],

                  boxShadow: [
                    "0 4px 10px rgba(0,0,0,0.12)",
                    "0 4px 10px rgba(0,0,0,0.12)",
                    "0 0 0 5px rgba(245,30,39,0.15)",
                    "0 0 0 8px rgba(245,30,39,0.08)",
                    "0 6px 16px rgba(0,0,0,0.18)",
                    "0 6px 16px rgba(0,0,0,0.18)",
                    "0 4px 10px rgba(0,0,0,0.12)",
                    "0 4px 10px rgba(0,0,0,0.12)",
                    "0 4px 10px rgba(0,0,0,0.12)",
                    "0 4px 10px rgba(0,0,0,0.12)",
                  ],
                }
            : {
                opacity: 0,
                scale: 0.75,
                x: 30,
                rotate: 0,
                y: 0,
              }
        }
        transition={
          showContactActions
            ? {
                duration: 1.1,
                repeat: Infinity,
                repeatDelay: 4.5,
                ease: "easeInOut",
              }
            : {
                duration: 0.25,
                ease: "easeOut",
              }
        }
        whileHover={
          showContactActions
            ? {
                scale: 1.12,
                y: -4,
                rotate: 0,
              }
            : undefined
        }
        whileTap={{
          scale: 0.92,
        }}
        style={{
          transformOrigin: "50% 20%",
        }}
        className={`
          ${BASE_BUTTON_CLASS}
          bg-[#F51E27]

          ${
            showContactActions
              ? "pointer-events-auto visible"
              : "pointer-events-none invisible"
          }
        `}
      >
        <MapPin
          className="
            h-8
            w-8

            md:h-9
            md:w-9
          "
        />
      </motion.button>
    </div>
  );
}