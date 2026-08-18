# PRD — CineGraph: A Movie & Cast Connection Explorer

**Wexa AI take-home assignment · Build a Graph Database Application**
**Stack:** Next.js (App Router) + TypeScript + `neo4j-driver` + CognoDB Cloud

---

## 1. Product Overview

CineGraph is a small, complete web application that lets a non-technical movie
fan explore *how* films, actors, directors and genres are connected — not just
*what* movies exist. The product's whole point is relationships:

- "Which of my favourite actors have worked together — and in which movie?"
- "How is Keanu Reeves connected to Tom Hanks? Show me the path."
- "I loved *The Matrix* — what else should I watch, and why (shared actor/genre)?"

These are path and neighbourhood questions. In a relational database each
answer needs recursive self-joins or a fixed number of joins that the data
model designer must predict in advance. In a graph database, the query is the
question: walk 2 hops, or find the shortest path. This is the argument for the
data layer, expanded in the README's "Why a graph database?" section.

## 2. Goals

1. Deliver a working, hosted web app backed by CognoDB that a non-technical
   person can use without instructions.
2. Demonstrate thoughtful graph data modeling (labeled nodes, typed
   relationships, properties) documented with a diagram.
3. Demonstrate real Cypher: parameterised queries only, at least one multi-hop
   traversal (2+ hops), and at least one query a relational database would find
   awkward (shortest path / variable-length traversal).
4. Polished UX: sensible layout, loading states, empty states, error states
   when the database is unreachable.
5. Engineering hygiene: credentials via environment variables, clean structure,
   maintainable code, graceful failure.

## 3. Non-Goals

- No user accounts, auth or social features (out of scope for a 48h demo).
- No streaming/certification data; seed data is realistic but curated.
- No write path in the UI (read-only exploration; seed script owns the data).

## 4. Target Users

| Persona | Need |
|---|---|
| Casual movie fan | "Show me something connected to a movie I love and why." |
| Curious browser | "Find two actors and see how they're connected." |
| Interviewer (Wexa) | "Is the data model sound, are the queries real, is the app usable?" |

## 5. Features

### 5.1 Browse & search (Home)
- Search movies by title (prefix/substring match, parameterised).
- Browse curated movie cards: title, year, genres, top cast.
- Sensible empty state ("No movies match 'xyz'") and loading skeletons.

### 5.2 Movie detail
- Cast with character names (`ACTED_IN.role`), director, genres, year, tagline.
- **"Why you might like" recommendations** (2-hop): other movies reached through
  shared cast or shared genres, ranked by overlap. This is a multi-hop
  traversal and also demonstrates a query that would need many joins in SQL.
- **Cast network mini-visualisation**: the movie's cast and their shared other
  movies (2-hop neighbourhood) as an SVG node-link graph.

### 5.3 Person detail
- Filmography, roles and directors worked with.
- **Co-stars ranked** (2-hop): who has this actor worked with most.
- One-click "Connect with…" — jump into the connection explorer.

### 5.4 Connection explorer (the flagship feature)
- Pick two people (autocomplete/type-ahead search).
- Show the **shortest path** between them (variable-length path query —
  genuinely awkward in SQL) as an interactive SVG graph + step-by-step path
  description ("Keanu Reeves → acted in *The Matrix* → ... → Tom Hanks").
- Empty/error state: "No connection found within 4 hops" or database error.

### 5.5 Health & resilience
- `GET /api/health` returns DB reachability for deployment checks.
- Every page/API handles DB-unreachable with a friendly, distinct error state
  (not a white screen).

## 6. Graph Data Model

```
(:Person {name, born})            -- actors AND directors (role by edge type)
(:Movie  {title, year, tagline, runtimeMinutes})
(:Genre  {name})

(:Person)-[:ACTED_IN  {role, order}]->(:Movie)
(:Person)-[:DIRECTED]->(:Movie)
(:Movie)-[:IN_GENRE]->(:Genre)
```

Modeling notes:
- One `Person` label for actors and directors (edge type disambiguates) —
  standard graph practice, avoids duplicate-identity problems (e.g. Clint
  Eastwood acts *and* directs).
- `ACTED_IN.role` holds the character name; `order` preserves billing order.
- Movies connect to genres with a typed relationship so traversal can jump
  actor → movie → genre in one Cypher pattern.

Seed dataset: ~20 curated, real films (The Matrix, Inception, Toy Story, The
Godfather, ...), ~45 people, 8 genres → well within the free c0 tier
(256 MB RAM, 1 GB disk). Loaded idempotently with `MERGE`.

## 7. Key Queries (all parameterised, via official driver)

| # | Query | Why it matters |
|---|---|---|
| Q1 | `MATCH (p:Person)-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(c:Person)` — co-stars of a person | 2-hop traversal |
| Q2 | Movie recommendations: shared cast/genres between a movie and others, ranked | 2-hop + ranking, awkward in SQL |
| Q3 | Shortest path between two people (`shortestPath` with max hops) | Variable-length path — the "SQL-awkward" query |
| Q4 | Search movies by substring | Parameterised `WHERE toLower(m.title) CONTAINS $q` |
| Q5 | Movie detail + cast + genres | Typed relationships, properties |

No Cypher is built by string concatenation anywhere in the codebase.

## 8. UX Requirements

- Clean typography, generous whitespace, consistent colour system (dark
  cinema theme), responsive down to mobile widths.
- Loading skeletons on every data fetch.
- Explicit empty states ("We couldn't find that person").
- Explicit, friendly database-unreachable state with retry affordance.
- Interactive SVG graph visualisation (no heavyweight canvas libs) for cast
  networks and connection paths — hand-rolled force-less layout to keep the
  bundle small and the code reviewable.

## 9. Non-Functional Requirements

| Concern | Requirement |
|---|---|
| Secrets | `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` via env vars; `.env.example` committed, `.env` gitignored |
| Driver | Singleton driver per process, small pool (free tier: 200 conns max; keep ≤10), `disableLosslessIntegers: true` for safe JSON serialization |
| Scale | Dataset ≤ ~1k nodes / ~3k edges; queries bounded (LIMITs, max-hop caps) |
| Errors | All API routes return structured `{error: {message, code}}`; UI maps to friendly states |
| Deployment | Vercel (free tier); env vars set in project settings; demo link + screen recording per assignment |
| Lint/type | `next lint` + `tsc --noEmit` clean |

## 10. Out of Scope / Future Ideas

- Add ratings + user watchlists (`(:User)-[:WATCHED]->(:Movie)`) for
  collaborative filtering — classic graph recommendation.
- Full-text search via CognoDB BM25.
- p95/benchmark instrumentation.

## 11. Success Criteria

1. Fresh clone + `npm install` + `.env` + `npm run seed` + `npm run dev`
   reproduces the app against a live CognoDB c0 instance.
2. Every UI feature works against live data; DB-down shows graceful errors.
3. At least one multi-hop query and one SQL-awkward query are visible in the UI
   and documented in the README with their Cypher.
4. Repo green on `next build`, `tsc --noEmit`, `eslint`.
