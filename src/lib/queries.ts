import type { Record as Neo4jRecord } from "neo4j-driver";
import { runQuery } from "@/lib/neo4j";
import type {
  BrowseData,
  CastMember,
  CoStar,
  ConnectionResult,
  DirectorSummary,
  FilmographyItem,
  GraphData,
  MovieDetail,
  MovieSummary,
  PersonDetail,
  PersonSummary,
  Recommendation,
} from "@/lib/types";

type PropertyBag = { [key: string]: unknown };

const MOVIE_WITH_GENRES = (movieVar = "m") => `
  OPTIONAL MATCH (${movieVar})-[:IN_GENRE]->(g:Genre)
`;

function propsOf(value: unknown): PropertyBag {
  return (value as { properties: PropertyBag }).properties ?? {};
}

function recordToMovieSummary(record: Neo4jRecord): MovieSummary {
  const props = propsOf(record.get("m"));
  return {
    id: props.id as string,
    title: props.title as string,
    year: props.year as number,
    tagline: (props.tagline as string | null) ?? null,
    runtimeMinutes: (props.runtimeMinutes as number | null) ?? null,
    genres: (record.get("genres") as string[]) ?? [],
    cast: (record.get("cast") as string[]) ?? [],
  };
}

/** Search movies by title substring. */
export async function searchMovies(q: string, limit = 12): Promise<MovieSummary[]> {
  const result = await runQuery(
    `MATCH (m:Movie)
     WHERE toLower(m.title) CONTAINS toLower($q)
     ${MOVIE_WITH_GENRES()}
     OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Person)
     WITH m, collect(DISTINCT g.name) AS genres, collect(DISTINCT a.name) AS cast
     RETURN m, genres, cast
     ORDER BY m.year DESC
     LIMIT $limit`,
    { q, limit: Number(limit) },
  );
  return result.records.map(recordToMovieSummary);
}

/** Everything on the home page: recent movies and graph stats. */
export async function browseAll(limit = 24): Promise<BrowseData> {
  const [movieResult, statsResult] = await Promise.all([
    runQuery(
      `MATCH (m:Movie)
       ${MOVIE_WITH_GENRES()}
       OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Person)
       WITH m, collect(DISTINCT g.name) AS genres, collect(DISTINCT a.name) AS cast
       RETURN m, genres, cast
       ORDER BY m.year DESC
       LIMIT $limit`,
      { limit: Number(limit) },
    ),
    runQuery(
      `MATCH (mo:Movie) WITH count(mo) AS movies
       MATCH (p:Person) WITH movies, count(p) AS people
       MATCH ()-[r]->() WITH movies, people, count(r) AS relationships
       RETURN movies, people, relationships`,
      {},
    ),
  ]);
  const movies = movieResult.records.map(recordToMovieSummary);
  const stats = statsResult.records[0];
  return {
    movies,
    stats: {
      movies: (stats?.get("movies") as number) ?? movies.length,
      people: (stats?.get("people") as number) ?? 0,
      relationships: (stats?.get("relationships") as number) ?? 0,
    },
  };
}

/** Full movie detail: cast with character names, directors, genres. */
export async function getMovie(id: string): Promise<MovieDetail | null> {
  const result = await runQuery(
    `MATCH (m:Movie {id: $id})
     OPTIONAL MATCH (d:Person)-[:DIRECTED]->(m)
     OPTIONAL MATCH (c:Person)-[r:ACTED_IN]->(m)
     OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
     RETURN m,
            collect(DISTINCT {id: d.id, name: d.name}) AS directors,
            collect(DISTINCT {id: c.id, name: c.name, role: r.role, order: r.order}) AS cast,
            collect(DISTINCT g.name) AS genres`,
    { id },
  );
  const record = result.records[0];
  if (!record) return null;
  const props = propsOf(record.get("m"));
  const cast = (record.get("cast") as CastMember[])
    .filter((c) => c.id)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return {
    id: props.id as string,
    title: props.title as string,
    year: props.year as number,
    tagline: (props.tagline as string | null) ?? null,
    runtimeMinutes: (props.runtimeMinutes as number | null) ?? null,
    genres: record.get("genres") as string[],
    cast,
    directors: (record.get("directors") as DirectorSummary[]).filter((d) => d.id),
  };
}

