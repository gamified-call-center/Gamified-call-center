import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";



const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
       bgPrimary: "#0b0f19",
        cardDark: "#111827",
        accent: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      boxShadow: {
        glow: "0 0 20px rgba(34,197,94,0.4)",
        soft: "0 10px 25px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        xl: "1rem",
      },
fontFamily: {
  "Gordita-Bold": ["Gordita-Bold", ...defaultTheme.fontFamily.sans],
  "Gordita-Medium": ["Gordita-Medium", ...defaultTheme.fontFamily.sans],
  "Gordita-Regular": ["Gordita-Regular", ...defaultTheme.fontFamily.sans],
  "Gordita-Light": ["Gordita-Light", ...defaultTheme.fontFamily.sans],
  "Gordita-SemiBold": ["Gordita-SemiBold", ...defaultTheme.fontFamily.sans],
  "Gordita-Extra-Bold": ["Gordita-Extra-Bold", ...defaultTheme.fontFamily.sans],
},


      keyframes: {
        loaderProgress: {
          "0%": { transform: "translateX(-60%)" },
          "50%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(60%)" },
        },
        loaderFill: {
          "0%, 100%": { clipPath: "inset(100% 0 0 0)" },
          "50%": { clipPath: "inset(0% 0 0 0)" },
        },
      },
      
       animation: {
        loaderProgress: "loaderProgress 2s ease-in-out infinite",
        loaderFill: "loaderFill 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
