
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@/lib/prisma",
        replacement: fileURLToPath(
          new URL("./src/lib/prisma.cloudflare.ts", import.meta.url)
        ),
      },
      {
        find: "@/lib/auth",
        replacement: fileURLToPath(
          new URL("./src/lib/auth.cloudflare.ts", import.meta.url)
        ),
      },
    ],
  },
  plugins: [
    vinext({
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
