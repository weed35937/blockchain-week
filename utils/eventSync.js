import { DeConfEngine } from "./engine.js";

const dc = new DeConfEngine();
await dc.init();

// pick last entry (eq. "23")
const entry = dc.entries[dc.entries.length - 1];
console.log(`entry=${entry.id}`);

for (const event of entry.data.events) {
  await event.sync();
}
