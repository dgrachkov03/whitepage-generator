import {
  auditFixedPalettes,
  formatPaletteAuditReport,
} from "./generator/palette-audit.js";

const jsonOutput = process.argv.includes("--json");
const report = auditFixedPalettes();

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(formatPaletteAuditReport(report));
}

if (report.invalid > 0) {
  process.exitCode = 1;
}
