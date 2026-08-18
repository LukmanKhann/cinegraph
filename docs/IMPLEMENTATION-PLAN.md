# Implementation Plan — CineGraph

**Goal:** working, hosted, graph-backed movie connection explorer for the Wexa AI
take-home assignment, within the 48h window (target: 8–12 focused hours).

**Stack (locked):** Next.js 15 (App Router) + TypeScript + Tailwind,
`neo4j-driver` ^6, CognoDB Cloud free c0 instance, Vercel (free tier).

---

## Architecture

```
Browser ──▶ Next.js (App Router)
              ├── /            home: search + browse + trending rows
              ├── /movie/[id]  detail + "why you might like" (2-hop) + cast graph
              ├── /person/[id] filmography + ranked co-stars
              ├── /connect     "degrees of separation" explorer (shortest path)
              └── /api/*       Route Handlers (server-side, own the driver)
                                  └── lib/neo4j.ts   singleton driver (pool ≤ 10)
                                  └── lib/queries.ts all parameterised Cypher
                                  └── lib/serialize.ts  driver values → JSON-safe
scripts/seed.ts                 idempotent MERGE load of realistic dataset
```

Rules enforced by design:
- **All Cypher lives in `lib/queries.ts`**, every query parameterised with `$`.
- **No credentials in the repo**: `.env` gitignored, `.env.example` committed.
- **Graceful failure**: every API route catches driver/query errors and returns
  `{ error: { code, message } }`; UI shows a friendly DB-down state with retry.
- **Serverless-safe driver**: module-scoped singleton, `maxConnectionPoolSize: 10`,
  `disableLosslessIntegers: true` (Neo4j `Integer` → JS number for JSON).

## Phases

### Phase 1 — Scaffold (30 min)
1. `create-next-app` (TS, Tailwind, App Router, src dir, ESLint) in `cinegraph/`.
2. `npm i neo4j-driver tsx dotenv`.
3. `.gitignore` (.env), `.env.example`, `next.config` sanity.
   **Done when:** `npm run dev` serves the template page.

### Phase 2 — Data layer (2–3 h)
4. `lib/neo4j.ts` — driver singleton + health check + close-on-warmup guard.
5. `lib/serialize.ts` — record → plain-object mapping (ints, nodes, rels, paths).
6. `lib/queries.ts` — parameterised Cypher:
   - `searchMovies(q)` — substring on title, limit 12.
   - `getMovie(id)` — detail + cast (role, order) + genres + director.
   - `recommendMoviesFor(movieId)` — **2-hop**: shared `ACTED_IN`/`IN_GENRE`,
     ranked by overlap, excluding self.
   - `getPerson(id)` — filmography with roles/directors.
   - `coStarsOf(personId)` — **2-hop** co-actor counts ranked.
   - `shortestPathBetween(aId, bId)` — `shortestPath((a)-[*..4]-(b))` + path
     nodes/rels for rendering. **The SQL-awkward query.**
   - `castNeighbourhood(movieId)` — 2-hop cast network for mini-viz.
7. `scripts/seed-data.ts` — curated dataset: ~20 films, ~45 people, 8 genres,
   roles with character names, directors. ~1k–2k edges max.
8. `scripts/seed.ts` — reads env, `MERGE`s everything idempotently, prints
   node/rel counts. (`npm run seed`)
   **Done when:** seed runs against CognoDB and counts look right.

### Phase 3 — API layer (1–2 h)
9. Route handlers: `/api/movies?q=`, `/api/movie/[id]`,
   `/api/person/[id]`, `/api/connect?from=&to=`, `/api/health`.
10. Consistent error envelope + `cache: 'no-store'`.
    **Done when:** `curl`/browser against local `dev` returns JSON for live data.

### Phase 4 — UI/UX (3–4 h)
11. Design system: dark cinema theme, Tailwind tokens, `Inter`-class type,
    nav, footer, skeleton components (`LoadingCard`, `Spinner`), `EmptyState`,
    `ErrorState` (DB-down friendly + retry).
12. Home: hero search, trending/browse grid, "explore a connection" CTA.
13. Movie page: poster-less card design (gradient + year), cast list w/ roles,
    recommendation row with "why" chips, cast-neighbourhood SVG graph.
14. Person page: bio-less profile header, filmography, ranked co-stars,
    "Connect with…" picker shortcut.
15. Connect page: two searchable selects, **interactive SVG path visualisation**
    (hand-rolled force-less layered layout), step-by-step path narrative,
    empty ("no connection within 4 hops") + error states.
    **Done when:** clickable through every feature locally w/ live DB.

### Phase 5 — Docs & hardening (1–2 h)
16. README: use case, **Why a graph database?**, Mermaid data-model diagram,
    CognoDB setup walkthrough, seed/run instructions, each query explained,
    screenshots section, deploy notes.
17. `npm run lint`, `tsc --noEmit`, `next build` all green.

### Phase 6 — Deploy & submit (1–2 h, with user)
18. CognoDB c0 instance (user signs up; guide in README) → credentials into
    `.env` → seed live → test end-to-end locally.
19. Vercel deploy (user's account) + env vars + live smoke test.
20. Screen recording (OBS/screen recorder): browse → movie → person → connect.
21. Git init + push to GitHub (private) → email `hr@wexa.ai`
    subject: `CognoDB Assignment 2 <Your Name>`.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| CognoDB free tier limits (256 MB RAM) | Tiny dataset; all queries `LIMIT`ed; no unbounded traversals |
| Serverless cold-start/connection churn | Singleton driver; pool ≤ 10; max-4-hop path cap; acceptable 1–2 s cold start |
| Password shown once / lost | README step calls this out; user saves to `.env` immediately |
| `shortestPath` var-length memory on c0 | Cap `[*..4]`, dataset is small; test with EXPLAIN if needed |
| Missing driver (CognoDB is new) | Official driver per assignment; fallback target = Neo4j Aura free (same code) |
