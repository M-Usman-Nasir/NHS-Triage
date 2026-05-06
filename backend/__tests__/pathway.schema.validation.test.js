'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const PATHWAYS_DIR = path.join(__dirname, '../data/pathways');
const CANONICAL_MASTER_PATH = path.join(PATHWAYS_DIR, 'canonical/pathways.master.json');
const SCHEMA_PATH = path.join(PATHWAYS_DIR, 'pathway.schema.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listRuntimePathwayFiles() {
  return fs.readdirSync(PATHWAYS_DIR)
    .filter((name) => name.endsWith('.json') && name !== 'pathway.schema.json')
    .sort();
}

function toErrorText(errors) {
  return errors
    .map((err) => `${err.instancePath || '/'} ${err.message}`)
    .join('\n');
}

describe('pathway schema contract', () => {
  const schema = readJson(SCHEMA_PATH);
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  it('keeps canonical master list in sync with runtime pathway files', () => {
    const runtimeFiles = listRuntimePathwayFiles();
    const master = readJson(CANONICAL_MASTER_PATH);
    const masterRuntimeFiles = (master.pathways || [])
      .map((entry) => entry.runtimeFile)
      .filter(Boolean)
      .sort();

    expect(masterRuntimeFiles).toEqual(runtimeFiles);
  });

  it('validates each runtime pathway JSON against pathway schema', () => {
    const files = listRuntimePathwayFiles();

    for (const fileName of files) {
      const payload = readJson(path.join(PATHWAYS_DIR, fileName));
      const ok = validate(payload);
      if (!ok) {
        throw new Error(`Schema validation failed for ${fileName}:\n${toErrorText(validate.errors || [])}`);
      }
    }
  });
});