/**
 * Two-hop recommendations: other movies reachable through shared actors
 * or shared genres, ranked by overlap. A query a relational schema would
 * need several joins (and a variable number of them) to express.
 */
export async function recommendMoviesFor(movieId: string, limit = 12): Promise<Recommendation[]> {
  const result = await runQuery(
    `MATCH (m:Movie {id: $movieId})
     MATCH (m)<-[:ACTED_IN]-(a:Person)-[:ACTED_IN]->(other:Movie)
     WHERE other.id <> m.id
     WITH m, other, count(DISTINCT a) AS sharedActors
     OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)<-[:IN_GENRE]-(other)
     WITH m, other, sharedActors, count(DISTINCT g) AS sharedGenres
     WHERE sharedActors > 0 OR sharedGenres > 0
     OPTIONAL MATCH (other)<-[:ACTED_IN]-(b:Person)
     RETURN other,
            sharedActors,
            sharedGenres,
            collect(DISTINCT b.name) AS cast
     ORDER BY sharedActors DESC, sharedGenres DESC, other.year DESC
     LIMIT $limit`,
    { movieId, limit: Number(limit) },
  );
  return result.records.map((record) => {
    const props = propsOf(record.get("other"));
    return {
      movie: {
        id: props.id as string,
        title: props.title as string,
        year: props.year as number,
        genres: [],
        cast: (record.get("cast") as string[]) ?? [],
      },
      sharedActors: record.get("sharedActors") as number,
      sharedGenres: record.get("sharedGenres") as number,
    };
  });
}

/**
 * Two-hop neighbourhood of a movie's cast: everyone a cast member has
 * worked with elsewhere. Used for the "cast network" visualisation.
 */
export async function castNeighbourhood(movieId: string): Promise<GraphData> {
  const result = await runQuery(
    `MATCH (m:Movie {id: $movieId})
     MATCH (c:Person)-[r:ACTED_IN]->(m)
     OPTIONAL MATCH (c)-[r2:ACTED_IN]->(other:Movie)
     WHERE other.id <> m.id
     RETURN m, c, r, other, r2
     ORDER BY c.name, other.year DESC`,
    { movieId },
  );
  const nodes = new Map<string, GraphData["nodes"][number]>();
  const links: GraphData["links"] = [];
  for (const record of result.records) {
    const mProps = propsOf(record.get("m"));
    const cProps = propsOf(record.get("c"));
    const other = record.get("other");
    nodes.set(mProps.id as string, {
      id: mProps.id as string,
      kind: "movie",
      label: mProps.title as string,
      sub: String(mProps.year),
      year: mProps.year as number,
    });
    nodes.set(cProps.id as string, {
      id: cProps.id as string,
      kind: "person",
      label: cProps.name as string,
      sub: "cast",
    });
    if (other) {
      const oProps = propsOf(other);
      const r2Props = propsOf(record.get("r2"));
      nodes.set(oProps.id as string, {
        id: oProps.id as string,
        kind: "movie",
        label: oProps.title as string,
        sub: String(oProps.year),
        year: oProps.year as number,
      });
      links.push({
        source: cProps.id as string,
        target: oProps.id as string,
        type: "ACTED_IN",
        role: (r2Props.role as string | null) ?? null,
        label: (r2Props.role as string) ?? "acted in",
      });
    }
  }
  return { nodes: [...nodes.values()], links };
}

/** Search people by name (for the connection explorer pickers). */
export async function searchPeople(q: string, limit = 8): Promise<PersonSummary[]> {
  const result = await runQuery(
    `MATCH (p:Person)
     WHERE toLower(p.name) CONTAINS toLower($q)
     RETURN p.id AS id, p.name AS name, p.born AS born
     ORDER BY p.name
     LIMIT $limit`,
    { q, limit: Number(limit) },
  );
  return result.records.map((record) => ({
    id: record.get("id") as string,
    name: record.get("name") as string,
    born: (record.get("born") as number | null) ?? null,
  }));
}

