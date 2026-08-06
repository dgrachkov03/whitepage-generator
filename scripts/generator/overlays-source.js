import { toPugIncludePath } from "./paths.js";
import { isCornerConsentBannerVariant } from "./consent-discovery.js";

export function createOverlaysSource(selection) {
  const lines = [];

  if (selection.consentBannerCorner) {
    lines.push("-");
    lines.push(
      `  const consentBannerCorner = "${selection.consentBannerCorner}";`,
    );
    lines.push("");
  }

  lines.push(
    `include ${toPugIncludePath(selection.consentBanner.filePath)}`,
  );
  lines.push("");

  return `${lines.join("\r\n")}\r\n`;
}

export function resolveConsentBannerCorner(consentBannerPath, pick) {
  if (!isCornerConsentBannerVariant(consentBannerPath)) {
    return null;
  }

  return pick(["start", "end"], "consent banner corner");
}
