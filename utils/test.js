import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { DeConfEngine } from "./engine.js";

// initialize ajv JSON Schema validator
import Ajv from "https://esm.sh/ajv@8.8.1?pin=v58";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";

const ajv = new Ajv({ strict: false });
addFormats(ajv);

const dc = new DeConfEngine({ silent: true });
await dc.init();
const schemas = await dc.schemas();

const validators = {};
for (const item of schemas) {
  validators[item.name] = ajv.compile(item.schema);
}

function checkCollection(entry, entryInfo, colName) {
  for (const event of entry.data[colName]) {
    Deno.test(`[${entryInfo} ${colName}=${event.id}] index`, () => {
      // check event index
      const k = entry.colMapper[colName];
      if (!validators[k](event.data.index)) {
        throw validators[k].errors;
      }
    });
    // check specific collections
    if (colName === "events" && event.data.index.union) {
      Deno.test(`[${entryInfo} ${colName}=${event.id}] union link`, () => {
        if (!entry.data.unions.find((u) => u.id === event.data.index.union)) {
          throw new Error(`Union not exists = ${event.data.index.union}`);
        }
      });
    }
  }
}

for (const entry of dc.entries) {
  // check index
  const entryInfo = `entry=${entry.id}`;
  Deno.test(`[${entryInfo}] index`, () => {
    if (!validators.index(entry.data.index)) {
      throw validators.index.errors;
    }
  });

  // check all collections
  for (const col of Object.keys(entry.colMapper)) {
    checkCollection(entry, entryInfo, col);
  }
}
