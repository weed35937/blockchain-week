export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://www.btcprague.com/speakers");
  //const $ = await tools.loadHtmlLocal(new URL('.', import.meta.url).pathname + "./btcprague.html");
  const out = { speakers: [] };

  const peopleMapper = {
    "Dušan Matuška": { country: "sk" },
  };

  for (const el of $(".speaker").toArray()) {
    const value = (path) => cleanup($(path, el).text());
    const name = value("h3");
    const link = $("a", el).attr("href");

    const $$ = await tools.loadHtmlUrl(link);
    const sp = $$(".container.pt-5");

    const item = {
      id: link.match(/speakers\/(.+)\/$/)[1],
      name,
      photoUrl: $("img", el).attr("src"),
      caption: value(".popis"),
      twitter: $$("a.twitter", sp).attr("href")?.replace(
        "https://twitter.com/",
        "",
      ),
      linkedin: $$("a.linkedIn", sp).attr("href")?.replace(
        "https://www.linkedin.com/in/",
        "",
      ).replace(/\/$/, ""),
      tag: value(".taxTag "),
      //country: 'xx',
      desc: $$("p", sp).text(),
      web: { url: $$(".www", sp).attr("href") },
      link,
    };

    if (peopleMapper[name]) {
      Object.assign(item, peopleMapper[name]);
    }
    out.speakers.push(item);
  }
  return out;
}

function cleanup(str) {
  return str.replace(/(\s{2,}|\n)/g, " ").trim();
}
