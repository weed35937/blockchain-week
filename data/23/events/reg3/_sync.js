const peopleMapper = {
  "Ondřej Kovařík": { country: "cz" },
  "František Vinopal": { country: "cz" },
  "Tomáš Olexa": { country: "cz" },
  "Ondřej Dusílek": { country: "cz" },
  "Dalibor Černý": { country: "cz" },
  "Michal Matějka": { country: "cz" },
  "Jakub Tesař": { country: "cz" },
  "Štěpán Kouba": { country: "cz" },
  "David Stancel": { country: "sk" },
  "Štěpán Kouba": { country: "cz" },
  "Lukáš Kovanda": { country: "cz" },
  "Radek Švarz": { country: "cz" },
};

export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://prague.reg3.eu/speakers");
  const out = { speakers: [] };
  for (const el of $('div.section.speakers div[role="listitem"]').toArray()) {
    const name = $("h2", el).text();

    const item = {
      id: tools.formatId(name),
      name,
      caption: $("h3", el).toArray().map((x, i) => {
          let t = $(x).text().trim()
          if (!t.match(/^at /) && i !== 0) {
            t = (', ' + t)
          } else {
            t = ' ' + t
          }
          return t
        }).join("").trim(),
      twitter: $('a[href^="https://twitter.com"]', el).attr("href")?.replace(
        "https://twitter.com/",
        "",
      ),
      linkedin: $('a[href^="https://www.linkedin.com/in/"]', el).attr("href")?.replace(
        "https://www.linkedin.com/in/",
        "",
      ).replace(/\/$/, ''),
      photoUrl: $('img[loading="lazy"]', el).attr("src"),
    };

    if (peopleMapper[name]) {
      Object.assign(item, peopleMapper[name]);
    }
    out.speakers.push(item);
  }

  return out;
}
