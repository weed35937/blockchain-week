import { DeConfEngine } from "./engine.js";

const deconf = new DeConfEngine();
await deconf.init();

const cmd = Deno.args[0] || "build";
const args = Deno.args.slice(1) || [];

/*const options = Object.fromEntries(
  args.map((x) => {
    const [key, value] = x.split("=");
    if (!value) return null;
    return [key, value];
  }).filter((x) => x),
);*/

const output = await deconf[cmd](...args);
if (output) {
  console.log(output);
}
