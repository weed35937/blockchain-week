import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { DeConfEngine } from "./engine.js";

// initialize ajv JSON Schema validator
import Ajv from "https://esm.sh/ajv@8.8.1?pin=v58";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

const ajv = new Ajv();
addFormats(ajv);

const dc = new DeConfEngine({ silent: true });
await dc.init();
const schemas = await dc.schemas();

const validators = {};
for (const item of schemas) {
  validators[item.name] = ajv.compile(item.schema);
}

for (const entry of dc.entries) {
  // check index
  const entryInfo = `entry=${entry.id}`;
  Deno.test(`[${entryInfo}] index`, () => {
    if (!validators.index(entry.data.index)) {
      throw validators.index.errors;
    }
  });

  // check events
  for (const event of entry.data.events) {
    Deno.test(`[${entryInfo} event=${event.id}] index`, () => {
      // check event index
      if (!validators.event(event.data.index)) {
        throw validators.event.errors;
      }
    });
  }

  // check specific specs
  /*for (const specId of Object.keys(entry.specs)) {
    Deno.test(`UTXO.${entryId}: ${specId}[schema]`, () => {
      if (!validators[specId]) {
        return null;
      }
      if (!validators[specId](entry.specs[specId])) {
        throw validators[specId].errors;
      }
    });
  }*/
}
