import { config } from "https://deno.land/x/dotenv/mod.ts";
import SimpleTwitter from "https://raw.githubusercontent.com/burningtree/twit-deno/master/simple_twitter_deno.ts";
import { Table } from "https://deno.land/x/cliffy@v0.20.1/table/mod.ts";

import { ensureDir, exists } from "https://deno.land/std@0.173.0/fs/mod.ts";

const CACHE_DIR = "./cache/twitter-stats";

import { DeConfEngine } from "./engine.js";

const options = {};
if (Deno.args[0] === "true") {
  options.hiddenAllowed = ["bitcoin-prague"];
}

const dc = new DeConfEngine(options);
await dc.init();

// pick last entry (eq. "23")
const entry = dc.entries[dc.entries.length - 1];
console.log(`entry=${entry.id}`);

config({ path: ".env", export: true });

const simple_twitter = new SimpleTwitter({
  consumer_key: Deno.env.get("CONSUMER_KEY"),
  consumer_secret: Deno.env.get("CONSUMER_SECRET"),
  access_token: Deno.env.get("ACCESS_TOKEN"),
  access_token_secret: Deno.env.get("ACCESS_TOKEN_SECRET"),
  bearer_token: Deno.env.get("BEARER_TOKEN"),
});

async function twitterUser(screen_name) {
  console.log(`>> getting user: ${screen_name}`);

  await ensureDir(CACHE_DIR);
  const hash = Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        (new TextEncoder()).encode(screen_name),
      ),
    ),
  ).map((b) => b.toString(16).padStart(2, "0")).join("");
  const cacheFn = `${CACHE_DIR}/${hash}`;

  if (await exists(cacheFn)) {
    console.log(`Cache found! ${hash}`);
    return JSON.parse(await Deno.readTextFile(cacheFn));
  }

  let resp;
  try {
    resp = await simple_twitter.get("users/lookup", { screen_name });
  } catch {}
  let output = null;
  if (resp && resp.length === 1) {
    output = resp[0];
  }
  await Deno.writeTextFile(cacheFn, JSON.stringify(output, null, 2));
  return output;
}

const twitterUsers = {};

let i = 0;
let total = 0;
for (const event of entry.data.events) {
  const ev = event.toJSON();

  if (!ev.speakers) {
    continue;
  }
  console.log(`event ${i}/${entry.data.events.length} [${ev.id}]`);
  for (const s of ev.speakers) {
    if (s.twitter) {
      const user = await twitterUser(s.twitter);
      if (user) {
        if (!twitterUsers[s.twitter]) {
          twitterUsers[s.twitter] = [0, []];
        }
        twitterUsers[s.twitter][0] += Number(user.followers_count);
        twitterUsers[s.twitter][1].push(ev.id);
        total += Number(user.followers_count) || 0;
      }
    }
  }
  //if (Object.keys(twitterUsers).length > 1) { break; }
  i += 1;
}

console.log(".. done\n");

const arr = Object.keys(twitterUsers)
  .map((u) => ["@" + u, twitterUsers[u][0], twitterUsers[u][1]])
  .sort((x, y) => x[1] < y[1] ? 1 : -1);

arr.push([], ["total", total, ""]);
const table = Table.from(arr);
console.log("\nTwitter followers count:\n\n" + table.toString() + "\n");
