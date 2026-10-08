import { BookOpen, Calculator, Code2, Globe2, Languages, Palette } from "lucide-react";
import iconNames from "./personalIconNames.json";
export { iconNames };
export const personalSubjectIcons = {
  book: { label: "Book", Icon: BookOpen, tint: "#faf7fd", accent: "#855881", border: "#eadff0", iconBackground: "#f1e8f7" },
  math: { label: "Math", Icon: Calculator, tint: "#f3f8ff", accent: "#4870a9", border: "#dce8f7", iconBackground: "#e4eefc" },
  code: { label: "Coding", Icon: Code2, tint: "#f2faf8", accent: "#398475", border: "#d8eee7", iconBackground: "#e0f1eb" },
  globe: { label: "World", Icon: Globe2, tint: "#fff9f1", accent: "#a6793e", border: "#f0e3ce", iconBackground: "#fbecd5" },
  language: { label: "Language", Icon: Languages, tint: "#f7f6ff", accent: "#7563aa", border: "#e4dff5", iconBackground: "#ece7fa" },
  art: { label: "Creative", Icon: Palette, tint: "#fff5f8", accent: "#a76785", border: "#f2dde6", iconBackground: "#f9e5ee" },
};
export type PersonalSubjectIcon = string;
export function personalSubjectIcon(name: string, saved?: string): PersonalSubjectIcon {
  if (saved && (Object.hasOwn(personalSubjectIcons, saved) || iconNames.includes(saved))) return saved;
  if (/math|sat\s*m|গণিত/i.test(name)) return "math";
  if (/cs50|code|coding|program|computer/i.test(name)) return "code";
  if (/history|geography|world|ইতিহাস/i.test(name)) return "globe";
  if (/english|sat\s*e|language|bangla/i.test(name)) return "language";
  if (/art|music|design|draw/i.test(name)) return "art";
  return "book";
}
export function personalSubjectAppearance(name: string, saved?: string) {
  const key = personalSubjectIcon(name, saved);
  if (Object.hasOwn(personalSubjectIcons, key)) return personalSubjectIcons[key as keyof typeof personalSubjectIcons];
  const palettes = Object.values(personalSubjectIcons);
  const hash = [...key].reduce((value, char) => value + char.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}
