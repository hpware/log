import { afterAll, beforeAll, expect, test } from "bun:test";
import { Pool } from "pg";

// Use an isolated migrated database and a server pointing at that same database.
const base = process.env.REVIEW_TEST_BASE_URL;
const databaseUrl = process.env.REVIEW_TEST_DATABASE_URL;
const enabled = Boolean(base && databaseUrl);
const integration = test.skipIf(!enabled);
const pool = enabled ? new Pool({ connectionString: databaseUrl }) : undefined;
const suffix = crypto.randomUUID();
const triggerName = `review_delete_${suffix.replaceAll("-", "")}`;
let admin: { id: string; cookie: string };
let target: { id: string; cookie: string };

async function request(path: string, cookie = "", body?: unknown) {
  return fetch(`${base}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      Origin: base!,
      ...(cookie && { Cookie: cookie }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
}
async function signup(name: string) {
  const response = await request("/api/auth/sign-up/email", "", {
    name,
    email: `${name}-${suffix}@example.com`,
    password: "Test-password-12345",
  });
  expect(response.status).toBe(200);
  const data = await response.json();
  return {
    id: data.user.id as string,
    cookie: response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; "),
  };
}
async function ownedCounts() {
  const result = await pool!.query(
    `SELECT
    (SELECT count(*)::int FROM "user" WHERE id = $1) AS users,
    (SELECT count(*)::int FROM user_posts WHERE by_user = $1) AS posts,
    (SELECT count(*)::int FROM collections WHERE by_user = $1) AS collections,
    (SELECT count(*)::int FROM url_shorter WHERE by_user = $1) AS links`,
    [target.id],
  );
  return result.rows[0];
}

beforeAll(async () => {
  if (!enabled) return;
  admin = await signup("review-admin");
  // Test-only role assignment avoids depending on registration order in other suites.
  await pool!.query('UPDATE "user" SET role = $1 WHERE id = $2', [
    "admin",
    admin.id,
  ]);
  const targetEmail = `review-target-${suffix}@example.com`;
  const created = await request("/api/auth/admin/create-user", admin.cookie, {
    name: "review-target",
    email: targetEmail,
    password: "Test-password-12345",
    role: "user",
  });
  expect(created.status).toBe(200);
  const signedIn = await request("/api/auth/sign-in/email", "", {
    email: targetEmail,
    password: "Test-password-12345",
  });
  expect(signedIn.status).toBe(200);
  target = {
    id: (await created.json()).user.id,
    cookie: signedIn.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; "),
  };
  const post = await request("/api/data/publish", target.cookie, {
    type: "text",
    text: "Keep until account removal succeeds",
    status: "public",
  });
  expect(post.status).toBe(200);
  const { postId } = await post.json();
  expect(
    (await request("/api/data/create_share_link", target.cookie, { postId }))
      .status,
  ).toBe(200);
  expect(
    (
      await request("/api/data/collections", target.cookie, {
        title: "Keep me",
        slug: `review-${suffix}`,
      })
    ).status,
  ).toBe(201);
}, 30000);

afterAll(async () => {
  if (!pool) return;
  try {
    await pool.query(`DROP TRIGGER IF EXISTS ${triggerName} ON "user"`);
    await pool.query(`DROP FUNCTION IF EXISTS ${triggerName}()`);
    if (target?.id)
      await pool.query('DELETE FROM "user" WHERE id = $1', [target.id]);
    if (admin?.id)
      await pool.query('DELETE FROM "user" WHERE id = $1', [admin.id]);
  } finally {
    await pool.end();
  }
});

integration(
  "missing version setting returns a response without exposing the version",
  async () => {
    const { rows } = await pool!.query(
      "DELETE FROM kv_data WHERE key = 'exposeVersion' RETURNING value",
    );
    try {
      const response = await request("/api/data/system_info");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.version).toBeNull();
      expect(data).not.toHaveProperty("optionalExposeVersion");
    } finally {
      if (rows.length)
        await pool!.query(
          "INSERT INTO kv_data (key, value) VALUES ('exposeVersion', $1::jsonb)",
          [JSON.stringify(rows[0].value)],
        );
    }
  },
);

integration(
  "unauthorized account removal preserves all user content",
  async () => {
    const before = await ownedCounts();
    expect(before).toEqual({ users: 1, posts: 1, collections: 1, links: 1 });
    expect(
      (
        await request(
          "/api/data/settings?tab=admin_user_actions",
          target.cookie,
          { action: "delete_user", user: target.id },
        )
      ).status,
    ).toBe(403);
    expect(await ownedCounts()).toEqual(before);
  },
);

integration(
  "a failed auth removal rolls back cascading content deletes",
  async () => {
    const before = await ownedCounts();
    const targetLiteral = "'" + target.id.replaceAll("'", "''") + "'";
    await pool!.query(
      `CREATE FUNCTION ${triggerName}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Simulated account removal failure'; END $$`,
    );
    await pool!.query(
      `CREATE TRIGGER ${triggerName} AFTER DELETE ON "user" FOR EACH ROW WHEN (OLD.id = ${targetLiteral}) EXECUTE FUNCTION ${triggerName}()`,
    );
    try {
      const response = await request(
        "/api/data/settings?tab=admin_user_actions",
        admin.cookie,
        { action: "delete_user", user: target.id },
      );
      expect(response.ok).toBe(false);
      expect(await ownedCounts()).toEqual(before);
    } finally {
      await pool!.query(`DROP TRIGGER ${triggerName} ON "user"`);
      await pool!.query(`DROP FUNCTION ${triggerName}()`);
    }
  },
);

integration(
  "successful account removal cascades posts, collections, links, and auth records",
  async () => {
    const response = await request(
      "/api/data/settings?tab=admin_user_actions",
      admin.cookie,
      { action: "delete_user", user: target.id },
    );
    expect(response.status).toBe(200);
    expect((await response.json()).success).toBe(true);
    expect(await ownedCounts()).toEqual({
      users: 0,
      posts: 0,
      collections: 0,
      links: 0,
    });
    const { rows } = await pool!.query(
      "SELECT (SELECT count(*)::int FROM account WHERE user_id = $1) AS accounts, (SELECT count(*)::int FROM session WHERE user_id = $1) AS sessions",
      [target.id],
    );
    expect(rows[0]).toEqual({ accounts: 0, sessions: 0 });
  },
);
