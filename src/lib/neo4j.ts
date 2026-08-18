import neo4j, { type Driver, type QueryResult, type Session } from "neo4j-driver";

export class DbUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("The movie graph database is currently unreachable.");
    this.name = "DbUnavailableError";
    this.cause = cause;
  }
}

export class DbQueryError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "DbQueryError";
    this.cause = cause;
  }
}

let driver: Driver | null = null;

function getConfig() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER ?? "cognodb";
  const password = process.env.NEO4J_PASSWORD;
  if (!uri || !password) {
    throw new DbQueryError(
      "Database connection is not configured. Set NEO4J_URI and NEO4J_PASSWORD (see README).",
    );
  }
  return { uri, user, password };
}

/**
 * Lazily created, module-scoped singleton. Safe to reuse across serverless
 * warm invocations; the pool is kept small because the free c0 CognoDB tier
 * allows 200 connections and Vercel can spin up several instances.
 */
export function getDriver(): Driver {
  if (driver) return driver;
  const { uri, user, password } = getConfig();
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 10,
    connectionAcquisitionTimeout: 5_000,
    connectionTimeout: 10_000,
    disableLosslessIntegers: true,
  });
  return driver;
}

export async function runQuery(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<QueryResult> {
  const currentDriver = getDriver();
  let session: Session | null = null;
  try {
    session = currentDriver.session({ defaultAccessMode: "READ" });
    return await session.run(cypher, params);
  } catch (error) {
    if (isConnectivityError(error)) {
      throw new DbUnavailableError(error);
    }
    throw new DbQueryError(
      error instanceof Error ? error.message : "Query failed.",
      error,
    );
  } finally {
    await session?.close();
  }
}

export async function checkConnectivity(): Promise<boolean> {
  try {
    await getDriver().verifyConnectivity();
    return true;
  } catch {
    return false;
  }
}

function isConnectivityError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const text = error.message ?? "";
  return (
    /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|socket hang up|TLS|certificate|Host unreachable|ServiceUnavailable/i.test(
      text,
    )
  );
}
