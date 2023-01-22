import { emptyDir, exists } from "https://deno.land/std@0.119.0/fs/mod.ts";
import { parse as tomlParse } from "https://deno.land/std@0.173.0/encoding/toml.ts";

const _silentMode = false;

export class DeConfEngine {
  constructor(options = {}) {
    this.options = options;
    this.srcDir = this.options.srcDir || "./data";
    this.outputDir = this.options.outputDir || "./dist";
    this.publicUrl = this.options.publicUrl || "https://data.prgblockweek.com";
  }
  async init() {}
  async build() {
    await emptyDir(this.outputDir);

    this.entries = [];
    for await (const f of Deno.readDir(this.srcDir)) {
      if (!f.name.match(/^\d+$/)) continue;
      const pkg = new DeConf_Package(f.name);
      await pkg.load([this.srcDir, f.name]);
      console.table(pkg.data.events.map((e) => e.data.index), ["name"]);
      await pkg.write(this.outputDir);
      this.entries.push(pkg)
    }
    await _jsonWrite([this.outputDir, "index.json"], this.entries.map(p => ({
      id: p.id,
      name: p.data.index.name,
      data: [this.publicUrl,p.id].join("/")
    })))
  }
}

class DeConf_Package {
  constructor(id) {
    this.id = id;
    this.data = null;
  }

  async load(specDir) {
    const pkg = {};
    // load year index
    pkg.index = await _tomlLoad([...specDir, "index.toml"].join("/"));
    console.log(`\n##\n## [${pkg.index.name}] \n##`);
    // load sub-events
    pkg.events = [];
    for await (const ef of Deno.readDir([...specDir, "events"].join("/"))) {
      if (!ef.name.match(/^[\w\d\-]+$/)) continue;
      const ev = new DeConf_Event(ef.name);
      await ev.load([...specDir, "events", ef.name]);
      pkg.events.push(ev);
    }
    this.data = pkg;
  }
  async write(dir) {
    const outputDir = [dir, this.id].join("/");
    await emptyDir(outputDir);
    await _jsonWrite([outputDir, "index.json"], this.toJSON());
  }
  toJSON() {
    return Object.assign({ id: this.id }, this.data.index, {
      events: this.data.events,
      time: new Date(),
    });
  }
}

class DeConf_Event {
  constructor(id) {
    this.id = id;
    this.data = null;
  }

  async load(dir) {
    const efIndex = await _tomlLoad([...dir, "index.toml"].join("/"));
    const event = {
      index: efIndex,
    };
    this.data = event;
  }

  toJSON() {
    return Object.assign({ id: this.id }, this.data.index);
  }
}

async function _tomlLoad(fn) {
  return tomlParse(await Deno.readTextFile(fn));
}
async function _jsonWrite(fn, data) {
  if (Array.isArray(fn)) {
    fn = fn.join("/");
  }
  await Deno.writeTextFile(fn, JSON.stringify(data, null, 2));
  if (!_silentMode) {
    console.log(`${fn} writed`);
  }
  return true;
}
