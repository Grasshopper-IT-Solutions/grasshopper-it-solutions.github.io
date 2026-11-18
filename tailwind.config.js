/**
 * Static Tailwind build for the main site (index.html + pages/*).
 *
 * This replaces the cdn.tailwindcss.com play-CDN script and its inline
 * tailwind.config duplicated across every page. Ported 1:1 from that inline
 * config — theme values must stay identical so nothing visually shifts.
 *
 * `apps/*` still uses the CDN script and is intentionally out of scope here.
 *
 * Regenerate after editing markup or this file:
 *   npm install && npm run build   (i18n pages, then this stylesheet)
 *
 * Markup is authored in src/ (templates + partials) and generated into the
 * English pages (index.html, pages/) and the Spanish ones (es/). All of them
 * are scanned so a class used only in a template, a partial or one language
 * still makes it into the stylesheet.
 */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.html",
    "./es/**/*.html",
    "./src/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        "grass-green": "#00ff41",
        "cyber-blue": "#00dbde",
        "cyber-red": "#ff003c",
        "deep-space": "#0a0a0a",
        "code-gray": "#1e1e1e",
        "card-gray": "#151515",
        "neon-red": "#ff073a",
        "tales-amber": "#b45309",
        "tales-action": "#991b1b",
        "kitchen-orange": "#ea580c",
        "kitchen-red": "#dc2626",
      },
      fontFamily: {
        mono: ['"Space Mono"', "monospace"],
        sans: ['"Inter"', "sans-serif"],
        heading: ['"Outfit"', "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        scroll: "scroll 60s linear infinite",
        "bounce-x": "bounce-x 1s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "bounce-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(5px)" },
        },
      },
    },
  },
  plugins: [],
};
