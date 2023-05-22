const peopleMapper = {
  "Daniel Vaculík": { country: "cz" },
  "Marta Adamczyk": { country: "nz" },

  "Filip": { id: "filip-bd", country: "cz" },
  "Jan Zibner": { country: "cz" },
  "Jana Kubátová": { country: "cz" },

};

export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://polkadotnft.xyz/");
  const out = { speakers: [] };

  for (const el of $("div.speakers-slide").toArray()) {
    const name = $("h3", el).text();

    const item = {
      id: tools.formatId(name),
      name,
      caption: $("p.brxe-text-basic", el).toArray().map((e) => $(e).text())
        .join(", "),
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
