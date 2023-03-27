import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";

export async function data(tools) {
    const $ = await tools.loadHtmlUrl("https://metaversefestivalprague.com/");
    const out = { speakers: [] };
  
    const peopleMapper = {
      'Dušan Matuška': { country: 'sk' }
    }
  
    for (const el of $("div.elementor-col-16").toArray()) {
      const name = cleanupName($('h3 span', el).html())
      if (name === "Reveal Soon") {
        continue;
      }
  
      const item = {
        id: tools.formatId(name),
        name,
        caption: $('p.elementor-icon-box-description', el).text().trim(),
        photoUrl:  $('img.attachment-large', el).attr('src'),        
      }
  
      if (peopleMapper[name]) {
        Object.assign(item, peopleMapper[name])
      }
      out.speakers.push(item);
    }

    return out;
  }

  function cleanupName (str) {
    return Html5Entities.decode(str.trim())
        .replace(/\s?<br>\s?/, ' ')
        .toLowerCase()
        .split(' ')
        .map(str => str.charAt(0).toUpperCase() + str.slice(1))
        .join(' ')
  }