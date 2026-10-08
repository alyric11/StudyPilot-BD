// Development-only fixture: never reads or writes student storage.
// Open /tests/planner-preview.html while the development server is running.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import StudyPlanner from "../src/components/StudyPlanner";
import "../src/index.css";
import type { Subject } from "../src/data/curriculum";
import type { DailyRoutineTask, RoutineBlock, RoutineEditRequest, UserProfile } from "../src/types";
import { describeRoutineTask, localDateKey } from "../src/utils/routineTasks";

const subjects: Subject[] = [1, 2].map(paper => ({
  id: `physics${paper}`, name: `Physics ${paper === 1 ? "1st" : "2nd"} Paper`, banglaName: "পদার্থবিজ্ঞান", color: "cyan",
  chapters: [1, 2].map(n => ({
    id: `p${paper}c${n}`, chapterNumber: `Chapter ${n}`, name: `Chapter ${n}`, banglaName: n === 1 ? "ভৌত জগৎ ও পরিমাপ" : "ভেক্টর",
    shortDescription: "", class: "Class 11", group: "Science", subject: "Physics", nctbBookName: "Physics",
  })),
}));
const initialBlocks: RoutineBlock[] = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 6 }, (_, index) => ({
    id: `test-${day}-${index}`, dayOfWeek: day, title: index === 5 ? "Practice" : `Physics-${index % 2 + 1}`,
    subjectId: index === 5 ? undefined : `physics${index % 2 + 1}`,
    startTime: `${String(10 + index * 2).padStart(2, "0")}:00`, endTime: `${String(11 + index * 2).padStart(2, "0")}:00`, color: index === 5 ? "amber" : "cyan",
  }))
).flat();
const today = localDateKey(new Date());
const initialRecords: DailyRoutineTask[] = initialBlocks.filter(block => block.dayOfWeek === new Date().getDay()).map(block => {
  const dated = { ...block, chapterId: block.subjectId ? `p${block.subjectId.slice(-1)}c2` : undefined, homeworkText: "Read pages 12–15 and solve questions 1–3." };
  return { date: today, block: dated, ...describeRoutineTask(dated, subjects, []), completed: false };
});
function Preview() {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [records, setRecords] = useState(initialRecords);
  const [request, setRequest] = useState<RoutineEditRequest | null>(null);
  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <span>Isolated planner test — no student storage</span><span data-test-user>Test student</span>
      </header>
      <main className="p-4">
        <button className="mb-3 rounded-lg border bg-white p-2" onClick={() => {
          const date = new Date(); date.setDate(date.getDate() + 7);
          setRequest({ routineId: `test-${date.getDay()}-0`, occurrenceDate: localDateKey(date), requestId: String(Date.now()) });
        }}>Prepare next Physics task</button>
        <StudyPlanner profile={{} as UserProfile} subjects={subjects} routineBlocks={blocks} dailyRoutineTasks={records}
          editRoutineRequest={request} onEditRequestHandled={() => setRequest(null)}
          onSaveDatedRoutineTask={task => { setRecords(old => [...old.filter(item => item.date !== task.date || item.block.id !== task.block.id), task]); return true; }}
          onAddRoutineBlock={block => setBlocks(old => [...old, { ...block, id: `test-new-${Date.now()}` }])}
          onUpdateRoutineBlock={(id, block) => setBlocks(old => old.map(item => item.id === id ? { ...block, id } : item))}
          onDeleteRoutineBlock={id => setBlocks(old => old.filter(item => item.id !== id))}
          onRestoreRoutineBlock={block => setBlocks(old => [...old, block])}
          onOpenRoutineChapter={() => {}}
        />
        <details className="mt-4"><summary>Test records</summary><pre>{JSON.stringify({ blocks, records }, null, 2)}</pre></details>
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
