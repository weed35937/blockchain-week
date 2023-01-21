import { parse as tomlParse } from "https://deno.land/std@0.173.0/encoding/toml.ts";

export class DeConfEngine {
  constructor(options = {}) {
    this.options = options;
    this.srcDir = this.options.srcDir || "./data";
  }
  async init() {}
  async build() {
    this.entries = {};
    for await (const f of Deno.readDir(this.srcDir)) {
      if (!f.name.match(/^\d+$/)) {
        continue;
      }
      const specDir = [this.srcDir, f.name].join("/");

      const entry = this.entries[f.name] = {};
      // load year index
      entry.index = await this._tomlLoad([specDir, "index.toml"].join("/"));
      console.log(`\n##\n## [${entry.index.name}] \n##`);
      // load sub-events
      entry.events = [];
      for await (const ef of Deno.readDir([specDir, "events"].join("/"))) {
        if (!ef.name.match(/^[\w\d\-]+$/)) {
          continue;
        }
        const efDir = [specDir, "events", ef.name].join("/");
        const efIndex = await this._tomlLoad([efDir, "index.toml"].join("/"));
        const event = {
          index: efIndex,
        };
        entry.events.push(event);
      }
      console.table(entry.events.map((e) => e.index), ["name"]);
    }
  }
  async _tomlLoad(fn) {
    return tomlParse(await Deno.readTextFile(fn));
  }
}
