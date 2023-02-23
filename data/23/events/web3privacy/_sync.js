
const peopleMapper = {
    //"Radek Svarz": { country: "cz" },
};

export async function data($) {
    const res = await $.loadJSONUrl("https://prague.web3privacy.info/config.json");
    return {
        speakers: res.speakers.map(pid => res.people.find(p => p.id === pid)).map((s) =>
            Object.assign({
                id: $.formatId(s.name),
                name: s.name,
                twitter: s.twitter,
                caption: s.caption,
                country: s.country,
                photoUrl: `https://prague.web3privacy.info/people/${s.img}`,
            }, peopleMapper[s.name] || {})
        ),
    };
}