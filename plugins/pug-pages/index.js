import path from "node:path";
import { setupCustomCss } from "./custom-css.js";
import { formatHtmlFiles } from "./format-html.js";
import { pugRoot, renderPug } from "./renderer.js";

const RELEVANT_PUG_FILE = /\.(pug|json|css)$/;
const RELEVANT_EVENT = new Set(["add", "change", "unlink"]);

export function pugPagesPlugin() {
  let reloadTimer;
  let hasDevError = false;
  let outDir = "dist";

  function renderForDev(server, reload) {
    try {
      renderPug();

      if (hasDevError) {
        server.config.logger.info("[pug-pages] Site rendered successfully.");
      }

      hasDevError = false;

      if (reload) {
        server.ws.send({ type: "full-reload", path: "*" });
      }
    } catch (error) {
      hasDevError = true;
      server.config.logger.error(`[pug-pages] ${error.message}`);
      server.ws.send({
        type: "error",
        err: {
          message: error.message,
          stack: error.stack,
        },
      });
    }
  }

  return {
    name: "pug-pages",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.watcher.add([pugRoot]);
      renderForDev(server, false);

      server.watcher.on("all", (event, changedPath) => {
        const isPugSource =
          changedPath.startsWith(pugRoot) &&
          RELEVANT_PUG_FILE.test(changedPath);
        const isRelevant = RELEVANT_EVENT.has(event) && isPugSource;

        if (!isRelevant) {
          return;
        }

        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
          renderForDev(server, true);
        }, 50);
      });
    },
    buildStart() {
      renderPug();
    },
    async closeBundle() {
      await formatHtmlFiles(outDir);
      await setupCustomCss(outDir);
    },
  };
}

export { getRollupInput, renderPug } from "./renderer.js";
