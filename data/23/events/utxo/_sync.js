export async function data($) {
  const bundle = await $.loadJSONUrl("https://spec.utxo.cz/23/bundle.json");
  return {
    speakers: bundle.spec.speakers,
    tracks: bundle.spec.tracks,
  };
}
