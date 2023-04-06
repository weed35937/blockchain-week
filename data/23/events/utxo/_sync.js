export async function data($) {
  const bundle = await $.loadJSONUrl("https://spec.utxo.cz/23/bundle.json");
  return {
    speakers: bundle.spec.speakers.map((s) => {
      if (s.photos && s.photos[0]) {
        const [tp, ext] = s.photos[0].split(":");
        s.photoUrl =
          `https://spec.utxo.cz/23/photos/speakers/${s.id}-${tp}.${ext}`;
      }
      return s;
    }),
    tracks: bundle.spec.tracks,
  };
}
