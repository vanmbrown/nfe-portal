import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

// Configure OpenNext to properly handle static routes (SSG)
export default defineCloudflareConfig({
  // Ensure static routes are served from assets
  runWorkerFirst: false, // Let static assets be served first, then Worker handles dynamic routes
});
