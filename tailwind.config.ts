import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15171a",
        mist: "#f5f7fb",
        line: "#dfe5ec",
        fern: "#16785f",
        coral: "#df624d",
        gold: "#d59d2b"
      },
      boxShadow: {
        panel: "0 16px 40px rgba(21, 23, 26, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
