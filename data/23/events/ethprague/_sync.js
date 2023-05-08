const peopleMapper = {
  "Dcbuilder.eth": { country: "cz" },
  "Luc.computer": { country: "nl" },
  "Ferit Tunçer": { country: "pt" },
  "Puncar": { country: "us" },
  "Miao ZhiCheng": { country: "ee" },
  "Cryptowanderer": { country: "za" },
  //"Daniel Lumi": { country: "" },
  "Nicolas Manea": { country: "gb" },
  "Tim Beiko": { country: "ca" },
  "Abeer Sharma": { country: "hk" },
  "Dustin Jacobus": { country: "be" },
  "Rhys Williams": { country: "gb" },
  "Sahil Sen": { country: "in" },
  "Steffen Kux": { country: "de" },
  "Michal Převrátil": { country: "cz" },
  "Jan": { id: "jan-jaczkal", country: "cz" },
  "Anett Rolikova": { country: "sk" },
  "Josef Gattermayer ": { country: "cz" },
  "Filip Siroky": { country: "cz" },
  "Radek Svarz": { country: "cz" },
  "Dominik": { id: "schmiddominik" },
};

export async function data($) {
  const res = await $.loadJSONUrl(
    "https://graphql.contentful.com/content/v1/spaces/6j1me6tz5h39/environments/master",
    {
      method: "POST",
      body: JSON.stringify({
        query: `
            { 
                ethPraguePeopleSortedCollection(limit: 1) {
                    items {
                        ethPraguePeopleSortedCollection {
                            items {
                                sys { id }
                                ... on EthPraguePerson {
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
    speakers: res.data.ethPraguePeopleSortedCollection.items[0]
      .ethPraguePeopleSortedCollection.items.map((s) =>
        Object.assign({
          id: $.formatId(s.name),
          name: s.name,
          twitter: s.twitter?.replace("https://twitter.com/", ""),
          caption: s.company || "",
          photoUrl: s.profileImage?.url,
        }, peopleMapper[s.name] || {})
      ).sort((x, y) => x.id > y.id ? -1 : 1),
  };
}
