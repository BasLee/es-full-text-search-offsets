import {describe} from "vitest";
import {parseHits} from "./parseHits.ts";
import { expect, it } from 'vitest';
import { END_MARKER as E, START_MARKER as S } from './markers.ts';
import type {Hit} from "./Model.ts";

describe(parseHits.name, () => {


  it('pairs the source body with its spans', () => {
    const hits: Hit[] = [
      {
        _id: '1',
        _source: { content: 'baz foo bar' },
        highlight: { content: [`baz ${S}foo${E} bar`] },
      },
    ];
    expect(parseHits(hits)).toEqual([
      { id: '1', body: 'baz foo bar', spans: [{ start: 4, end: 7 }] },
    ]);
  });

})