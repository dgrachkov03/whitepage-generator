import fs from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";

const validatorCache = new Map();

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${label} contains invalid JSON: ${error.message}`, {
      cause: error,
    });
  }
}

function getValidator(schemaPath, schemaLabel) {
  const schemaSource = fs.readFileSync(schemaPath, "utf8");
  const cached = validatorCache.get(schemaPath);

  if (cached?.source === schemaSource) {
    return cached.validator;
  }

  let schema;

  try {
    schema = JSON.parse(schemaSource);
  } catch (error) {
    throw new Error(`${schemaLabel} contains invalid JSON: ${error.message}`, {
      cause: error,
    });
  }

  const ajv = new Ajv2020({ allErrors: true });
  const validator = ajv.compile(schema);

  validatorCache.set(schemaPath, {
    source: schemaSource,
    validator,
  });

  return validator;
}

function formatValidationError(error) {
  const location = error.instancePath || "/";
  const property = error.params.additionalProperty
    ? ` "${error.params.additionalProperty}"`
    : "";

  return `- ${location}${property}: ${error.message}`;
}

function loadValidatedJson(dataPath, schemaPath, dataLabel, schemaLabel) {
  const data = readJson(dataPath, dataLabel);
  const validate = getValidator(schemaPath, schemaLabel);

  if (!validate(data)) {
    const details = validate.errors.map(formatValidationError).join("\n");

    throw new Error(
      `${dataLabel} does not match ${schemaLabel}:\n${details}`,
    );
  }

  return data;
}

export function loadSiteData(dataPath, schemaPath) {
  return loadValidatedJson(
    dataPath,
    schemaPath,
    "site.json",
    "site.schema.json",
  );
}
