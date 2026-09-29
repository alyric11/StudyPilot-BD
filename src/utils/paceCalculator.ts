// Planning estimates, not published examination schedules. Months are zero-based.
const SSC_EXAM_MONTH = 1;
const SSC_EXAM_DAY = 1;
const HSC_EXAM_MONTH = 3;
const HSC_EXAM_DAY = 1;
const REVISION_SHARE = 0.25;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getStudyPace(input: {
  totalChapters: number;
  completedChapters: number;
  examYear: string;
  classLevel: string;
  today: Date;
}): {
  status: "ok" | "exam_soon" | "exam_passed" | "all_done";
  remainingChapters: number;
  weeksLeft: number;
  studyWeeks: number;
  chaptersPerWeek: number;
} | null {
  const year = Number(input.examYear);
  const ssc = input.classLevel === "Class 9" || input.classLevel === "Class 10";
  const hsc = input.classLevel === "Class 11" || input.classLevel === "Class 12";
  if (!/^\d{4}$/.test(input.examYear.trim()) || year < 1000 || !Number.isFinite(input.today.getTime())
    || (!ssc && !hsc) || !Number.isFinite(input.totalChapters) || !Number.isFinite(input.completedChapters)) return null;

  // Compare local calendar dates without DST or time-of-day rounding differences.
  const today = Date.UTC(input.today.getFullYear(), input.today.getMonth(), input.today.getDate());
  const exam = Date.UTC(year, ssc ? SSC_EXAM_MONTH : HSC_EXAM_MONTH, ssc ? SSC_EXAM_DAY : HSC_EXAM_DAY);
  const daysLeft = Math.round((exam - today) / DAY_MS);
  const remainingChapters = Math.max(0, input.totalChapters - Math.max(0, input.completedChapters));
  const weeksLeft = Math.max(0, Math.floor(daysLeft / 7));
  const studyWeeks = weeksLeft * (1 - REVISION_SHARE);
  return {
    status: remainingChapters === 0 ? "all_done" : daysLeft < 0 ? "exam_passed" : weeksLeft < 2 ? "exam_soon" : "ok",
    remainingChapters,
    weeksLeft,
    studyWeeks,
    // No usable study week remains: show the status message, never Infinity.
    chaptersPerWeek: studyWeeks > 0 ? Math.ceil(remainingChapters / studyWeeks * 10) / 10 : 0,
  };
}
