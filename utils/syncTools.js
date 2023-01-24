import cheerio from "https://esm.sh/cheerio";

export async function loadJSONUrl(url) {
  const resp = await fetch(url);
  return resp.json();
}

export async function loadHtmlUrl(url) {
  const resp = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    },
  });
  return cheerio.load(await resp.text());
}
