export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://www.btcprague.com/");
  const out = { speakers: [] };
  for (const el of $(".speaker").toArray()) {
    const value = (path) => cleanup($(path, el).text());
    out.speakers.push({
      name: value("h3"),
      photoUrl: $("img", el).attr("src"),
      bio: value(".popis"),
      twitter: $(".twitter", el).attr("href")?.replace("https://twitter.com/",""),
      web: $(".www", el).attr("href") ? { url: $(".www", el).attr("href") } : undefined,
    });
  }
  return out;
}

function cleanup(str) {
  return str.replace(/(\s{2,}|\n)/g, " ").trim();
}