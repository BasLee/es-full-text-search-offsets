import { END_MARKER, MARKERS, START_MARKER } from './markers.ts';
import type { Offsets } from './Model.ts';

export function findOffsets(
  textWithMarkers: string
): Offsets[] {
  const offsets: Offsets[] = [];
  let removed = 0;
  let start = -1;

  for (const match of textWithMarkers.matchAll(MARKERS)) {
    const offset = match.index - removed;
    removed += 1;
    if (match[0] === START_MARKER) {
      if (start !== -1) {
        throw new Error(`Nested start marker at ${offset}`);
      }
      start = offset;
    } else {
      if (start === -1) {
        throw new Error(`End marker without start at ${offset}`);
      }
      offsets.push({ start, end: offset });
      start = -1;
    }
  }
  if (start !== -1) {
    throw new Error(`Unclosed start marker at ${start}`);
  }
  return offsets;
}