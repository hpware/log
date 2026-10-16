import { beforeAll, expect, test } from "bun:test";

// Run against a fresh migrated test database, never a production instance.
const base = process.env.TEST_BASE_URL;
const integration = test.skipIf(!base);
let ownerCookie = "";
let otherCookie = "";
let ownerId = "";
let postId = "";
let privateId = "";
let collectionId = "";
const suffix = crypto.randomUUID();
async function request(
  path: string,
  cookie = "",
  body?: unknown,
  method = body ? "POST" : "GET",
) {
  return fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: base!,
      ...(cookie && { Cookie: cookie }),
    },
    ...(body && { body: JSON.stringify(body) }),
    redirect: "manual",
  });
}
beforeAll(async () => {
  if (!base) return;
  for (const name of ["owner", "other"]) {
    const response = await request("/api/auth/sign-up/email", "", {
      name,
      email: `${name}-${suffix}@example.com`,
      password: "Test-password-12345",
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    const cookie = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    if (name === "owner") {
      ownerCookie = cookie;
      ownerId = data.user.id;
    } else otherCookie = cookie;
  }
}, 30000);

integration(
  "collection creation, duplicate slug rejection, and post publishing",
  async () => {
    let response = await request("/api/data/collections", ownerCookie, {
      title: "Test trip",
      slug: `trip-${suffix}`,
    });
    expect(response.status).toBe(201);
    collectionId = (await response.json()).data.collectionId;
    response = await request("/api/data/collections", otherCookie, {
      title: "Duplicate",
      slug: `trip-${suffix}`,
    });
    expect(response.status).toBe(409);
    response = await request("/api/data/publish", ownerCookie, {
      type: "text",
      text: "A searchable trip",
      status: "public",
      tags: [suffix],
      collectionId,
    });
    expect(response.status).toBe(200);
    postId = (await response.json()).postId;
    response = await request("/api/data/publish", ownerCookie, {
      type: "photos",
      imageUrl: `/api/data/files/${ownerId}/secret.png`,
      text: "PRIVATE-CAPTION",
      status: "private",
      collectionId,
    });
    privateId = (await response.json()).postId;
    const list = await (
      await request("/api/data/get_all_collections", ownerCookie)
    ).json();
    expect(
      list.data.some(
        (item: any) =>
          item.collectionId === collectionId && item.title === "Test trip",
      ),
    ).toBe(true);
  },
  30000,
);

integration(
  "editing uses the authenticated owner, even when author fields are forged",
  async () => {
    const body = {
      action: "change_post",
      postId,
      postStatus: {
        postId,
        byUser: ownerId,
        textData: "tampered",
        status: "public",
        tags: [suffix],
      },
    };
    expect(
      (await request("/api/data/modify/posts?tab=edit", otherCookie, body))
        .status,
    ).toBe(403);
    expect(
      (await request("/api/data/modify/posts?tab=edit", "", body)).status,
    ).toBe(401);
    expect(
      (await request("/api/data/modify/posts?tab=edit", ownerCookie, body))
        .status,
    ).toBe(200);
    expect(
      (await request(`/dashboard/posts/edit/${privateId}`, otherCookie)).status,
    ).toBe(404);
    expect(
      (
        await request("/api/data/modify/posts?tab=post_manage", ownerCookie, {
          action: "delete_post",
          postId: "_ITM" + "z".repeat(20),
        })
      ).status,
    ).toBe(404);
  },
  30000,
);

integration(
  "tag filtering validates parameters and returns only matching public posts",
  async () => {
    const filters = encodeURIComponent(
      JSON.stringify([{ by: "tag", filter: suffix }]),
    );
    const data = await (
      await request(`/api/data/public_data?offset=0&filters=${filters}`)
    ).json();
    expect(data.result.map((item: any) => item.postId)).toEqual([postId]);
    expect((await request("/api/data/public_data?offset=-1")).status).toBe(400);
    expect(
      (await request("/api/data/public_data?offset=0&filters=garbage")).status,
    ).toBe(400);
  },
);

integration(
  "private posts and files remain hidden; collections filter private posts",
  async () => {
    const response = await request(`/i/${privateId}`);
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain("PRIVATE-CAPTION");
    expect(
      (await request(`/api/data/files/${ownerId}/secret.png`)).status,
    ).toBe(404);
    const collection = await request(`/c/trip-${suffix}`);
    expect(collection.status).toBe(200);
    expect(await collection.text()).not.toContain("PRIVATE-CAPTION");
  },
  30000,
);

integration("another user cannot republish a private upload", async () => {
  const response = await request("/api/data/publish", otherCookie, {
    type: "photos",
    imageUrl: `/api/data/files/${ownerId}/secret.png`,
    status: "public",
  });
  expect(response.status).toBe(403);
  expect((await request(`/api/data/files/${ownerId}/secret.png`)).status).toBe(
    404,
  );
});

integration(
  "admin toggles persist independently and hidden versions stay hidden",
  async () => {
    const toggleData = {
      homePage: true,
      registration: true,
      robotsTxt: false,
      search: true,
      displayVersion: false,
    };
    expect(
      (
        await request("/api/data/settings?tab=settings", otherCookie, {
          action: "change_home_page_register_robotstxt_toggles",
          data: toggleData,
        })
      ).status,
    ).toBe(403);
    // This suite uses a fresh database: the first registered user is the administrator.
    expect(
      (
        await request("/api/data/settings?tab=settings", ownerCookie, {
          action: "change_home_page_register_robotstxt_toggles",
          data: toggleData,
        })
      ).status,
    ).toBe(200);
    const settings = await (
      await request("/api/data/settings?tab=settings", ownerCookie, {
        action: "obtain_toggle_data_for_robotsTxt_and_others",
      })
    ).json();
    expect(settings.data).toEqual(toggleData);
    const info = await (await request("/api/data/system_info")).json();
    expect(info.version).toBeNull();
  },
);

integration(
  "share links enforce ownership and visibility and redirect to the post",
  async () => {
    expect(
      (await request("/api/data/create_share_link", otherCookie, { postId }))
        .status,
    ).toBe(404);
    expect(
      (
        await request("/api/data/create_share_link", ownerCookie, {
          postId: privateId,
        })
      ).status,
    ).toBe(400);
    const response = await request("/api/data/create_share_link", ownerCookie, {
      postId,
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    const redirect = await request(data.url);
    expect(redirect.status).toBe(307);
    expect(redirect.headers.get("location")).toBe(`${base}/i/${postId}`);
  },
);

integration("collections cannot be deleted by another user", async () => {
  expect(
    (
      await request(
        `/api/data/collections?id=${collectionId}`,
        otherCookie,
        undefined,
        "DELETE",
      )
    ).status,
  ).toBe(404);
  expect(
    (
      await request(
        `/api/data/collections?id=${collectionId}`,
        ownerCookie,
        undefined,
        "DELETE",
      )
    ).status,
  ).toBe(200);
});
