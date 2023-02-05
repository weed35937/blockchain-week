const d = new Date();
const tag = `v${d.getFullYear()}.${("0" + (d.getMonth() + 1)).slice(-2)}.${
  ("0" + d.getDate()).slice(-2)
}`;
const p = Deno.run({ cmd: ["git", "tag"], stdout: "piped" });
const current = String.fromCharCode.apply(null, await p.output()).trim();
const m = current.match(new RegExp(`${tag}`, "g"));
const num = m ? m.length : 0;
console.log(`TAG=${tag}-r${num}`);
