const ES = process.env.ES_URL ?? 'http://localhost:9200';
const INDEX = 'demo';

/**
 * 'Private Use Area' characters:
 */
const START_MARKER = '\ue000';
const END_MARKER = '\ue001';

main()

async function main() {
  const result = await searchEs('bar');

  for (const doc of parse(result)) {
    console.log('doc: ', doc.id, doc.clean);
    for (const span of doc.spans) {
      const sliced = doc.clean.slice(span.start, span.end);
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

function findOffsets(textWithMarkedHits) {
  const spans = [];
  let clean = '';
  let start = -1;

  for (const char of textWithMarkedHits) {
    if (char === START_MARKER) {
      start = clean.length;
    } else if (char === END_MARKER) {
      spans.push({ start, end: clean.length });
    } else {
      clean += char;
    }
  }
  return { clean, spans };
}

function parse(result, field = 'content') {
  return result.hits.hits.flatMap((hit) => {
    const marked = hit.highlight?.[field];
    if (!marked) {
      return [];
    }
    return marked.map((value) => {
      const { clean, spans } = findOffsets(value);
      return { id: hit._id, clean, spans };
    });
  });
}

