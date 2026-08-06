import path from "node:path";

export function resolveAssetFileNames(assetInfo) {
  const name = assetInfo.names?.[0] ?? assetInfo.name ?? "asset";
  const ext = path.extname(name).slice(1).toLowerCase();

  if (/woff2?|ttf|otf|eot/.test(ext)) {
    return "assets/fonts/[name][extname]";
  }

  if (/png|jpe?g|gif|svg|webp|avif|ico/.test(ext)) {
    return "assets/images/[name][extname]";
  }

  if (ext === "css") {
    return "assets/styles/[name][extname]";
  }

  return "assets/[name][extname]";
}

export const buildOutputOptions = {
  chunkFileNames: "assets/scripts/[name].js",
  entryFileNames: "assets/scripts/[name].js",
  assetFileNames: resolveAssetFileNames,
};
