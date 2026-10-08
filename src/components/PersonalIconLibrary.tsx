import { icons, type LucideProps } from "lucide-react";

export default function PersonalIconLibrary({ name, ...props }: LucideProps & { name: string }) {
  const Icon = icons[name as keyof typeof icons] ?? icons.BookOpen;
  return <Icon {...props} />;
}
