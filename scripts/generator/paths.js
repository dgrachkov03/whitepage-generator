import path from "node:path";
import { pugRoot } from "./config.js";

export function toPugIncludePath(filePath) {
  return `/${path.relative(pugRoot, filePath).split(path.sep).join("/")}`;
}

export function toLegalDocumentIncludePath(filePath) {
  return toPugIncludePath(filePath);
}

export function toVariantName(filePath, rootDirectory) {
  return path
    .relative(rootDirectory, filePath)
    .split(path.sep)
    .join("/")
    .replace(/(^|\/)_/g, "$1")
    .replace(/\.(pug|css)$/, "");
}
