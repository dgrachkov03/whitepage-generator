import assert from "node:assert/strict";
import test from "node:test";
import {
  auditFixedPalettes,
  formatPaletteAuditReport,
} from "./palette-audit.js";

test("palette audit inspects every fixed palette", () => {
  const report = auditFixedPalettes();

  assert.ok(report.total >= 48);
  assert.equal(report.valid + report.invalid, report.total);
  report.results.forEach((result) => {
    assert.match(result.id, /^[a-z-]+\/_?[a-z0-9-]+$/);
    assert.match(result.colorScheme, /^(light|dark)$/);
    assert.ok(Number.isFinite(result.metrics.minimumContrast));
    assert.ok(Number.isFinite(result.metrics.accentDistance));
  });
});

test("palette audit report includes summary counts", () => {
  const report = auditFixedPalettes();
  const formatted = formatPaletteAuditReport(report);

  assert.match(formatted, /Checked \d+ fixed palettes/);
  assert.match(formatted, /Valid: \d+, invalid: \d+, with warnings: \d+/);
});

test("palette audit has legal-quality primary and accent pairs", () => {
  const report = auditFixedPalettes();
  const issues = report.results.filter(
    (result) =>
      result.warnings.some(
        (warning) =>
          warning.includes("different hue families") ||
          warning.includes("too neon") ||
          warning.includes("very close") ||
          warning.includes("outside legal-quality"),
      ),
  );

  assert.equal(
    issues.length,
    0,
    `expected no accent issues, found: ${issues.map((result) => result.id).join(", ")}`,
  );
});
