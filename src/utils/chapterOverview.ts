import type { ChapterOverviewData } from "../types";

export const isOverviewHeading = (line: string) =>
  /^\*\*.+\*\*$/.test(line.trim()) || /^#{1,6}\s+\S/.test(line.trim()) ||
  /^(chapter overview|overview|important topics)\s*:?$/i.test(line.trim());

export const formatOverviewForEditor = (overview: ChapterOverviewData) => [
  "CHAPTER OVERVIEW", overview.introduction, ...(
    overview.importantTopics.length ? ["", "IMPORTANT TOPICS",
      ...overview.importantTopics.flatMap((topic, index) => [
        `${index + 1}. ${topic.topic}`, topic.description, "",
      ])] : []
  ),
].join("\n").trim();

// If topic boundaries are ambiguous, preserve the entire document as text.
// Never discard unnumbered paragraphs or topics without descriptions.
export function parseOverviewFromEditor(text: string): ChapterOverviewData | null {
  const normalized = text.replace(/\r\n?/g, "\n").trim()
    .replace(/^CHAPTER OVERVIEW\s*:?\s*\n/i, "").trim();
  if (!normalized || /^CHAPTER OVERVIEW\s*:?$/i.test(normalized)) return null;
  const fallback = { introduction: normalized, importantTopics: [] };
  const sections = normalized.split(/^\s*IMPORTANT TOPICS\s*:?\s*$/im);
  if (sections.length !== 2 || !sections[0].trim()) return fallback;
  const topics: ChapterOverviewData["importantTopics"] = [];
  let active: { topic: string; lines: string[] } | null = null;
  for (const line of sections[1].split("\n")) {
    const match = line.match(/^\s*(?:[0-9০-৯]+[.)]\s+|#{1,6}\s+)(.+?)\s*$/)
      ?? line.match(/^\s*\*\*(.+)\*\*\s*$/);
    if (match) {
      if (active) topics.push({ topic: active.topic, description: active.lines.join("\n").trim() });
      active = { topic: match[1], lines: [] };
    } else if (active) active.lines.push(line);
    else if (line.trim()) return fallback;
  }
  if (active) topics.push({ topic: active.topic, description: active.lines.join("\n").trim() });
  if (!topics.length || topics.some(topic => !topic.description)) return fallback;
  return { introduction: sections[0].trim(), importantTopics: topics };
}
