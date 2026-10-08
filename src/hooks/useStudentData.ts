import { useAccount } from "../auth/AccountContext";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    UserProfile,
    StudentProgress,
    Homework,
    AdditionalSubject,
    DiaryEntry,
    ChapterProgress,
    RoutineBlock,
    DailyRoutineTask
} from "../types";
import { migrateHomework, parseHomework, persistHomeworkRecords, homeworkForRoutineSave, homeworkSubjectKey, homeworkSlot, planHomework, homeworkRoutineRecords } from "../utils/homeworkBoard";
import { NCTB_CURRICULUM } from "../data/curriculum";
import {
    parseDailyRoutineTasks,
    setDailyRoutineCompletion,
    snapshotDailyRoutineTasks,
    getScheduledRoutineTasks,
} from "../utils/routineTasks.ts";

export default function useStudentData(
    showToast: (
        message: string,
        type?: "success" | "error" | "info" | "warning"
    ) => void
) {
    const { storage } = useAccount();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [studentProgress, setStudentProgress] =
        useState<StudentProgress>({});
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const homeworksRef = useRef<Homework[]>([]);
    const homeworkReadableRef = useRef(true);
    const [routineBlocks, setRoutineBlocks] = useState<RoutineBlock[]>([]);
    const [dailyRoutineTasks, setDailyRoutineTasks] = useState<DailyRoutineTask[]>([]);
    const dailyRoutineTasksRef = useRef<DailyRoutineTask[]>([]);
    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [additionalSubjects, setAdditionalSubjects] = useState<AdditionalSubject[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      const load = () => {
        homeworkReadableRef.current = true;
        setProfile(null); setStudentProgress({}); setHomeworks([]); homeworksRef.current = []; setRoutineBlocks([]);
        setDailyRoutineTasks([]); dailyRoutineTasksRef.current = [];
        setDiaryEntries([]); setSelectedSubjectIds([]); setAdditionalSubjects([]);
        // Load student profile
        try {
            const savedProfile = storage.getItem("sp_profile");

            if (savedProfile) {
                const parsed = JSON.parse(savedProfile);

                if (
                    parsed &&
                    typeof parsed === "object" &&
                    parsed.name &&
                    parsed.email &&
                    parsed.classLevel
                ) {
                    setProfile(parsed);
                } else {
                    console.warn(
                        "Invalid profile format in storage, resetting."
                    );
                    storage.removeItem("sp_profile");
                }
            }
        } catch (err) {
            console.error(
                "Failed to parse student profile from local storage:",
                err
            );
            storage.removeItem("sp_profile");
        }

        // Load student progress
        try {
            const savedProgress = storage.getItem("sp_progress");

            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);

                if (parsed && typeof parsed === "object") {
                    setStudentProgress(parsed);
                } else {
                    console.warn(
                        "Corrupted progress data, resetting progress map."
                    );
                    storage.removeItem("sp_progress");
                }
            }
        } catch (err) {
            console.error(
                "Failed to parse student progress from local storage:",
                err
            );
            storage.removeItem("sp_progress");
        }

        // Load homework
        try {
            const savedHomework = storage.getItem("sp_homework");

            if (savedHomework) {
                const parsed = parseHomework(savedHomework);

                if (Array.isArray(parsed)) {
                    setHomeworks(parsed); homeworksRef.current = parsed;
                } else {
                    throw new Error("Homework records are not an array.");
                }
            } else {
                setHomeworks([]); homeworksRef.current = [];
            }
        } catch (err) {
            homeworkReadableRef.current = false;
            console.error(
                "Failed to parse homework data from local storage:",
                err
            );
            showToast("Homework could not be read. The original records have been kept.", "error");
        }

        // Load weekly routine
        try {
            const savedRoutine = storage.getItem("sp_routine");

            if (savedRoutine) {
                const parsed = JSON.parse(savedRoutine);

                if (Array.isArray(parsed)) {
                    setRoutineBlocks(parsed);
                } else {
                    console.warn(
                        "Invalid routine data, resetting routine."
                    );
                    storage.removeItem("sp_routine");
                }
            }
        } catch (err) {
            console.error(
                "Failed to parse routine data from local storage:",
                err
            );
            storage.removeItem("sp_routine");
        }

        // Dated sessions are stored separately from the recurring schedule.
        try {
            const records = parseDailyRoutineTasks(storage.getItem("sp_daily_routine_tasks"));
            dailyRoutineTasksRef.current = records;
            setDailyRoutineTasks(records);
        } catch (err) {
            console.error("Failed to load daily routine tasks:", err);
        }

        // Load study diary
        try {
            const savedDiary = storage.getItem("sp_diary");

            if (savedDiary) {
                const parsed = JSON.parse(savedDiary);

                if (Array.isArray(parsed)) {
                    setDiaryEntries(parsed);
                } else {
                    throw new Error("Diary entries are not an array.");
                }
            } else {
                const demoDiary: DiaryEntry[] = [
                    {
                        id: "diary1",
                        title: "Vector Dot & Cross Product Rules",
                        content:
                            "Dot Product (A.B) = AB cos(θ). Cross Product (A x B) = AB sin(θ) η.\nRemember: If two vectors are perpendicular, their dot product is zero! Extremely common trick in board questions.",
                        category: "formula",
                        subject: "Physics 1st Paper",
                        chapter: "Vector",
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: "diary2",
                        title: "Cr & Cu Electronic Configuration",
                        content:
                            "Chromium (Z=24): [Ar] 3d5 4s1 instead of 3d4 4s2.\nCopper (Z=29): [Ar] 3d10 4s1 instead of 3d9 4s2.\nReason: Half-filled (d5) and fully-filled (d10) orbitals possess extra stability due to symmetry and exchange energy.",
                        category: "notes",
                        subject: "Chemistry 1st Paper",
                        chapter: "Qualitative Chemistry",
                        createdAt: new Date(
                            Date.now() - 86400000
                        ).toISOString()
                    }
                ];

                setDiaryEntries(demoDiary);
                storage.setItem(
                    "sp_diary",
                    JSON.stringify(demoDiary)
                );
            }
        } catch (err) {
            console.error(
                "Failed to parse diary entries from local storage:",
                err
            );
            storage.removeItem("sp_diary");
        }

        // Load student-created additional subjects
        try {
            const savedAdditionalSubjects = storage.getItem(
                "sp_additional_subjects"
            );

            if (savedAdditionalSubjects) {
                const parsed = JSON.parse(savedAdditionalSubjects);

                if (Array.isArray(parsed)) {
                    setAdditionalSubjects(
                        parsed
                            .filter(
                                (subject) =>
                                    subject &&
                                    typeof subject.id === "string" &&
                                    typeof subject.name === "string"
                            )
                            .slice(0, 6)
                    );
                } else {
                    storage.removeItem("sp_additional_subjects");
                }
            }
        } catch (err) {
            console.error("Failed to parse additional subjects:", err);
            storage.removeItem("sp_additional_subjects");
        }

        // Load student's selected optional subjects
        try {
            const savedSubjects = storage.getItem(
                "sp_selected_subjects"
            );

            if (savedSubjects) {
                const parsed = JSON.parse(savedSubjects);

                if (Array.isArray(parsed)) {
                    setSelectedSubjectIds(parsed);
                } else {
                    console.warn(
                        "Invalid selected subjects data, resetting."
                    );
                    storage.removeItem("sp_selected_subjects");
                }
            }
        } catch (err) {
            console.error(
                "Failed to parse selected subjects from local storage:",
                err
            );
            storage.removeItem("sp_selected_subjects");
        }

        setLoaded(true);
      };
      load();
      return storage.subscribe?.(load);
    }, [storage]);

    const homeworkSubjects = profile ? NCTB_CURRICULUM[profile.classLevel]?.subjects[profile.group || "None"] || [] : [];
    const persistHomework = (updated: Homework[]) => {
      try {
        if (!homeworkReadableRef.current) throw new Error("Original homework could not be read.");
        const saved = persistHomeworkRecords(storage, updated, dailyRoutineTasksRef.current);
        homeworksRef.current = saved; setHomeworks(saved); return true;
      } catch {
        showToast("Could not save homework. Your draft has been kept. Please retry.", "error"); return false;
      }
    };
    useEffect(() => {
      if (!loaded || !profile || !homeworkReadableRef.current) return;
      const migrated = migrateHomework(homeworksRef.current, dailyRoutineTasksRef.current);
      if (JSON.stringify(migrated) === JSON.stringify(homeworksRef.current)) return;
      try {
        if (persistHomework(migrated)) showToast("Routine homework is now on the Board. Please review its done status; study-session completion is separate.", "info");
      } catch { showToast("Homework migration could not be backed up. Please download a backup and retry.", "error"); }
    }, [loaded, profile, homeworks, dailyRoutineTasks, storage]);

    const handleSaveProfile = (newProfile: UserProfile) => {
        setProfile(newProfile);
        storage.setItem(
            "sp_profile",
            JSON.stringify(newProfile)
        );

        const classConfig =
            NCTB_CURRICULUM[newProfile.classLevel];

        if (classConfig) {
            const activeGroup =
                newProfile.group &&
                    classConfig.subjects[newProfile.group]
                    ? newProfile.group
                    : "None";

            const subjectList =
                classConfig.subjects[activeGroup] || [];

            const initialProg: StudentProgress = {};

            subjectList.forEach((sub) => {
                initialProg[sub.id] = {};

                sub.chapters.forEach((ch) => {
                    initialProg[sub.id][ch.id] =
                    {
                        readOverview: false,
                        watchedIntroVideo: false,
                        readTextbook: false,
                        watchedLectures: false,
                        solvedExercises: false,
                        solvedBoardQuestions: false,
                        madeNotes: false,
                        timedExams: false,
                        revisionCompleted: false
                    }
                });
            });

            setStudentProgress(initialProg);
            storage.setItem(
                "sp_progress",
                JSON.stringify(initialProg)
            );
        }

        showToast(
            `Profile configured! Welcome to StudyPilot BD, ${newProfile.name}!`,
            "success"
        );
    };

    const handleUpdateChapterProgress = (
        subjectId: string,
        chapterId: string,
        progress: ChapterProgress
    ) => {
        const updated = {
            ...studentProgress,
            [subjectId]: {
                ...(studentProgress[subjectId] || {}),
                [chapterId]: progress
            }
        };

        setStudentProgress(updated);
        storage.setItem(
            "sp_progress",
            JSON.stringify(updated)
        );
    };

    // Add weekly routine block
    const handleAddRoutineBlock = (
        newBlock: Omit<RoutineBlock, "id">
    ) => {
        const block: RoutineBlock = {
            ...newBlock,
            id: `routine_${Date.now()}`
        };

        const updated = [...routineBlocks, block];

        setRoutineBlocks(updated);
        storage.setItem(
            "sp_routine",
            JSON.stringify(updated)
        );

        showToast(
            "Routine block added successfully!",
            "success"
        );
    };

    // Delete weekly routine block
    const handleDeleteRoutineBlock = (id: string) => {
        const updated = routineBlocks.filter(
            (block) => block.id !== id
        );

        setRoutineBlocks(updated);
        storage.setItem(
            "sp_routine",
            JSON.stringify(updated)
        );

        showToast("Routine block deleted.", "info");
    };

    // Restore the exact saved block after an immediate Undo. Keeping its ID
    // preserves its connection to recorded daily routine sessions.
    const handleRestoreRoutineBlock = (block: RoutineBlock) => {
        if (routineBlocks.some((item) => item.id === block.id)) return;
        const updated = [...routineBlocks, block];
        setRoutineBlocks(updated);
        storage.setItem("sp_routine", JSON.stringify(updated));
        showToast("Routine block restored.", "success");
    };

    const handleUpdateRoutineBlock = (
        id: string,
        updatedBlock: Omit<RoutineBlock, "id">
    ) => {
        const updated = routineBlocks.map((block) =>
            block.id === id ? { ...updatedBlock, id } : block
        );

        setRoutineBlocks(updated);
        storage.setItem("sp_routine", JSON.stringify(updated));
        showToast("Routine updated successfully!", "success");
    };

    const handleSetDailyRoutineCompletion = (
        task: DailyRoutineTask,
        completed: boolean
    ) => {
        const updated = setDailyRoutineCompletion(
            dailyRoutineTasksRef.current,
            task,
            completed
        );

        try {
            storage.setItem(
                "sp_daily_routine_tasks",
                JSON.stringify(updated)
            );

            dailyRoutineTasksRef.current = updated;
            setDailyRoutineTasks(updated);

            return true;
        } catch (err) {
            console.error("Failed to save task completion:", err);

            showToast(
                "Could not save this task. Please try again.",
                "error"
            );

            return false;
        }
    };

    const handleSnapshotDailyRoutineTasks = (
        tasks: DailyRoutineTask[]
    ) => {
        const updated = snapshotDailyRoutineTasks(
            dailyRoutineTasksRef.current,
            tasks
        );

        if (updated === dailyRoutineTasksRef.current) {
            return true;
        }

        try {
            storage.setItem(
                "sp_daily_routine_tasks",
                JSON.stringify(updated)
            );

            dailyRoutineTasksRef.current = updated;
            setDailyRoutineTasks(updated);

            return true;
        } catch (err) {
            console.error(
                "Failed to save daily routine snapshot:",
                err
            );

            return false;
        }
    };

    // Save or replace one date-specific routine task.
    // This keeps homework attached to a single calendar date instead of
    // changing the recurring weekly Mother Routine.
    const handleSaveDatedRoutineTask = (task: DailyRoutineTask, remaining?: string, restoreId?: string) => {
      if (!homeworkReadableRef.current) {
        showToast("Homework could not be read safely. Download a backup and reload before editing; your draft is kept.", "error");
        return false;
      }
      // Reconcile first even if the initial migration failed. Clearing a session
      // must never erase its only instruction before it is backed up and imported.
      const rows = migrateHomework(homeworksRef.current, dailyRoutineTasksRef.current);
      const slot = homeworkSlot(task.date, task.block.id);
      const text = task.block.homeworkText?.trim();
      let existing: Homework | undefined;
      try { existing = homeworkForRoutineSave(rows, task.date, task.block.id, restoreId); }
      catch (error) { showToast((error as Error).message, "error"); return false; }
      let updated = rows;
      if (text) {
        const assignment: Homework = existing ? { ...existing, ...(!restoreId ? { task: text, chapterId: task.block.chapterId,
          chapter: task.block.chapterId ? task.chapterBanglaName : "", ...(remaining !== undefined ? { remaining } : {}) } : {}), sessions: { ...existing.sessions, [slot]: true } } : { id: "hw_" + crypto.randomUUID(), subject: task.subjectName,
          subjectKey: task.subjectKey ?? undefined, chapterId: task.block.chapterId, chapter: task.block.chapterId ? task.chapterBanglaName : "",
          task: text, remaining, deadline: "", priority: "medium", completed: false, sessions: { [slot]: true } };
        updated = existing ? updated.map(row => row.id === existing.id ? assignment : row) : [...updated, assignment];
      } else if (existing) updated = planHomework(updated, existing.id, task.date, task.block.id, false);
      if (updated !== homeworksRef.current && !persistHomework(updated)) return false;
      const records = [...dailyRoutineTasksRef.current.filter(row => !(row.date === task.date && row.block.id === task.block.id)), { ...task, block: { ...task.block } }];
      try {
        storage.setItem("sp_daily_routine_tasks", JSON.stringify(records));
        dailyRoutineTasksRef.current = records; setDailyRoutineTasks(records); return true;
      } catch { showToast("Could not save this session. Please retry; your homework draft is kept.", "error"); return false; }
    };

    const handleAddHomework = (newHw: Omit<Homework, "id" | "completed">) =>
      persistHomework([...homeworksRef.current, { ...newHw, id: "hw_" + crypto.randomUUID(), completed: false }]);
    const handleUpdateHomework = (id: string, patch: Partial<Homework>) => {
      if (!homeworksRef.current.some(row => row.id === id && !row.deleted)) return false;
      return persistHomework(homeworksRef.current.map(row => {
        if (row.id !== id) return row;
        const changedSubject = patch.subjectKey !== undefined && patch.subjectKey !== homeworkSubjectKey(row, homeworkSubjects, additionalSubjects);
        return { ...row, ...patch, id, ...(changedSubject ? { sessions: Object.fromEntries(Object.keys(row.sessions || {}).map(slot => [slot, false])) } : {}) };
      }));
    };
    const handleToggleHomework = (id: string) => {
      const row = homeworksRef.current.find(row => row.id === id && !row.deleted);
      return row ? handleUpdateHomework(id, { completed: !row.completed }) : false;
    };
    const handleDeleteHomework = (id: string) => handleUpdateHomework(id, { deleted: true });
    const handlePlanHomework = (id: string, date: string, routineId: string, linked: boolean) => {
      try {
        if (linked) {
          const row = homeworksRef.current.find(row => row.id === id);
          const slot = getScheduledRoutineTasks(date, routineBlocks, dailyRoutineTasks, homeworkSubjects, additionalSubjects).find(task => task.block.id === routineId);
          const subjectKey = row ? homeworkSubjectKey(row, homeworkSubjects, additionalSubjects) : "";
          const start = new Date(`${date}T${slot?.block.startTime || "00:00"}`);
          if (!slot || !subjectKey || slot.subjectKey !== subjectKey || slot.completed || start <= new Date()) throw new Error("Choose an upcoming study slot for this exact subject.");
        }
        return persistHomework(planHomework(homeworksRef.current, id, date, routineId, linked));
      }
      catch (error) { showToast((error as Error).message, "error"); return false; }
    };

    const handleAddDiaryEntry = (
        newEntry: Omit<DiaryEntry, "id" | "createdAt">
    ) => {
        const entry: DiaryEntry = {
            ...newEntry,
            id: `diary_${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        const updated = [entry, ...diaryEntries];

        setDiaryEntries(updated);
        storage.setItem(
            "sp_diary",
            JSON.stringify(updated)
        );

        showToast(
            "New entry logged in your Study Diary!",
            "success"
        );
    };

    const handleDeleteDiaryEntry = (id: string) => {
        const updated = diaryEntries.filter(
            (d) => d.id !== id
        );

        setDiaryEntries(updated);
        storage.setItem(
            "sp_diary",
            JSON.stringify(updated)
        );

        showToast(
            "Diary entry deleted successfully.",
            "info"
        );
    };

    // Toggle a selectable subject on/off
    const toggleSubjectSelection = (subjectId: string) => {
        const updated = selectedSubjectIds.includes(subjectId)
            ? selectedSubjectIds.filter(
                (id) => id !== subjectId
            )
            : [...selectedSubjectIds, subjectId];

        setSelectedSubjectIds(updated);

        storage.setItem(
            "sp_selected_subjects",
            JSON.stringify(updated)
        );
    };

    const toggleSubjectGroupSelection = (
        subjectIds: string[]
    ) => {
        const anySelected = subjectIds.some((id) =>
            selectedSubjectIds.includes(id)
        );

        const updated = anySelected
            ? selectedSubjectIds.filter(
                (id) => !subjectIds.includes(id)
            )
            : [
                ...selectedSubjectIds,
                ...subjectIds.filter(
                    (id) =>
                        !selectedSubjectIds.includes(id)
                )
            ];

        setSelectedSubjectIds(updated);

        storage.setItem(
            "sp_selected_subjects",
            JSON.stringify(updated)
        );
    };

    // Add a student-created subject. Maximum 6.
    const handleAddAdditionalSubject = (name: string) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            showToast("Please enter a subject name.", "warning");
            return false;
        }

        if (additionalSubjects.length >= 6) {
            showToast("You can add up to 6 additional subjects.", "warning");
            return false;
        }

        if (
            additionalSubjects.some(
                (subject) =>
                    subject.name.trim().toLowerCase() === trimmedName.toLowerCase()
            )
        ) {
            showToast("That additional subject already exists.", "warning");
            return false;
        }

        const subject: AdditionalSubject = {
            id: `additional_subject_${Date.now()}`,
            name: trimmedName,
            createdAt: new Date().toISOString()
        };

        const updated = [...additionalSubjects, subject];
        setAdditionalSubjects(updated);
        storage.setItem("sp_additional_subjects", JSON.stringify(updated));

        showToast(`"${trimmedName}" added to Additional Subjects.`, "success");
        return true;
    };

    const handleDeleteAdditionalSubject = (id: string) => {
        const updated = additionalSubjects.filter((subject) => subject.id !== id);

        setAdditionalSubjects(updated);
        storage.setItem("sp_additional_subjects", JSON.stringify(updated));

        showToast("Additional subject removed.", "info");
    };

    const handleUpdateAdditionalSubject = (id: string, name: string, icon?: string) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            showToast("Please enter a subject name.", "warning");
            return false;
        }

        if (additionalSubjects.some(
            (subject) => subject.id !== id && subject.name.trim().toLowerCase() === trimmedName.toLowerCase()
        )) {
            showToast("That additional subject already exists.", "warning");
            return false;
        }

        const updated = additionalSubjects.map((subject) =>
            subject.id === id ? { ...subject, name: trimmedName, ...(icon ? { icon } : {}) } : subject
        );

        setAdditionalSubjects(updated);
        storage.setItem("sp_additional_subjects", JSON.stringify(updated));
        showToast("Personal subject updated.", "success");
        return true;
    };

    const resetStudentData = () => {
        storage.clear();

        setProfile(null);
        setStudentProgress({});
        setHomeworks([]);
        homeworksRef.current = [];
        setRoutineBlocks([]);
        dailyRoutineTasksRef.current = [];
        setDailyRoutineTasks([]);
        setDiaryEntries([]);
        setSelectedSubjectIds([]);
        setAdditionalSubjects([]);
    };

    const resolvedDailyRoutineTasks = useMemo(() => homeworkRoutineRecords(homeworks, dailyRoutineTasks, routineBlocks, homeworkSubjects, additionalSubjects), [homeworks, dailyRoutineTasks, routineBlocks, homeworkSubjects, additionalSubjects]);
    return {
        profile,
        studentProgress,
        homeworks,
        routineBlocks,
        dailyRoutineTasks: resolvedDailyRoutineTasks,
        diaryEntries,
        selectedSubjectIds,
        loaded,

        handleSaveProfile,
        handleUpdateChapterProgress,

        handleAddRoutineBlock,
        handleDeleteRoutineBlock,
        handleRestoreRoutineBlock,
        handleUpdateRoutineBlock,
        handleSetDailyRoutineCompletion,
        handleSnapshotDailyRoutineTasks,
        handleSaveDatedRoutineTask,

        handleUpdateHomework,
        handlePlanHomework,
        handleAddHomework,
        handleToggleHomework,
        handleDeleteHomework,

        handleAddDiaryEntry,
        handleDeleteDiaryEntry,

        toggleSubjectSelection,
        toggleSubjectGroupSelection,

        additionalSubjects,
        handleAddAdditionalSubject,
        handleUpdateAdditionalSubject,
        handleDeleteAdditionalSubject,

        resetStudentData
    };
}
