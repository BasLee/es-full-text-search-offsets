import { describe, expect, it } from 'vitest';
import { findOffsets } from './findOffsets.ts';
import { END_MARKER as E, START_MARKER as S } from './markers.ts';

describe(findOffsets.name, () => {
  it('returns a span for a single marked hit', () => {
    expect(findOffsets(`baz ${S}foo${E} bar`)).toEqual([{ start: 4, end: 7 }]);
  });

  it('returns offsets that index back into the unmarked text', () => {
    const body = 'baz foo bar';
    const [span] = findOffsets(`baz ${S}foo${E} bar`);
    expect(body.slice(span!.start, span!.end)).toBe('foo');
  });

  it('shifts later hits by the markers already removed', () => {
    expect(findOffsets(`${S}foo${E} bar ${S}foo${E}`)).toEqual([
      { start: 0, end: 3 },
      { start: 8, end: 11 },
    ]);
  });

  it('returns nothing when the text has no markers', () => {
    expect(findOffsets('baz foo bar')).toEqual([]);
  });

  it('counts astral characters without desyncing the offsets', () => {
    const body = '𝄞 baz foo';
    const [span] = findOffsets(`𝄞 baz ${S}foo${E}`);
    expect(body.slice(span!.start, span!.end)).toBe('foo');
  });

  it('throws on an unclosed start marker', () => {
    expect(() => findOffsets(`${S}foo`)).toThrow(/unclosed/i);
  });

  it('throws on an end marker without a start', () => {
    expect(() => findOffsets(`foo${E}`)).toThrow(/without start/i);
  });

  it('throws on a nested start marker', () => {
    expect(() => findOffsets(`${S}${S}foo${E}`)).toThrow(/nested/i);
  });
});