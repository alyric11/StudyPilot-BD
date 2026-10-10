import { sharedHscChapterPairs } from '../data/sharedHscChapters';

const aliases = new Map<string, { key: string; legacyKeys: string[] }>();
for (const [subject, first, second] of sharedHscChapterPairs) {
  const identity = { key: `${subject}:hsc-v1-${first.replace('_11_', '_')}`,
    legacyKeys: [`${subject}:${first}`, `${subject}:${second}`] };
  for (const key of [identity.key, ...identity.legacyKeys]) {
    if (aliases.has(key)) throw new Error(`Duplicate shared chapter mapping: ${key}`);
    aliases.set(key, identity);
  }
}

/** Only the reviewed HSC pairs share content. Student record keys never use this helper. */
export function sharedChapterIdentity(subject: string, chapter: string) {
  const key = `${subject}:${chapter}`;
  return aliases.get(key) || { key, legacyKeys: [] };
}
export function isSharedHscChapter(subject: string, chapter: string) {
  return sharedChapterIdentity(subject, chapter).legacyKeys.length === 2;
}
