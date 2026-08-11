import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: "gzip" }),
    viteCompression({ algorithm: "brotli" }),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["framer-motion", "@headlessui/react"],
          icons: ["react-icons"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
