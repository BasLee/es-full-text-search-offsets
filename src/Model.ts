export interface Offsets {
  start: number;
  end: number;
}

export interface Doc {
  id: string;
  body: string;
  spans: Offsets[];
}

export interface Hit {
  _id: string;
  _source?: Record<string, string | string[]>;
  highlight?: Record<string, string[]>;
}

export interface SearchResult {
  hits: { hits: Hit[] };
}