import "dotenv/config";
import { getDriver, runQuery } from "../src/lib/neo4j";
import {
  SEED_MOVIES,
  SEED_PEOPLE,
  movieId,
  slugify,
} from "./seed-data";

async function seedSection(cypher: string, rows: unknown[]): Promise<void> {
  if (rows.length === 0) return;
  await runQuery(cypher, { rows });
}

async function main(): Promise<void> {
  const driver = getDriver();
  console.log("Seeding CineGraph into CognoDB\u2026");

  console.log(`- ${SEED_PEOPLE.length} people`);
  await seedSection(
    `UNWIND $rows AS row
     MERGE (p:Person {id: row.id})
     SET p.name = row.name, p.born = row.born`,
    SEED_PEOPLE.map((p) => ({ id: slugify(p.name), name: p.name, born: p.born })),
  );

  console.log(`- ${SEED_MOVIES.length} movies`);
  await seedSection(
    `UNWIND $rows AS row
     MERGE (m:Movie {id: row.id})
     SET m.title = row.title, m.year = row.year, m.tagline = row.tagline,
         m.runtimeMinutes = row.runtimeMinutes`,
    SEED_MOVIES.map((m) => ({
      id: movieId(m.title, m.year),
      title: m.title,
      year: m.year,
      tagline: m.tagline,
      runtimeMinutes: m.runtimeMinutes,
    })),
  );

  const genres = [...new Set(SEED_MOVIES.flatMap((m) => m.genres))];
  console.log(`- ${genres.length} genres`);
  await seedSection(
    `UNWIND $rows AS row
     MERGE (g:Genre {id: row.id})
     SET g.name = row.name`,
    genres.map((name) => ({ id: slugify(name), name })),
  );

  console.log("- cast relationships (ACTED_IN with roles)");
  const castRows = SEED_MOVIES.flatMap((m) =>
    m.cast.map((c, index) => ({
      movieId: movieId(m.title, m.year),
      personId: slugify(c.name),
      role: c.role,
      order: index,
    })),
  );
  await seedSection(
    `UNWIND $rows AS row
     MATCH (p:Person {id: row.personId})
     MATCH (m:Movie {id: row.movieId})
     MERGE (p)-[r:ACTED_IN]->(m)
     SET r.role = row.role, r.order = row.order`,
    castRows,
  );

  console.log("- director relationships (DIRECTED)");
  await seedSection(
    `UNWIND $rows AS row
     MATCH (p:Person {id: row.personId})
     MATCH (m:Movie {id: row.movieId})
     MERGE (p)-[r:DIRECTED]->(m)`,
    SEED_MOVIES.map((m) => ({
      personId: slugify(m.director),
      movieId: movieId(m.title, m.year),
    })),
  );

  console.log("- genre relationships (IN_GENRE)");
  await seedSection(
    `UNWIND $rows AS row
     MATCH (m:Movie {id: row.movieId})
     MATCH (g:Genre {id: row.genreId})
     MERGE (m)-[r:IN_GENRE]->(g)`,
    SEED_MOVIES.flatMap((m) =>
      m.genres.map((genre) => ({
        movieId: movieId(m.title, m.year),
        genreId: slugify(genre),
      })),
    ),
  );

  const counts = await runQuery(
    `MATCH (n) WITH count(n) AS nodes
     MATCH ()-[r]->() WITH nodes, count(r) AS relationships
     RETURN nodes, relationships`,
  );
  console.log(
    `Done. Graph now has ${counts.records[0].get("nodes")} nodes and ${counts.records[0].get("relationships")} relationships.`,
  );

  await driver.close();
  console.log("Driver closed.");
}

main().catch(async (error) => {
  console.error("Seeding failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
