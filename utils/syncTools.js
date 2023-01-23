import cheerio from "https://esm.sh/cheerio";

export async function loadJSONUrl(url) {
  const resp = await fetch(url);
  return resp.json();
}

export async function loadHtmlUrl(url) {
  const resp = await fetch(url);
  return cheerio.load(await resp.text());
}
