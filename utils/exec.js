import { DeConfEngine } from "./engine.js";

const deconf = new DeConfEngine();
await deconf.init();

let cmd = Deno.args[0] || "build";
let args = Deno.args.slice(1) || [];

const output = await deconf[cmd](...args);
if (output) {
  console.log(output);
}
