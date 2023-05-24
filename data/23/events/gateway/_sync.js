export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://gateway.events/");
  const out = { speakers: [] };

  const peopleMapper = {
    "Federico Kunze Küllmer": { country: "de" },
    "Sunny Aggarwal": { country: "tw" },
    "Zaki Manian": { country: "us" },
    "Sergey Gorbunov": { country: "us" },
    "Dean Tribble": { country: "us" },
    "Sean Braithwaite": { country: "de" },
    "Viktor Fischer": { country: "cz" },
    "Marek Sandrik": { country: "cz" },
    "Filip Siroky": { country: "cz" },
    "Adam Bilko": { country: "cz" },
    "Juraj Petro": { country: "sk" },
    "Marta Adamczyk": { country: "nz" },
    "Martin Vejmelka": { country: "cz" },
  };

  for (const el of $("#speakers div.w-full.relative").toArray()) {
    const value = (path) => cleanup($(path, el).text());
    const name = value("h3 span");
    if (!name) {
      continue
    }
    const item = {
      id: tools.formatId(name),
      name,
      photoUrl: $("div.group img", el).attr("src"),
      caption: value("div.text-white"),
      twitter: $("div.flex a", el).attr("href")?.replace(
        "https://twitter.com/",
        "",
      ).replace(/\?lang=\w{2}$/, ""),
      //linkedin: $$("a.linkedIn", sp).attr("href")?.replace("https://www.linkedin.com/in/","").replace(/\/$/,""),
      //tag: value(".taxTag "),
      //country: 'xx',
      //desc: $$('p', sp).text(),
      //web: { url: $$(".www", sp).attr("href") },
      //link
    };

    if (peopleMapper[name]) {
      Object.assign(item, peopleMapper[name]);
    }
    out.speakers.push(item);
  }
  //console.log(out)
  return out;
}

function cleanup(str) {
  return str.replace(/(\s{2,}|\n)/g, " ").trim();
}
