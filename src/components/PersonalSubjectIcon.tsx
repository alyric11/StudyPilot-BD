import { lazy, Suspense } from "react";
import type { LucideProps } from "lucide-react";
import { personalSubjectIcons } from "../utils/personalSubjectAppearance";

const LibraryIcon = lazy(() => import("./PersonalIconLibrary"));
export default function PersonalSubjectIcon({ name, ...props }: LucideProps & { name: string }) {
  const entry = Object.hasOwn(personalSubjectIcons, name) ? personalSubjectIcons[name as keyof typeof personalSubjectIcons] : undefined;
  if (entry) { const Icon = entry.Icon; return <Icon {...props} />; }
  return <Suspense fallback={<span style={{ display: "inline-block", width: props.size ?? 18, height: props.size ?? 18 }} />}><LibraryIcon name={name} {...props} /></Suspense>;
}
