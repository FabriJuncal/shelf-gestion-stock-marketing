import { databaseUrlForRuntime } from "./database-url.server";

describe("databaseUrlForRuntime", () => {
  it("keeps the default database configuration outside Vercel", () => {
    expect(
      databaseUrlForRuntime(
        "postgres://user:secret@db.example.com:5432/postgres",
        false
      )
    ).toBeUndefined();
  });

  it("bounds Vercel concurrency while allowing parallel Shelf loaders", () => {
    const configured = databaseUrlForRuntime(
      "postgres://user:secret@pooler.example.com:6543/postgres?pgbouncer=true&connection_limit=1",
      true
    );
    const url = new URL(configured as string);

    expect(url.searchParams.get("pgbouncer")).toBe("true");
    expect(url.searchParams.get("connection_limit")).toBe("5");
    expect(url.searchParams.get("pool_timeout")).toBe("30");
  });
});
