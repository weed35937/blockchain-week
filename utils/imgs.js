import { DeConfEngine } from "./engine.js";

const dc = new DeConfEngine();
await dc.init();

// pick last entry (eq. "23")
const entry = dc.entries[dc.entries.length - 1];
console.log(`entry=${entry.id}`);

if (Deno.args[0]) {
  const ev = entry.data.events.find((e) => e.id === Deno.args[0]);
  await ev.optimizeImages();
} else {
  for (const type of Object.keys(entry.colMapper)) {
    for (const item of entry.data[type]) {
      if (item.data.index.hidden) {
        continue;
      }
      await item.optimizeImages();
    }
  }
}
