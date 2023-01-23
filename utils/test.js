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

const colMapper = {
  unions: "union",
  events: "event",
};

function checkCollection(entry, entryInfo, colName) {
  for (const event of entry.data[colName]) {
    Deno.test(`[${entryInfo} ${colName}=${event.id}] index`, () => {
      // check event index
      const k = colMapper[colName];
      if (!validators[k](event.data.index)) {
        throw validators[k].errors;
      }
    });
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
  for (const col of Object.keys(colMapper)) {
    checkCollection(entry, entryInfo, col);
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
