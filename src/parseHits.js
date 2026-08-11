export function parseHits(hits, field = 'content') {
  return hits.flatMap((hit) => {
    const marked = hit.highlight?.[field];
    if (!marked) {
      return [];
    }
    const source = hit._source?.[field];
    const values = Array.isArray(source)
      ? source
      : [source];
    return marked.map((value, i) => ({
      id: hit._id,
      body: values[i],
      spans: findOffsets(value),
    }));
  });
}