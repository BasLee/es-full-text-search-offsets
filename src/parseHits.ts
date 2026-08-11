import { findOffsets } from './findOffsets.ts';
import type { Doc, Hit } from './Model.ts';

export function parseHits(hits: Hit[], field = 'content'): Doc[] {
  return hits.flatMap((hit) => {
    const marked = hit.highlight?.[field];
    if (!marked) {
      return [];
    }
    const source = hit._source?.[field];
    const values = Array.isArray(source) ? source : [source];
    return marked.map((value, i) => {
      const body = values[i];
      if (body === undefined) {
        throw new Error(`${hit._id}: no source value for highlight ${i} in ${field}`);
      }
      return {
        id: hit._id,
        body,
        spans: findOffsets(value),
      };
    });
  });
}