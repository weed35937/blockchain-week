import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";

const peopleMapper = {
  "damsky": { country: "cz" },
  "Petr Mensik": { country: "cz" },
  "vikiival": { country: "sk" },
};

export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://dotprague.xyz/speakers/");
  const out = { speakers: [] };

  for (const el of $("div.brxe-dmokxq.brxe-div").toArray()) {
    const name = $("h3", el).text();

    const item = {
      id: tools.formatId(name),
      name,
      caption: $("a.brxe-text-basic", el).text(),
      twitter: $('a[href^="https://twitter.com"]', el).attr("href")?.replace(
        "https://twitter.com/",
        "",
      ),
      photoUrl: $("img.brxe-image", el).attr("data-src"),
    };

    if (peopleMapper[name]) {
      Object.assign(item, peopleMapper[name]);
    }
    out.speakers.push(item);
  }

  return out;
}
