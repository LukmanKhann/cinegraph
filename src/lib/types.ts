export interface MovieSummary {
  id: string;
  title: string;
  year: number;
  tagline?: string | null;
  runtimeMinutes?: number | null;
  genres: string[];
  cast: string[];
}

export interface PersonSummary {
  id: string;
  name: string;
  born?: number | null;
}

export interface CastMember {
  id: string;
  name: string;
  role: string | null;
  order: number | null;
}

export interface DirectorSummary {
  id: string;
  name: string;
}

export interface MovieDetail {
  id: string;
  title: string;
  year: number;
  tagline: string | null;
  runtimeMinutes: number | null;
  genres: string[];
  cast: CastMember[];
  directors: DirectorSummary[];
}

export interface Recommendation {
  movie: MovieSummary;
  sharedActors: number;
  sharedGenres: number;
}

export interface FilmographyItem {
  id: string;
  title: string;
  year: number;
  role: string | null;
  order: number | null;
  director: string | null;
  genres: string[];
}

export interface PersonDetail {
  id: string;
  name: string;
  born: number | null;
  actedIn: FilmographyItem[];
  directed: FilmographyItem[];
}

export interface CoStar {
  id: string;
  name: string;
  moviesTogether: number;
  with: string[];
}

export interface GraphNode {
  id: string;
  kind: "movie" | "person";
  label: string;
  sub?: string | null;
  year?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  role?: string | null;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ConnectionStep {
  from: string;
  fromId: string;
  fromKind: "person" | "movie";
  to: string;
  toId: string;
  toKind: "person" | "movie";
  via: string;
  viaId: string;
  viaKind: "person" | "movie";
  relation: string;
  detail: string;
}

export interface ConnectionResult {
  found: boolean;
  depth: number;
  graph: GraphData;
  steps: ConnectionStep[];
  fromId: string;
  toId: string;
}

export interface BrowseData {
  movies: MovieSummary[];
  stats: { movies: number; people: number; relationships: number };
}

export interface ApiError {
  error: { code: string; message: string };
}
