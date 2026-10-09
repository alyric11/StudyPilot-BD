import { NCTB_CURRICULUM } from '../data/curriculum.ts';
import type { ChapterVideo } from './chapterVideos.ts';

export type SearchVideo = ChapterVideo & { matchStatus: 'matching' | 'uncertain'; matchReason: string };
export function resolveVideoContext(classLevel: unknown, subjectId: unknown, chapterId: unknown) {
  if (typeof classLevel !== 'string' || !Object.hasOwn(NCTB_CURRICULUM, classLevel) ||
    typeof subjectId !== 'string' || typeof chapterId !== 'string') throw new Error('Choose a valid class and chapter.');
  const subject = Object.values(NCTB_CURRICULUM[classLevel].subjects).flat().find(item => item.id === subjectId);
  const chapter = subject?.chapters.find(item => item.id === chapterId && item.class === classLevel);
  if (!subject || !chapter) throw new Error('This chapter does not belong to the selected class and subject.');
  const level = ['Class 9', 'Class 10'].includes(classLevel) ? 'SSC' : 'HSC';
  // The display-title field intentionally contains English titles in language subjects.
  const title = chapter.banglaName.trim() || chapter.name.trim();
  const query = [title, level, subject.name,
    /^Lesson\s/i.test(chapter.chapterNumber) ? chapter.section : '',
    /^(Lesson|Question)\s/i.test(chapter.chapterNumber) ? chapter.chapterNumber : '',
  ].filter(Boolean).join(' ');
  return { classLevel, subject, chapter, level, query };
}
export type VideoContext = ReturnType<typeof resolveVideoContext> & { pageToken?: string };
export function normalizeVideoText(text: string) {
  return text.normalize('NFKC').toLowerCase().replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
function levels(text: string) {
  const has = (pattern: string) => new RegExp(`(?:^| )${pattern}(?= |$)`, 'u').test(text);
  return {
    SSC: has('(?:ssc(?:[0-9]{2,4})?|এসএসসি|এস এস সি|নবম|দশম|9ম|10ম)') || has('(?:class|ক্লাস|শ্রেণি|শ্রেণী) (?:9|10|ix|x)(?: (?:and|ও) (?:9|10|ix|x))?') || has('(?:9|10|ix|x) (?:class|শ্রেণি|শ্রেণী)'),
    HSC: has('(?:hsc(?:[0-9]{2,4})?|এইচএসসি|এইচ এস সি|একাদশ|দ্বাদশ|11শ|12শ)') || has('(?:class|ক্লাস|শ্রেণি|শ্রেণী) (?:11|12|xi|xii)(?: (?:and|ও) (?:11|12|xi|xii))?') || has('(?:11|12|xi|xii) (?:class|শ্রেণি|শ্রেণী)'),
  };
}
function paperNumbers(text: string) {
  const found = new Set<number>();
  if (/(?:^| )(?:1st|first|1ম|প্রথম|i|1) (?:paper|পত্র)(?= |$)|(?:^| )(?:paper|পত্র) (?:1|i)(?= |$)/u.test(text)) found.add(1);
  if (/(?:^| )(?:2nd|second|2য়|2য়|দ্বিতীয়|দ্বিতীয়|ii|2) (?:paper|পত্র)(?= |$)|(?:^| )(?:paper|পত্র) (?:2|ii)(?= |$)/u.test(text)) found.add(2);
  return found;
}
const commonWords = new Set(['and', 'the', 'of', 'a', 'an', 'in', 'to', 'ও', 'এবং']);
function nameMatch(text: string, name: string) {
  const normalized = normalizeVideoText(name);
  if (!normalized) return false;
  if (` ${text} `.includes(` ${normalized} `)) return true;
  const words = normalized.split(' ').filter(word => !commonWords.has(word));
  // Partial matching requires at least two meaningful words; short topics must match exactly.
  return words.length >= 3 && words.filter(word => ` ${text} `.includes(` ${word} `)).length / words.length >= 0.75;
}
export function classifyVideo(context: VideoContext, title: string, description: string): { status: 'matching' | 'uncertain' | 'excluded'; reason: string; exactTitle: boolean } {
  const t = normalizeVideoText(title), d = normalizeVideoText(description);
  const titleLevels = levels(t), descriptionLevels = levels(d);
  const expected = context.level as 'SSC' | 'HSC', opposite = expected === 'SSC' ? 'HSC' : 'SSC';
  const uncertain = (reason: string) => ({ status: 'uncertain' as const, reason, exactTitle: false });
  if (titleLevels[opposite] && !titleLevels[expected]) return { status: 'excluded', reason: 'Different curriculum level.', exactTitle: false };
  if (titleLevels[opposite] && titleLevels[expected]) return uncertain('Title mentions both SSC and HSC. Review the lesson level.');
  const expectedPaper = /1st Paper/i.test(context.subject.name) ? 1 : /2nd Paper/i.test(context.subject.name) ? 2 : 0;
  const papers = paperNumbers(t);
  if (expectedPaper && papers.size && !papers.has(expectedPaper)) return { status: 'excluded', reason: 'Different paper.', exactTitle: false };
  if (papers.size > 1) return uncertain('Title mentions both papers. Review the lesson coverage.');
  const names = [context.chapter.name, context.chapter.banglaName];
  const exactTitle = names.some(name => nameMatch(t, name));
  const topicMatch = exactTitle || names.some(name => nameMatch(d, name));
  const subjectNames = [context.subject.name, context.subject.banglaName].map(name => name.replace(/(?:1st|2nd) Paper/gi, '').replace(/[১২][ময়য়]+\s*পত্র/g, '').trim());
  const subjectMatch = subjectNames.some(name => nameMatch(t, name) || nameMatch(d, name));
  const levelMatch = titleLevels[expected] || (descriptionLevels[expected] && !descriptionLevels[opposite]);
  if (!levelMatch) return uncertain('Curriculum level is not clear.');
  if (!topicMatch) return uncertain('Chapter or lesson match needs review.');
  if (!subjectMatch) return uncertain('Subject or paper context needs review.');
  return { status: 'matching', reason: '', exactTitle };
}
export function durationSeconds(duration: string) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration || '');
  return match ? Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0) : 0;
}
export function selectVideoCandidates(context: VideoContext, items: any[]): SearchVideo[] {
  const seen = new Set<string>();
  return items.flatMap(item => {
    const id = item.id, snippet = item.snippet;
    if (typeof id !== 'string' || !/^[\w-]{11}$/.test(id) || seen.has(id) || !snippet) return [];
    seen.add(id);
    const views = Number(item.statistics?.viewCount), duration = item.contentDetails?.duration;
    if (!Number.isFinite(views) || views < 5000 || durationSeconds(duration) < 300) return [];
    const match = classifyVideo(context, snippet.title || '', snippet.description || '');
    if (match.status === 'excluded') return [];
    return [{ videoId: id, title: String(snippet.title || ''), channelTitle: String(snippet.channelTitle || ''), channelId: String(snippet.channelId || ''),
      thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`, viewCount: String(views), duration: String(duration),
      matchStatus: match.status, matchReason: match.reason, exactTitle: match.exactTitle }];
  }).sort((a, b) => Number(b.matchStatus === 'matching') - Number(a.matchStatus === 'matching') ||
    Number(b.exactTitle) - Number(a.exactTitle) || Number(b.viewCount) - Number(a.viewCount))
    .slice(0, 25).map(({ exactTitle, ...video }) => video);
}
