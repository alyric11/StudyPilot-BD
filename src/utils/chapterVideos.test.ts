import test from "node:test";
import assert from "node:assert/strict";
import { validatePublishedVideos, unsavedVideos, visibleVideoCandidates, youtubeVideoId } from "./chapterVideos";
const video = (id: string) => ({ videoId: id, title: "Lesson", channelTitle: "Teacher", thumbnail: "", viewCount: "1", duration: null });
test("shared video list allows five, rejects six, duplicate IDs and malformed IDs", () => {
  const videos = ["abcdefghij1", "abcdefghij2", "abcdefghij3", "abcdefghij4", "abcdefghij5"].map(video);
  assert.equal(validatePublishedVideos(videos).length, 5);
  assert.throws(() => validatePublishedVideos([...videos, video("abcdefghij6")]));
  assert.throws(() => validatePublishedVideos([videos[0], videos[0]]));
  assert.throws(() => validatePublishedVideos([video("bad")]));
  assert.equal(validatePublishedVideos([videos[0]])[0].thumbnail, "https://i.ytimg.com/vi/abcdefghij1/mqdefault.jpg");
});
test("student search excludes both shared and personal saved panels", () => {
  const videos = ["abcdefghij1", "abcdefghij2", "abcdefghij3"].map(video);
  assert.deepEqual(unsavedVideos(videos, [videos[0]], [videos[1].videoId]), [videos[2]]);
});
test("ten candidates show five at a time and replenish each saved slot", () => {
  const pool = Array.from({ length: 10 }, (_, i) => video(`abcdefghij${i}`));
  assert.deepEqual(visibleVideoCandidates(pool, []), pool.slice(0, 5));
  assert.deepEqual(visibleVideoCandidates(pool, [pool[0]]), pool.slice(1, 6));
  assert.deepEqual(visibleVideoCandidates(pool, pool.slice(0, 5)), pool.slice(5));
  assert.equal(visibleVideoCandidates([...pool, video("abcdefghijk")], pool).length, 0);
});
test("visible student results exclude both saved lists and duplicate candidates", () => {
  const pool = Array.from({ length: 8 }, (_, i) => video(`abcdefghij${i}`));
  assert.deepEqual(visibleVideoCandidates([pool[0], ...pool], [pool[0]], [pool[1].videoId]), pool.slice(2, 7));
});
test("personal links accept YouTube URLs and reject unrelated domains or invalid IDs", () => {
  assert.equal(youtubeVideoId("https://youtu.be/abcdefghij1"), "abcdefghij1");
  assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=abcdefghij1"), "abcdefghij1");
  assert.equal(youtubeVideoId("https://example.com/watch?v=abcdefghij1"), null);
  assert.equal(youtubeVideoId("https://youtu.be/bad"), null);
});
