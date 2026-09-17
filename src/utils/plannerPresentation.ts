import type { FloatingPlacement } from "./floatingPosition";

export function routineDuration(start: string, end: string) {
  const minutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };
  return (minutes(end) - minutes(start) + 1440) % 1440;
}

export function durationDescription(start: string, end: string) {
  const duration = routineDuration(start, end);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const label = [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""].filter(Boolean).join(" ") || "0m";
  return `${label}${end < start ? " · ends next day" : ""}`;
}

// Saturday-first week. A weekday selection changes the preview, not the
// persistence model: a routine remains a weekly repeat, never a dated booking.
export function dateInViewedWeek(anchor: Date, weekday: number) {
  const date = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  date.setDate(date.getDate() - (date.getDay() + 1) % 7 + (weekday + 1) % 7);
  return date;
}

export function popupOffset(placement: FloatingPlacement) {
  return { x: placement === "left" ? 6 : placement === "right" ? -6 : 0,
    y: placement === "above" ? 6 : placement === "below" ? -6 : 0 };
}

export function firstSixRowsHeight(heights: number[], gap: number, padding: number) {
  const rows = heights.slice(0, 6);
  return rows.reduce((total, height) => total + height, padding) + Math.max(0, rows.length - 1) * gap;
}
