import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Explicitly load env to ensure VITE_* variables are available in all environments.
  const env = loadEnv(mode, process.cwd(), "");

  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://hvjlzajfbqspcnxpbrwg.supabase.co";

  const supabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2amx6YWpmYnFzcGNueHBicndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3OTY1OTYsImV4cCI6MjA4MzM3MjU5Nn0.0ph3Wi0_rqOGkXFIT5aI6Af78aft0Mm39IfYhVdAVpw";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [tailwindcss(), react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Ensure these are statically defined even if runtime env injection fails.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
    },
  };
});
