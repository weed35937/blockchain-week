import {
  copy,
  emptyDir,
  ensureDir,
  exists,
} from "https://deno.land/std@0.173.0/fs/mod.ts";
import { parse as tomlParse } from "https://deno.land/std@0.173.0/encoding/toml.ts";
import { load as yamlLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";
import { posix } from "https://deno.land/std@0.173.0/path/mod.ts";
import * as syncTools from "./syncTools.js";

let _silentMode = false;

export class DeConfEngine {
  constructor(options = {}) {
    this.options = options;
    this.srcDir = this.options.srcDir || "./data";
    this.outputDir = this.options.outputDir || "./dist";
    this.publicUrl = this.options.publicUrl || "https://data.prgblockweek.com";
    this.githubUrl = this.options.githubUrl ||
      "https://github.com/utxo-foundation/prague-blockchain-week/tree/main/data";

    if (options.silent) {
      _silentMode = true;
    }
  }
  async init() {
    this.entries = [];
    for await (const f of Deno.readDir(this.srcDir)) {
      if (!f.name.match(/^\d+$/)) continue;
      const pkg = new DeConf_Package(f.name, this);
      await pkg.load([this.srcDir, f.name]);
      this.entries.push(pkg);
    }
  }
  async build() {
    await emptyDir(this.outputDir);
    for (const pkg of this.entries) {
      console.table(pkg.data.events.map((e) => e.data.index), ["name"]);
      await pkg.write(this.outputDir);
    }
    await _jsonWrite(
      [this.outputDir, "index.json"],
      this.entries.map((p) => ({
        id: p.id,
        name: p.data.index.name,
        dataUrl: p.data.index.dataUrl,
      })),
    );
    // write schemas
    const schemaVersion = 1;
    const schemas = await this.schemas(schemaVersion);

    const outputSchemaDir = [this.outputDir, "schema", schemaVersion].join("/");
    await emptyDir(outputSchemaDir);
    console.log(`writing schema (v${schemaVersion}) ..`);

    const schemaBundle = {};
    for (const schema of schemas) {
      await _jsonWrite(
        [outputSchemaDir, schema.name + ".json"],
        schema.schema,
      );
      schemaBundle[schema.name] = schema.schema;
    }
    await _jsonWrite([outputSchemaDir, "bundle.json"], {
      definitions: schemaBundle,
    });
  }
  async schemas(version = "1") {
    const schemaDir = `./utils/schema/${version}`;
    const arr = [];
    for await (const f of Deno.readDir(schemaDir)) {
      const m = f.name.match(/^(.+)\.yaml$/);
      if (!m) {
        continue;
      }
      arr.push({
        name: m[1],
        schema: Object.assign(
          { $id: this.schemaUrl(version, m[1]) },
          await _yamlLoad([schemaDir, f.name].join("/")),
        ),
      });
    }
    return arr.sort((x, y) => x.name > y.name ? 1 : -1);
  }
  schemaUrl(version = "1", type = "index") {
    return `${this.publicUrl}/schema/${version}/${type}.json`;
  }
  entriesList() {
    return this.entries.map((e) => e.id);
  }
}

class DeConf_Package {
  constructor(id, engine) {
    this.id = id;
    this.data = null;
    this.engine = engine;
    this.colMapper = {
      unions: "union",
      events: "event",
      "media-partners": "media-partner",
      benefits: "benefit",
    };
    this.collections = Object.keys(this.colMapper);
  }

  async load(specDir) {
    const pkg = {};
    // load year index
    pkg.index = await _tomlLoad([...specDir, "index.toml"].join("/"));
    pkg.index.dataUrl = [this.engine.publicUrl, this.id].join("/");
    pkg.index.dataGithubUrl = [this.engine.githubUrl, this.id].join("/");
    //console.log(`\n##\n## [${pkg.index.name}] \n##`);
    // load sub-events

    for (const colPlural of this.collections) {
      pkg[colPlural] = await this.loadCollection(specDir, colPlural);
    }

    this.data = pkg;
  }
  async write(dir) {
    const outputDir = [dir, this.id].join("/");
    await emptyDir(outputDir);
    await this.assetsWrite(outputDir);
    await _jsonWrite([outputDir, "index.json"], this.toJSON());
  }
  async loadCollection(specDir, type) {
    const arr = [];
    for await (const ef of Deno.readDir([...specDir, type].join("/"))) {
      const m = ef.name.match(/^([\w\d\-]+)(\.toml|)$/);
      if (!m) continue;
      const ev = new DeConf_Collection(type, m[1]);
      await ev.load([...specDir, type, ef.name]);
      arr.push(ev);
    }
    return arr;
  }
  async assetsWrite(outputDir) {
    for (const colName of this.collections) {
      const dir = [outputDir, "assets", colName].join("/");
      await emptyDir(dir);
      for (const item of this.data[colName]) {
        await item.assetsWrite(
          dir,
          [this.engine.publicUrl, this.id, "assets", colName].join(
            "/",
          ),
        );
      }
    }
  }
  toJSON() {
    return Object.assign({ id: this.id }, this.data.index, {
      unions: this.data.unions,
      events: this.data.events,
      "media-partners": this.data["media-partners"],
      benefits: this.data["benefits"],
      time: new Date(),
    });
  }
}

class DeConf_Collection {
  constructor(type, id) {
    this.type = type;
    this.id = id;
    this.data = null;
    this.dir = null;
    this.assets = ["logo"];
  }

  async load(path) {
    let fn;
    if (path[path.length - 1].match(/^(.+)\.toml$/)) {
      fn = path;
    } else {
      this.dir = path.join("/");
      fn = [...path, "index.toml"];
    }

    const efIndex = await _tomlLoad(fn.join("/"));
    const data = {
      index: { id: this.id, ...efIndex },
    };
    if (this.dir) {
      const syncDataFn = [this.dir, "data.json"].join("/");
      if (await exists(syncDataFn)) {
        data.sync = await _jsonLoad(syncDataFn);
      }
      for (const asset of this.assets) {
        if (data.index[asset]) {
          const assetFn = [this.dir, data.index[asset]].join("/");
          if (!await exists(assetFn)) {
            throw new Error(`Asset not exists: ${assetFn}`);
          }
        }
      }
    }
    this.data = data;
  }

  async sync() {
    const syncFile = [this.dir, "_sync.js"].join("/");
    if (!await exists(syncFile)) return null;
    if (!_silentMode) console.log(`syncing ${this.id} ..`);
    const module = await import("../" + syncFile);
    // data
    if (module.data) {
      const data = await module.data(syncTools);
      if (!JSON.stringify(data)) {
        return null;
      }

      if (data.speakers) {
        const photosDir = [this.dir, "photos"].join("/");
        await emptyDir(photosDir);
        for (const sp of data.speakers) {
          if (!sp.photoUrl) continue;
          const photoFetch = await fetch(sp.photoUrl);
          const ext = await posix.extname(sp.photoUrl);
          const dir = [photosDir, "speakers"].join("/");
          await ensureDir(dir);
          const nameId = sp.id || sp.name.toLowerCase().replace(/ /g, "-");
          if (photoFetch.body) {
            const ffn = (sp.id ? sp.id : nameId) + ext;
            const fn = [dir, ffn].join("/");
            console.log(`${fn} writed`);
            const file = await Deno.open(fn, { write: true, create: true });
            await photoFetch.body.pipeTo(file.writable);
            sp.photo = ["photos", "speakers", ffn].join("/");
          }
        }
      }
      await _jsonWrite([this.dir, "data.json"].join("/"), data);
      this.data.sync = data;
    }
  }

  async assetsWrite(outputDir, publicUrl) {
    for (const asset of this.assets) {
      if (!this.data.index[asset]) continue;
      const fnIn = this.data.index[asset];
      const fnOut = [this.id, this.data.index[asset]].join("/");
      await emptyDir([outputDir, this.id].join("/"));
      await _fileCopy([this.dir, fnIn].join("/"), [outputDir, fnOut].join("/"));
      const url = [publicUrl, fnOut].join("/");
      this.data.index[asset] = url;
    }
    if (this.data.sync && this.data.sync.speakers) {
      const outDir = [outputDir, this.id, "photos", "speakers"].join("/");
      await ensureDir(outDir);
      for (const sp of this.data.sync.speakers) {
        if (!sp.photo) continue;
        const srcFile = [this.dir, sp.photo].join("/");
        if (await exists(srcFile)) {
          const outFile = [
            outDir,
            posix.basename(sp.photo),
          ].join("/");
          await _fileCopy(srcFile, outFile);
          sp.photoUrl = [
            publicUrl,
            this.id,
            "photos",
            "speakers",
            posix.basename(sp.photo),
          ].join("/");
        }
      }
    }
  }

  toJSON() {
    return Object.assign({ id: this.id }, this.data.index, this.data.sync);
  }
}

async function _fileCopy(from, to) {
  await copy(from, to, { overwrite: true });
  if (!_silentMode) {
    console.log(`${from} copied to ${to}`);
  }
  return true;
}
async function _tomlLoad(fn) {
  return tomlParse(await Deno.readTextFile(fn));
}
async function _yamlLoad(fn) {
  return yamlLoad(await Deno.readTextFile(fn));
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
async function _jsonLoad(fn) {
  return JSON.parse(await Deno.readTextFile(fn));
}
