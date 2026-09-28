export function chapterRowNumber(chapterNumber: string, fallback: number): string {
  // Lessons restart within each unit. Other existing chapter numbering stays unchanged.
  return /^Lesson\s+([0-9০-৯]+)(?=\s|$)/i.exec(chapterNumber)?.[1] ?? String(fallback);
}

