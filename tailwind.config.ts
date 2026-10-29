const { fontFamily } = require("tailwindcss/defaultTheme");
import type { Config } from "tailwindcss";

const config: Config= {
  // Quét toàn bộ app và src để Tailwind chỉ build đúng class đang dùng.
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    
  ],
  theme: {
    extend: {
      // Màu tập trung tại đây và đồng bộ với CSS variables trong src/styles/tokens.css.
      colors: {
        brand: {
          red: "rgb(var(--brand-red-rgb) / <alpha-value>)",
          redDark: "rgb(var(--brand-red-dark-rgb) / <alpha-value>)",
          green: "rgb(var(--brand-green-rgb) / <alpha-value>)",
          greenDark: "rgb(var(--brand-green-dark-rgb) / <alpha-value>)",
          cream: "rgb(var(--brand-cream-rgb) / <alpha-value>)",
          wheat: "rgb(var(--brand-wheat-rgb) / <alpha-value>)",
          ink: "rgb(var(--brand-ink-rgb) / <alpha-value>)",
          muted: "rgb(var(--brand-muted-rgb) / <alpha-value>)",
          wood: "rgb(var(--brand-wood-rgb) / <alpha-value>)",
          line: "var(--brand-line)",
        },
        // Bảng màu Admin Portal — chỉ dùng trong /admin/*, đọc biến --admin-* ở tokens.css.
        admin: {
          primary: "rgb(var(--admin-primary-rgb) / <alpha-value>)",
          primaryHover: "rgb(var(--admin-primary-hover-rgb) / <alpha-value>)",
          primaryLight: "rgb(var(--admin-primary-light-rgb) / <alpha-value>)",
          primaryBorder: "rgb(var(--admin-primary-border-rgb) / <alpha-value>)",
          rowSelected: "rgb(var(--admin-row-selected-rgb) / <alpha-value>)",
          bg: "rgb(var(--admin-bg-rgb) / <alpha-value>)",
          surface: "rgb(var(--admin-surface-rgb) / <alpha-value>)",
          subtle: "rgb(var(--admin-subtle-rgb) / <alpha-value>)",
          tableHeader: "rgb(var(--admin-table-header-rgb) / <alpha-value>)",
          border: "rgb(var(--admin-border-rgb) / <alpha-value>)",
          text: "rgb(var(--admin-text-rgb) / <alpha-value>)",
          textSecondary: "rgb(var(--admin-text-secondary-rgb) / <alpha-value>)",
          muted: "rgb(var(--admin-muted-rgb) / <alpha-value>)",
          focus: "rgb(var(--admin-focus-rgb) / <alpha-value>)",
          disabled: "rgb(var(--admin-disabled-rgb) / <alpha-value>)",
          danger: "rgb(var(--admin-danger-rgb) / <alpha-value>)",
          success: "rgb(var(--admin-success-rgb) / <alpha-value>)",
          warning: "rgb(var(--admin-warning-rgb) / <alpha-value>)",
          dangerText: "rgb(var(--admin-danger-text-rgb) / <alpha-value>)",
          successText: "rgb(var(--admin-success-text-rgb) / <alpha-value>)",
          warningText: "rgb(var(--admin-warning-text-rgb) / <alpha-value>)",
          accent: "rgb(var(--admin-accent-rgb) / <alpha-value>)",
          overlayWarm: "rgb(var(--admin-overlay-warm-rgb) / <alpha-value>)",
        },
      },
      // Typography Admin: cỡ chữ thống nhất cho toolbar/bảng/form.
      fontSize: {
        "admin-xs": ["12px", "16px"],
        "admin-sm": ["13px", "18px"],
        "admin-base": ["14px", "20px"],
        "admin-lg": ["16px", "22px"],
        "admin-title": ["20px", "28px"],
      },
      height: {
        "admin-control": "var(--admin-control-height)",
        "admin-row": "var(--admin-row-height)",
      },
      minHeight: {
        "admin-control": "var(--admin-control-height)",
      },
      transitionDuration: {
        admin: "var(--admin-transition)",
      },
      // Font được gom lại để đổi một lần là toàn bộ UI ăn theo.
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        display: ["var(--font-display)", ...fontFamily.sans],
      },
      // Shadow chuẩn để card, navbar, CTA dùng lại thống nhất.
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.10)",
        glow: "0 24px 80px rgba(237, 28, 36, 0.20)",
        "admin-dropdown": "var(--admin-shadow-dropdown)",
      },
      // Border radius chuẩn theo hướng mềm, cao cấp, dễ mở rộng.
      borderRadius: {
        brand: "28px",
        card: "32px",
        admin: "var(--admin-radius)",
      },
      // Background radial giúp hero có chiều sâu nhưng vẫn nhẹ.
      backgroundImage: {
        hero: "radial-gradient(circle at 80% 20%, rgba(237,28,36,.18), transparent 30%), radial-gradient(circle at 10% 70%, rgba(46,107,58,.22), transparent 34%)",
      },
    },
  },
  plugins: [],
};

export default config;