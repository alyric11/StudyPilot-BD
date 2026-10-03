export interface PointContext {
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
}
export interface DifficultPoint extends PointContext {
  id: string;
  text: string;
  reference: string;
  createdAt: string;
  resolved: boolean;
  explanation: string;
}
export const DIFFICULT_POINTS_KEY = "sp_difficult_points";

export function readDifficultPoints(storage: Pick<Storage, "getItem"> = localStorage): DifficultPoint[] {
  const raw = storage.getItem(DIFFICULT_POINTS_KEY);
  if (!raw) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value) || value.some(item => !item ||
    ["id", "text", "reference", "createdAt", "subjectId", "subjectName", "chapterId", "chapterName", "explanation"]
      .some(key => typeof item[key] !== "string") || typeof item.resolved !== "boolean")) {
    throw new Error("Your saved points could not be read. They have not been changed.");
  }
  return value;
}

export function updateDifficultPoints(change: (points: DifficultPoint[]) => DifficultPoint[], storage: Pick<Storage, "getItem" | "setItem"> = localStorage) {
  const next = change(readDifficultPoints(storage));
  storage.setItem(DIFFICULT_POINTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("difficult-points-changed"));
}
