const ES = process.env.ES_URL ?? 'http://localhost:9200';
const INDEX = 'demo';

/**
 * 'Private Use Area' characters:
 */
const START_MARKER = '\ue000';
const END_MARKER = '\ue001';
const MARKERS = /[\ue000\ue001]/g;

main()

async function main() {
  const result = await searchEs('bar');

  for (const doc of parse(result)) {
    console.log(`doc ${doc.id}:`, `\n--> body:`, doc.body);
    for (const span of doc.spans) {
      const sliced = doc.body.slice(span.start, span.end);
      console.log(`--> hit: ${sliced} (${span.start}-${span.end})`);
    }
  }
}


async function searchEs(term) {
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

async function fetchEs(path, body, method = 'POST') {
  const res = await fetch(`${ES}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function findOffsets(textWithMarkers) {
  const spans = [];
  let removed = 0;
  let start = -1;

  for (const match of textWithMarkers.matchAll(MARKERS)) {
    const offset = match.index - removed;
    removed += 1;
    if (match[0] === START_MARKER) {
      start = offset;
    } else {
      spans.push({ start, end: offset });
    }
  }
  return spans;
}

function parse(result, field = 'content') {
  return result.hits.hits.flatMap((hit) => {
    const marked = hit.highlight?.[field];
    if (!marked) {
      return [];
    }
    const source = hit._source?.[field];
    const values = Array.isArray(source) ? source : [source];
    if (values.length !== marked.length) {
      throw new Error(`${hit._id}: ${marked.length} reported but ${values.length} found in ${field}`);
    }
    return marked.map((value, i) => ({
      id: hit._id,
      body: values[i],
      spans: findOffsets(value),
    }));
  });
}
