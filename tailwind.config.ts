import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#090909",
        steel: "#111314",
        line: "#1f2523",
        signal: "#63f079",
        "signal-soft": "#1d3a24",
        mist: "#e8ece9",
        "mist-dim": "#98a29d",
        ember: "#8befa0",
      },
      boxShadow: {
        tactical: "0 24px 80px rgba(0, 0, 0, 0.32)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
