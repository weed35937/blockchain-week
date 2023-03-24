const peopleMapper = {
    "dcbuilder-eth": { country: "cz" },
    "luc-computer": { country: "nl" },
    "ferit-tuncer": { country: "pt" },
    "puncar": { country: "us" },
    "miao-zhicheng": { country: "ee" },
    "cryptowanderer": { country: "za" },
    //"daniel-lumi": { country: "" },
    "nicolas-manea": { country: "gb" }
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
            }`
        }),
        headers: {
          "content-type": "application/json",
          authorization: "Bearer 7xdKQm9l5CXQE6tXXKYxNQ_lgvanmpdUgT20pIlxfOk",
        },
      },
    );
    return {
      speakers: res.data.ethPraguePeopleSortedCollection.items[0].ethPraguePeopleSortedCollection.items.map((s) =>
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
  