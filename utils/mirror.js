import { DeConfEngine } from "./engine.js";

const deconf = new DeConfEngine({
  publicUrl: "https://mirror.data.prgblockweek.com",
  exploreUrl: "https://mirror.explore.prgblockweek.com",
  outputDir: "./dist-mirror",
});

await deconf.init();
await deconf.build();
