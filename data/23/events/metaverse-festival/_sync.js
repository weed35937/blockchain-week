import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";

const peopleMapper = {
  "Adam Rajnoha": { country: "cz" },
  "David Mařák": { country: "cz" },
  "Filip Kolert": { country: "cz" },
  "Honza Borýsek": { country: "cz" },
  "Iraida Novruzova": { country: "az" },
  "Inna Fetissova": { country: "cz" },
  "Juraj Kováč": { country: "sk" },
  "Martin Sokol": { country: "cz" },
  "Natália Rajnohová": { country: "sk" },
  "Olska Green": { country: "pt" },
  "Ondrej T.": { country: "sk" },
  "Pavla Julia Kolářová": { country: "cz" }, 
  "Sara Polak": { country: "cz" }, 
  "Thomas De Bruyne": { country: "be" }, 
  "Timmu Toke": { country: "us" },
  "Julie Šislerová": { country: "cz" }, 
};

export async function data(tools) {
    const $ = await tools.loadHtmlUrl("https://metaversefestivalprague.com/");
    const out = { speakers: [] };

    for (const el of $("div.elementor-col-16").toArray()) {
      const name = cleanupName($('h3 span', el).html())
      if (name === "Reveal Soon") {
        continue;
      }
  
      const item = {
        id: tools.formatId(name),
        name,
        caption: $('p.elementor-icon-box-description', el).text().trim(),
        photoUrl:  $('div.elementor-widget-container img', el).attr('src'),        
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