
import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "cuci-motor-resita-salju",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-12",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      notFoundHandling: "none",
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      HYPERDRIVE: bindings.hyperdrive({
        id: "5b140cb6518047449cd625e3a80bd25d",
      }),
    },
  }),
});
