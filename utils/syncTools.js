export async function loadJSONUrl(url) {
  const resp = await fetch(url);
  const data = await resp.json();
  return data;
}
