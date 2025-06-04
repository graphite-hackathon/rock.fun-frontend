import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // yapari: "var(--font-yapari)",
        suisse: "var(--font-suisse)",
 
      },

      colors: {
        // background: "var(--background)",
        // foreground: "var(--foreground)",
        "primary-light": "#FAFFE6",
        primary: "#D7DEBD",
        "primary-dark": "#A5AB9F"

      
      },

      screens: {
        "desktop-qhd": {
          min: "2560px",
        },
        "desktop-lg": {
          min: "1920px",
          max: "2559px",
        },
        "desktop-slg": {
          max: "1911px",
          min: "1520px"
        },
        "desktop-md": {
          max: "1511px",
        },
        "desktop-sm": {
          max: "1365px",
        },
        tablet: {
          max: "1200px",
          min: "768px",
        },
        "mobile-lg": {
          max: "767px",
          min: "480px",
        },
        "mobile-sm": {
          max: "479px",
          min: "390px",
        },
        "mobile-xs": {
          max: "389px",
          min: "320px",
        },
        mobile: {
          max: "1023px",
          min: "320px",
        },
        desktop: {
          max: "4460px",
          min: "1024px",
        },
      },
    },
  },
  plugins: [
    require("tailwind-gradient-mask-image")
  ],
};
export default config;

