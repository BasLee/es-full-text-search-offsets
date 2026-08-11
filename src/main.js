import {parseHits} from "./parseHits.js";
import {searchEs} from "./searchEs.js";

const ES = process.env.ES_URL ?? 'http://localhost:9200';
const INDEX = 'demo';

/**
 * 'Private Use Area' characters:
 */
const START_MARKER = '\ue000';
const END_MARKER = '\ue001';
const MARKERS = new RegExp(`[${START_MARKER}${END_MARKER}]`, 'g');

main()

async function main() {
  const result = await searchEs('bar');

  for (const doc of parseHits(result.hits.hits)) {
    console.log(`doc ${doc.id}:`, `\n--> body:`, doc.body);
    for (const span of doc.spans) {
      const sliced = doc.body.slice(span.start, span.end);
      console.log(`--> hit: ${sliced} (${span.start}-${span.end})`);
    }
  }
}

