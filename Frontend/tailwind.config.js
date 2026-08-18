/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        display: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        // Clinic UI theme: confident teal primary, clean warm-neutral surfaces.
        primary: {
          50:  "#ecfdf8",
          100: "#d1faee",
          200: "#a7f3dd",
          300: "#6ee7c7",
          400: "#2dd4ac",
          500: "#14b895",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        accent: {
          50:  "#fff8e7",
          100: "#f8e8bc",
          200: "#e8c979",
          300: "#d6ad4c",
          400: "#b88945",
          500: "#9a6a30",
          600: "#744c22",
          700: "#553819",
          800: "#392511",
          900: "#24170b",
        },
        // Danger scale used by some pages (rose instead of plain red)
        danger: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        // Soft clinic neutrals used across tables, panels, and empty states.
        surface: {
          50:  "#f8fbfa",
          100: "#eef5f3",
          200: "#dde8e5",
          300: "#c2d2ce",
          400: "#8aa09b",
          500: "#617771",
          600: "#475b55",
          700: "#33443f",
          800: "#202e2a",
          900: "#111c19",
        },
      },
    },
  },
  plugins: [],
};
