import { defineConfig } from "astro/config";

// Production URLs come from the deployment environment; local preview stays at /.
export default defineConfig({
  output: "static",
  site: process.env.SITE_URL,
  base: process.env.SITE_BASE || "/",
  devToolbar: { enabled: false },
});
