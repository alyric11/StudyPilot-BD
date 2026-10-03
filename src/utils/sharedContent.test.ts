import test from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { chapterKey, createSharedContentStore } from "../../server/sharedContent";
import { verifiedStudentAccess } from "../../server/studentAccess";

test("shared chapter cache groups reads, expires, and refreshes after publishing", async () => {
  let time = 0, reads = 0;
  let source = { overview: { introduction: "Old", importantTopics: [] }, videos: [] };
  const store = createSharedContentStore(async () => { reads++; return structuredClone(source); }, async (_id, fields) => { source = { ...source, ...fields }; }, () => time);
  await Promise.all([store.read("physics:one"), store.read("physics:one")]); assert.equal(reads, 1);
  await store.write("physics:one", { overview: { introduction: "New", importantTopics: [] } });
  assert.equal((await store.read("physics:one")).overview?.introduction, "New"); assert.deepEqual(source.videos, []); assert.equal(reads, 2);
  time = 31000; await store.read("physics:one"); assert.equal(reads, 3);
  assert.throws(() => chapterKey("bad/path", "one"));
});
test("failed shared-content reads are not cached as empty chapters", async () => {
  let calls = 0;
  const store = createSharedContentStore(async () => { if (++calls === 1) throw Error("offline"); return { videos: [] }; }, async () => {});
  await assert.rejects(store.read("physics:one")); assert.deepEqual(await store.read("physics:one"), { videos: [] });
});
test("shared content access rejects missing, invalid and unverified logins", async () => {
  async function attempt(header: string | undefined, verified: boolean | "invalid") {
    let status = 200, passed = false;
    const middleware = verifiedStudentAccess(async () => {
      if (verified === "invalid") throw Error("Invalid token");
      return { email_verified: verified } as DecodedIdToken;
    });
    await middleware({ header: () => header } as unknown as Request,
      { setHeader: () => {}, status: (code: number) => { status = code; return { json: () => {} }; } } as unknown as Response,
      () => { passed = true; });
    return { status, passed };
  }
  assert.deepEqual(await attempt(undefined, true), { status: 401, passed: false });
  assert.deepEqual(await attempt("Bearer bad", "invalid"), { status: 401, passed: false });
  assert.deepEqual(await attempt("Bearer test", false), { status: 403, passed: false });
  assert.deepEqual(await attempt("Bearer test", true), { status: 200, passed: true });
});