/** Search movies by title (for the connection explorer movie mode). */
export async function searchMoviesForPicker(q: string, limit = 8): Promise<MovieSummary[]> {
  const result = await runQuery(
    `MATCH (m:Movie)
     WHERE toLower(m.title) CONTAINS toLower($q)
     RETURN m.id AS id, m.title AS title, m.year AS year
     ORDER BY m.year DESC
     LIMIT $limit`,
    { q, limit: Number(limit) },
  );
  return result.records.map((record) => ({
    id: record.get("id") as string,
    title: record.get("title") as string,
    year: record.get("year") as number,
    genres: [],
    cast: [],
  }));
}

/** Exact-id existence check, used to validate connection-explorer endpoints. */
export async function moviesExistByIds(ids: string[]): Promise<boolean[]> {
  if (ids.length === 0) return [];
  const result = await runQuery(
    `MATCH (m:Movie)
     WHERE m.id IN $ids
     RETURN m.id AS id`,
    { ids },
  );
  const found = new Set(result.records.map((record) => record.get("id") as string));
  return ids.map((id) => found.has(id));
}

/** Person detail: everything they acted in and directed. */
export async function getPerson(id: string): Promise<PersonDetail | null> {
  const [actedResult, directedResult, personResult] = await Promise.all([
    runQuery(
      `MATCH (p:Person {id: $id})-[r:ACTED_IN]->(m:Movie)
       OPTIONAL MATCH (m)<-[:DIRECTED]-(d:Person)
       RETURN m.id AS movieId, m.title AS title, m.year AS year,
              r.role AS role, r.order AS order,
              collect(DISTINCT d.name) AS directors
       ORDER BY m.year DESC`,
      { id },
    ),
    runQuery(
      `MATCH (p:Person {id: $id})-[:DIRECTED]->(dm:Movie)
       RETURN dm.id AS movieId, dm.title AS title, dm.year AS year
       ORDER BY dm.year DESC`,
      { id },
    ),
    runQuery(
      `MATCH (p:Person {id: $id})
       RETURN p`,
      { id },
    ),
  ]);
  if (personResult.records.length === 0) return null;
  const pProps = propsOf(personResult.records[0].get("p"));
  const actedIn: FilmographyItem[] = actedResult.records
    .filter((record) => record.get("movieId"))
    .map((record) => ({
      id: record.get("movieId") as string,
      title: record.get("title") as string,
      year: record.get("year") as number,
      role: (record.get("role") as string | null) ?? null,
      order: (record.get("order") as number | null) ?? null,
      director:
        ((record.get("directors") as string[]) ?? [])[0] ?? null,
      genres: [],
    }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const directed: FilmographyItem[] = directedResult.records
    .filter((record) => record.get("movieId"))
    .map((record) => ({
      id: record.get("movieId") as string,
      title: record.get("title") as string,
      year: record.get("year") as number,
      role: null,
      order: null,
      director: null,
      genres: [],
    }));
  return {
    id: pProps.id as string,
    name: pProps.name as string,
    born: (pProps.born as number | null) ?? null,
    actedIn,
    directed,
  };
}

/** Co-stars of a person, ranked by number of shared movies (2 hops). */
export async function coStarsOf(personId: string, limit = 15): Promise<CoStar[]> {
  const result = await runQuery(
    `MATCH (p:Person {id: $personId})-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(co:Person)
     WHERE co.id <> p.id
     RETURN co.id AS id,
            co.name AS name,
            count(DISTINCT m) AS moviesTogether,
            collect(DISTINCT m.title) AS with
     ORDER BY moviesTogether DESC, co.name
     LIMIT $limit`,
    { personId, limit: Number(limit) },
  );
  return result.records.map((record) => ({
    id: record.get("id") as string,
    name: record.get("name") as string,
    moviesTogether: record.get("moviesTogether") as number,
    with: (record.get("with") as string[]).slice(0, 5),
  }));
}

/**
 * The flagship query: shortest path between two people (or movies) through
 * ACTED_IN / DIRECTED relationships, up to $maxHops. In a relational
 * database this is a recursive-with query with an unknown, unbounded depth;
 * in a graph it is a single pattern.
 */
export async function shortestConnection(
  fromId: string,
  toId: string,
  kind: "person" | "movie",
  maxHops = 4,
): Promise<ConnectionResult> {
  const label = kind === "person" ? "Person" : "Movie";
  const result = await runQuery(
    `MATCH (a:${label} {id: $fromId}), (b:${label} {id: $toId})
     MATCH p = shortestPath((a)-[:ACTED_IN|DIRECTED*1..${maxHops}]-(b))
     RETURN p`,
    { fromId, toId },
  );
  const record = result.records[0];
  const found = Boolean(record);
  const graph: GraphData = { nodes: [], links: [] };
  const steps: ConnectionResult["steps"] = [];
  let depth = 0;

  if (found) {
    const path = record.get("p") as {
      start: { elementId: string; labels: string[]; properties: PropertyBag };
      segments: Array<{
        start: { elementId: string; labels: string[]; properties: PropertyBag };
        end: { elementId: string; labels: string[]; properties: PropertyBag };
        relationship: {
          type: string;
          properties: PropertyBag;
          start: string;
          end: string;
        };
      }>;
    };
    depth = path.segments.length;
    const orderedNodes = [path.start, ...path.segments.map((segment) => segment.end)];
    const nodeById = new Map<string, GraphData["nodes"][number]>();
    for (const node of orderedNodes) {
      if (!nodeById.has(node.elementId)) {
        const isPerson = node.labels.includes("Person");
        nodeById.set(node.elementId, {
          id: node.properties.id as string,
          kind: isPerson ? "person" : "movie",
          label: (node.properties.name ?? node.properties.title) as string,
          sub: isPerson
            ? node.properties.born != null
              ? `b. ${String(node.properties.born)}`
              : null
            : String(node.properties.year),
          year: !isPerson ? (node.properties.year as number | null) : null,
        });
      }
    }
    for (let i = 0; i < path.segments.length; i++) {
      const segment = path.segments[i];
      const rel = segment.relationship;
      graph.links.push({
        source: segment.start.properties.id as string,
        target: segment.end.properties.id as string,
        type: rel.type,
        role: (rel.properties.role as string | null) ?? null,
        label: rel.type === "ACTED_IN" ? (rel.properties.role as string) ?? "acted in" : "directed",
      });
    }
    graph.nodes = [...nodeById.values()];

    for (let i = 0; i + 2 < orderedNodes.length; i += 2) {
      const start = nodeById.get(orderedNodes[i].elementId);
      const via = nodeById.get(orderedNodes[i + 1].elementId);
      const end = nodeById.get(orderedNodes[i + 2].elementId);
      if (!start || !via || !end) continue;

      let detail: string;
      if (start.kind === "person" && end.kind === "person") {
        const relA = path.segments[i].relationship;
        const relB = path.segments[i + 1].relationship;
        const roleA = relA.properties.role ? ` as “${String(relA.properties.role)}”` : "";
        const roleB = relB.properties.role ? ` as “${String(relB.properties.role)}”` : "";
        const clauseA =
          relA.type === "ACTED_IN"
            ? `${start.label} appeared in ${via.label}${roleA}`
            : `${start.label} directed ${via.label}`;
        const clauseB =
          relB.type === "ACTED_IN"
            ? `${end.label} appeared in it${roleB}`
            : `${end.label} directed it`;
        detail = `${clauseA}, and ${clauseB}`;
      } else {
        const relA = path.segments[i].relationship;
        const relB = path.segments[i + 1].relationship;
        const bothActed = relA.type === "ACTED_IN" && relB.type === "ACTED_IN";
        const bothDirected = relA.type === "DIRECTED" && relB.type === "DIRECTED";
        detail = bothActed
          ? `${via.label} appears in both ${start.label} and ${end.label}`
          : bothDirected
            ? `${via.label} directed both ${start.label} and ${end.label}`
            : `${via.label} is connected to both ${start.label} and ${end.label}`;
      }

      steps.push({
        from: start.label,
        fromId: start.id,
        fromKind: start.kind,
        to: end.label,
        toId: end.id,
        toKind: end.kind,
        via: via.label,
        viaId: via.id,
        viaKind: via.kind,
        relation: "ACTED_IN",
        detail,
      });
    }
  }

  return {
    found,
    depth,
    graph,
    steps,
    fromId,
    toId,
  };
}
