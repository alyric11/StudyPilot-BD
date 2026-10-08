// Development-only acceptance fixture. No Firebase calls or real student storage.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { User } from "firebase/auth";
import { AccountContext } from "../src/auth/AccountContext";
import HomeworkManager from "../src/components/HomeworkManager";
import StudyPlanner from "../src/components/StudyPlanner";
import useStudentData from "../src/hooks/useStudentData";
import { NCTB_CURRICULUM } from "../src/data/curriculum";
import type {
  DailyRoutineTask,
  Homework,
  RoutineBlock,
  UserProfile,
} from "../src/types";
import { describeRoutineTask, localDateKey } from "../src/utils/routineTasks";
import { createAccountStorage } from "../src/utils/accountStorage";
import "../src/index.css";

const values = new Map<string, string>();
const base: Storage = {
  get length() {
    return values.size;
  },
  key: (index) => [...values.keys()][index] ?? null,
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => {
    values.set(key, value);
  },
  removeItem: (key) => {
    values.delete(key);
  },
  clear: () => values.clear(),
};
const storage = createAccountStorage(base, "isolated-homework-test");
let failNext = false;
const save = storage.setItem;
storage.setItem = (key, value) => {
  if (failNext && key === "sp_homework") {
    failNext = false;
    throw new Error("Isolated save failure");
  }
  save(key, value);
};
const profile: UserProfile = {
  name: "Test student",
  email: "fixture@example.test",
  school: "Test college",
  classLevel: "Class 11",
  group: "Science",
  board: "Dhaka",
  examYear: "2027",
};
const subjects = NCTB_CURRICULUM[profile.classLevel].subjects.Science;
const subject = subjects.find(
  (subject) => subject.name === "Physics 2nd Paper",
)!;
const personal = [
  { id: "ka", name: "KA Math", icon: "math", createdAt: "2026-10-08" },
];
const date = (offset: number) => {
  const result = new Date();
  result.setDate(result.getDate() + offset);
  return result;
};
const blocks: RoutineBlock[] = [0, 1, 2, 3, 4, 5, 6].flatMap((day) => [
  {
    id: `physics-${day}`,
    title: "Physics-2",
    subjectId: subject.id,
    dayOfWeek: day,
    startTime: "20:00",
    endTime: "21:00",
    color: "cyan",
  },
  {
    id: `ka-${day}`,
    title: "KA Math",
    subjectId: "ka",
    dayOfWeek: day,
    startTime: "21:00",
    endTime: "22:00",
    color: "personal",
  },
]);
const legacy: DailyRoutineTask = {
  date: localDateKey(date(0)),
  block: {
    ...blocks.find((block) => block.id === `physics-${date(0).getDay()}`)!,
    chapterId: subject.chapters[0].id,
    homeworkText: "Coaching CQ ৩–৪",
  },
  ...describeRoutineTask(
    blocks.find((block) => block.id === `physics-${date(0).getDay()}`)!,
    subjects,
    personal,
  ),
  completed: false,
};
const original: Homework[] = [
  {
    id: "today",
    subject: subject.name,
    subjectKey: `subject:${subject.id}`,
    task: "Complete practical notebook",
    chapter: "",
    deadline: localDateKey(date(0)),
    completed: false,
    priority: "high",
  },
  {
    id: "personal",
    subject: "KA Math",
    subjectKey: "additional:ka",
    task: "অঙ্ক ৫–১০\n৩ হয়েছে, বাকিগুলো অনুশীলন করব।",
    chapter: "",
    deadline: "",
    completed: false,
    priority: "medium",
  },
  {
    id: "removed",
    subject: "Former private tutor",
    task: "Finish forgotten work",
    chapter: "Original chapter",
    deadline: localDateKey(date(-2)),
    completed: false,
    priority: "low",
    notes: "Preserved label",
  },
  {
    id: "done",
    subject: subject.name,
    task: "Previous CQ",
    chapter: "",
    deadline: localDateKey(date(-3)),
    completed: true,
    priority: "medium",
  },
  ...Array.from({ length: 8 }, (_, index): Homework => ({
    id: `long-${index}`,
    subject: subject.name,
    subjectKey: `subject:${subject.id}`,
    chapter: "",
    task:
      index === 0
        ? "বাংলা অনুশীলন: গুরুত্বপূর্ণ প্রশ্নগুলো পড়ে নিজের ভাষায় উত্তর লিখতে হবে।\n".repeat(
            8,
          )
        : `Practice set ${index}`,
    deadline: localDateKey(date(index + 1)),
    completed: false,
    priority: "medium",
  })),
];
storage.setItem("sp_profile", JSON.stringify(profile));
storage.setItem("sp_routine", JSON.stringify(blocks));
storage.setItem("sp_daily_routine_tasks", JSON.stringify([legacy]));
storage.setItem("sp_homework", JSON.stringify(original));
storage.setItem("sp_additional_subjects", JSON.stringify(personal));
storage.setItem("sp_diary", "[]");

function Preview() {
  const [page, setPage] = useState("board"),
    [notice, setNotice] = useState("");
  const data = useStudentData(setNotice);
  return (
    <>
      <header className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b bg-white p-3 text-xs">
        <span>Isolated homework test · no student storage</span>
        <button onClick={() => setPage("board")}>Board</button>
        <button onClick={() => setPage("planner")}>Planner</button>
        <button
          onClick={() => {
            failNext = true;
            setNotice("Next homework save will fail once.");
          }}
        >
          Fail next save
        </button>
        <button
          onClick={() => {
            data.resetStudentData();
            data.handleSaveProfile(profile);
            setNotice("Empty test account.");
          }}
        >
          Empty account
        </button>
        <span>
          Pending:{" "}
          {
            data.homeworks.filter((row) => !row.completed && !row.deleted)
              .length
          }
        </span>
      </header>
      <p role="status" className="px-4 py-2 text-xs text-slate-600">
        {notice}
      </p>
      <main className="mx-auto max-w-6xl p-4">
        {page === "board" ? (
          <HomeworkManager
            subjects={subjects}
            additionalSubjects={data.additionalSubjects}
            homeworks={data.homeworks}
            routineBlocks={data.routineBlocks}
            dailyRoutineTasks={data.dailyRoutineTasks}
            onAddHomework={data.handleAddHomework}
            onUpdateHomework={data.handleUpdateHomework}
            onToggleHomework={data.handleToggleHomework}
            onDeleteHomework={data.handleDeleteHomework}
            onPlanHomework={data.handlePlanHomework}
            onOpenPlanner={() => setPage("planner")}
            onOpenChapter={() =>
              setNotice("Valid chapter navigation requested.")
            }
          />
        ) : (
          <StudyPlanner
            profile={profile}
            subjects={subjects}
            additionalSubjects={data.additionalSubjects}
            homeworks={data.homeworks}
            routineBlocks={data.routineBlocks}
            dailyRoutineTasks={data.dailyRoutineTasks}
            onSaveDatedRoutineTask={data.handleSaveDatedRoutineTask}
            onToggleHomework={data.handleToggleHomework}
            onAddRoutineBlock={data.handleAddRoutineBlock}
            onDeleteRoutineBlock={data.handleDeleteRoutineBlock}
            onRestoreRoutineBlock={data.handleRestoreRoutineBlock}
            onUpdateRoutineBlock={data.handleUpdateRoutineBlock}
            onOpenRoutineChapter={() =>
              setNotice("Valid chapter navigation requested.")
            }
          />
        )}
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <AccountContext.Provider
    value={{ user: { uid: "isolated-homework-test" } as User, storage }}
  >
    <Preview />
  </AccountContext.Provider>,
);
