import {parseHits} from "./parseHits.ts";
import {searchEs} from "./searchEs.ts";

await main();

async function main(): Promise<void> {
  const result = await searchEs('bar');

  for (const doc of parseHits(result.hits.hits)) {
    console.log(`doc ${doc.id}:`, `\n--> body:`, doc.body);
    for (const span of doc.spans) {
      const sliced = doc.body.slice(span.start, span.end);
      console.log(`--> hit: ${sliced} (${span.start}-${span.end})`);
    }
  }
}
