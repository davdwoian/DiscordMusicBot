// @ts-nocheck

import { bold, quote, blockQuote, inlineCode, codeBlock } from 'discord.js';
import got from 'got';
import { current, custom } from '../util/date';

const URL_TIMETABLE_API = 'https://animeschedule.net/api/v3/timetables/raw?tz=Asia/Shanghai';
const URL_ANIMELIST_API = 'https://animeschedule.net/api/v3/animelists';

function filterFeed(tb, al) {
  let feed = new Set(al.map(x => x['route']));
  return tb.filter((x) => feed.has(x['route']));
}

function filterDate(tb, dobj) {
  return tb.filter((x) => x['episodeDate'].includes(dobj.ISO));
}

async function reqTimetable() {
  let obj = await got(URL_TIMETABLE_API, { json: true });
  return obj.body;
}

async function reqAnimelist(id) {
  let obj = await got(`${URL_ANIMELIST_API}/${id}`, { json: true });
  return Object.keys(obj.body.shows).map(k => obj.body.shows[k]);
}

function animeToString(obj) {
  return [bold(obj['japanese']), inlineCode(obj['episodeDate'].split('T')[1].split('+')[0])]
    .map(quote)
    .join('\n')
    .concat('\n');
}

export async function dailyFeed(id) {
  let dobj = await current();
  let strhead = codeBlock(` | ${dobj.ISO} | ${dobj.DAY} | `);
  let strbody;

  try {
    let tb = await reqTimetable();
    let al = await reqAnimelist(id);

    strbody = filterDate(filterFeed(tb, al), dobj).map(animeToString).join('\n');
  } catch {
    strbody = blockQuote('No Schedule Retrieved');
  }

  return `${strhead}\n${strbody}`;
}

export async function weeklyFeed(id) {
  try {
    let tb = await reqTimetable();
    let al = await reqAnimelist(id);

    let cont = {};
    filterFeed(tb, al).forEach(x => {
      let dobj = custom(...(x['episodeDate'].slice(0, 10).split('-').map(x => parseInt(x))));
      let strhead = codeBlock(` | ${dobj.ISO} | ${dobj.DAY} | `);

      if (cont[strhead]) {
        cont[strhead].push(animeToString(x));
      } else {
        cont[strhead] = [animeToString(x)];
      }
    });

    return Object.keys(cont).map(k => `${k}\n${cont[k].join('\n')}`).join('\n');
  } catch {
    return blockQuote('No Schedule Retrieved');
  }
}