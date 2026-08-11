import { END_MARKER, START_MARKER } from './markers.ts';
import type { SearchResult } from './Model.ts';

const ES = process.env.ES_URL ?? 'http://localhost:9200';
const INDEX = 'demo';

export async function searchEs(term: string): Promise<SearchResult> {
  return fetchEs(`/${INDEX}/_search`, {
    query: { match: { content: term } },
    highlight: {
      fields: {
        // the whole field as a single snippet containing every match:
        content: {
          number_of_fragments: 0,
          pre_tags: [START_MARKER],
          post_tags: [END_MARKER],
        },
      },
    },
  });
}

async function fetchEs(path: string, body?: unknown, method = 'POST'): Promise<SearchResult> {
  const res = await fetch(`${ES}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<SearchResult>;
}