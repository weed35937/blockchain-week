const peopleMapper = {
  "Radek Svarz": { country: "cz" },
  "Naim Ashhab": { country: "cz" },
  "Marc Zeller": { country: "fr", twitter: "lemiscate" },
  "Sasha Tanase": { country: "ro" },
  "Rosco Kalis": { country: "nl" },
  "Will Harborne": { country: "gb" },
  "Anna George": { country: "pt" },
  "Julien Bouteloup": { country: "ch" },
  "Stanislav Šimek": { country: "cz" },
  "Pavel Machalek": { country: "cz" },
};

export async function data($) {
  const res = await $.loadJSONUrl(
    "https://graphql.contentful.com/content/v1/spaces/6j1me6tz5h39/environments/master",
    {
      method: "POST",
      body: JSON.stringify({
        query: `
          { 
            pragueDefiSummitPeopleSortedCollection(limit: 1) {
                  items {
                    pdsPeopleSortedCollection {
                          items {
                              sys { id }
                              ... on PragueDefiSummitPeople {
                                  sys { id }
                                  name
                                  twitter
                                  company
                                  role
                                  profileImage {
                                      sys {
                                          publishedAt
                                          id
                                      }
                                      fileName
                                      url
                                  }
                              }
                          }
                      }
                  }
              }
          }`,
      }),
      headers: {
        "content-type": "application/json",
        authorization: "Bearer 7xdKQm9l5CXQE6tXXKYxNQ_lgvanmpdUgT20pIlxfOk",
      },
    },
  );
  return {
    speakers: res.data.pragueDefiSummitPeopleSortedCollection.items[0]
      .pdsPeopleSortedCollection.items.map((s) =>
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
