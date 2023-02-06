const peopleMapper = {
  "Radek Svarz": { country: "cz" },
  "Naim Ashab": { country: "cz " },
};

export async function data($) {
  const res = await $.loadJSONUrl(
    "https://graphql.contentful.com/content/v1/spaces/6j1me6tz5h39/environments/master",
    {
      method: "POST",
      body: JSON.stringify({
        query:
          "{ pragueDefiSummitCollection(limit: 1) { items { pitchDeck { url } twitterLink discordLink telegramLink applyToSpeakLink applyToSpeakLabel duckTapeLink paralelniPolisLink manifestoText { json links { entries { block { sys { id } } } assets { block { sys { id } url title width height } } } } } } pragueDefiSummitPeopleCollection { items { sys { id } name twitter company profileImage { sys { publishedAt id } fileName url } } } }",
      }),
      headers: {
        "content-type": "application/json",
        authorization: "Bearer 7xdKQm9l5CXQE6tXXKYxNQ_lgvanmpdUgT20pIlxfOk",
      },
    },
  );
  return {
    speakers: res.data.pragueDefiSummitPeopleCollection.items.map((s) =>
      Object.assign({
        id: $.formatId(s.name),
        name: s.name,
        twitter: s.twitter.replace("https://twitter.com/", ""),
        caption: s.company || "",
        photoUrl: s.profileImage?.url,
      }, peopleMapper[s.name] || {})
    ),
  };
}
