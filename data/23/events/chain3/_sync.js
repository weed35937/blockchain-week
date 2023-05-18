const CZ_PEOPLE = [
  "Tomáš Urban",
  "Julie Šislerová",
];

const peopleMapper = {};

export async function data(tools) {
  const $ = await tools.loadHtmlUrl("https://www.chain3events.xyz/");
  const out = { speakers: [] };

  for (const el of $("li.user-items-list-carousel__slide").toArray()) {
    const name = $("h2", el).text().trim();

    const item = {
      id: tools.formatId(name),
      name,
      caption: $("div.list-item-content__text-wrapper p", el).text().trim(),
      photoUrl: $("img.user-items-list-carousel__media", el).attr("data-src"),
      country: "sk",
    };

    if (peopleMapper[name]) {
      Object.assign(item, peopleMapper[name]);
    }
    if (CZ_PEOPLE.includes(name)) {
      item.country = "cz";
    }
    out.speakers.push(item);
  }

  return out;
}
