const peopleMapper = {
  "Ondřej Kovařík": { country: "cz" },
  "František Vinopal": { country: "cz" },
  "Tomáš Olexa": { country: "cz" },
  "Ondřej Dusílek": { country: "cz" },
  "Dalibor Černý": { country: "cz" },
  "Michal Matějka": { country: "cz" },
  "Jakub Tesař": { country: "cz" },
};

export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://prague.reg3.eu/speakers");
  const out = { speakers: [] };

  for (const el of $('div.w-dyn-items[role="list"] div.team-card').toArray()) {
    const name = $("h6", el).text();

    const item = {
      id: tools.formatId(name),
      name,
      caption: $("p.team-member-position", el).toArray().map((x) => $(x).text())
        .join(" ").trim(),
      twitter: $('a[href^="https://twitter.com"]', el).attr("href")?.replace(
        "https://twitter.com/",
        "",
      ),
      photoUrl: $("img.team-card-image", el).attr("src"),
    };

    if (peopleMapper[name]) {
      Object.assign(item, peopleMapper[name]);
    }
    out.speakers.push(item);
  }

  return out;
}
