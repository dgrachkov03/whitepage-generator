import fs from "node:fs";
import pug from "pug";
import { renderPug } from "../../plugins/pug-pages/index.js";
import { indexPath, legalLayoutPath, pugRoot } from "./config.js";

function replaceFileAtomically(filePath, source) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  try {
    fs.writeFileSync(temporaryPath, source, "utf8");
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) {
      fs.rmSync(temporaryPath);
    }
  }
}

function validateGeneratedSource(source, filename) {
  pug.compile(source, {
    filename,
    basedir: pugRoot,
  });
}

function validateGeneratedSources(changes) {
  changes.forEach(({ filePath, source }) => {
    validateGeneratedSource(source, filePath);
  });
}

function capturePreviousFile(filePath) {
  const existed = fs.existsSync(filePath);

  return {
    filePath,
    existed,
    source: existed ? fs.readFileSync(filePath, "utf8") : null,
  };
}

function restoreFiles(previousFiles) {
  previousFiles.forEach((previous) => {
    if (previous.existed) {
      replaceFileAtomically(previous.filePath, previous.source);
    } else if (fs.existsSync(previous.filePath)) {
      fs.rmSync(previous.filePath);
    }
  });
}

export function writeAndRender(changes) {
  const previousFiles = changes.map(({ filePath }) =>
    capturePreviousFile(filePath),
  );

  try {
    changes.forEach((change) => {
      replaceFileAtomically(change.filePath, change.source);
    });
    validateGeneratedSources(
      changes.filter(({ filePath }) => filePath.endsWith(".pug")),
    );
    renderPug();
  } catch (error) {
    restoreFiles(previousFiles);

    throw new Error(
      `Generated files failed to render and were restored.\n${error.message}`,
      { cause: error },
    );
  }
}
