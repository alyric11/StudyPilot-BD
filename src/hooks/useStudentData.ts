import { useEffect, useState } from "react";
import {
    UserProfile,
    StudentProgress,
    Homework,
    DiaryEntry,
    ChapterProgress
} from "../types";
import { NCTB_CURRICULUM } from "../data/curriculum";

export default function useStudentData(showToast: (
    message: string,
    type?: "success" | "error" | "info" | "warning"
) => void) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [studentProgress, setStudentProgress] = useState<StudentProgress>({});
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem("sp_profile");

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
                    console.warn("Invalid profile format in storage, resetting.");
                    localStorage.removeItem("sp_profile");
                }
            }
        } catch (err) {
            console.error(
                "Failed to parse student profile from local storage:",
                err
            );
            localStorage.removeItem("sp_profile");
        }

        try {
            const savedProgress = localStorage.getItem("sp_progress");

            if (savedProgress) {
                const parsed = JSON.parse(savedProgress);

                if (parsed && typeof parsed === "object") {
                    setStudentProgress(parsed);
                } else {
                    console.warn("Corrupted progress data, resetting progress map.");
                    localStorage.removeItem("sp_progress");
                }
            }
        } catch (err) {
            console.error(
                "Failed to parse student progress from local storage:",
                err
            );
            localStorage.removeItem("sp_progress");
        }

        try {
            const savedHomework = localStorage.getItem("sp_homework");

            if (savedHomework) {
                const parsed = JSON.parse(savedHomework);

                if (Array.isArray(parsed)) {
                    setHomeworks(parsed);
                } else {
                    throw new Error("Homework records are not an array.");
                }
            } else {
                const demoHw: Homework[] = [
                    {
                        id: "hw1",
                        subject: "Physics 1st Paper",
                        chapter: "Vector",
                        task: "Solve previous 5 years' board exam Creative Questions (CQs) of Dhaka and Rajshahi Board.",
                        deadline: new Date(Date.now() + 86400000 * 2)
                            .toISOString()
                            .split("T")[0],
                        priority: "high",
                        completed: false,
                        notes:
                            "Focus heavily on the river-boat navigation and vector multiplication sums."
                    },
                    {
                        id: "hw2",
                        subject: "Chemistry 1st Paper",
                        chapter: "Qualitative Chemistry",
                        task: "Revise electronic configuration principles and exceptions (Cr, Cu).",
                        deadline: new Date(Date.now() + 86400000 * 4)
                            .toISOString()
                            .split("T")[0],
                        priority: "medium",
                        completed: true
                    }
                ];

                setHomeworks(demoHw);
                localStorage.setItem("sp_homework", JSON.stringify(demoHw));
            }
        } catch (err) {
            console.error(
                "Failed to parse homework data from local storage:",
                err
            );
            localStorage.removeItem("sp_homework");
        }

        try {
            const savedDiary = localStorage.getItem("sp_diary");

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
                        createdAt: new Date(Date.now() - 86400000).toISOString()
                    }
                ];

                setDiaryEntries(demoDiary);
                localStorage.setItem("sp_diary", JSON.stringify(demoDiary));
            }
        } catch (err) {
            console.error(
                "Failed to parse diary entries from local storage:",
                err
            );
            localStorage.removeItem("sp_diary");
        }

        // Load student's selected optional subjects
        try {
            const savedSubjects = localStorage.getItem("sp_selected_subjects");

            if (savedSubjects) {
                const parsed = JSON.parse(savedSubjects);

                if (Array.isArray(parsed)) {
                    setSelectedSubjectIds(parsed);
                } else {
                    console.warn(
                        "Invalid selected subjects data, resetting."
                    );
                    localStorage.removeItem("sp_selected_subjects");
                }
            }
        } catch (err) {
            console.error(
                "Failed to parse selected subjects from local storage:",
                err
            );
            localStorage.removeItem("sp_selected_subjects");
        }

        setLoaded(true);
    }, []);

    const handleSaveProfile = (newProfile: UserProfile) => {
        setProfile(newProfile);
        localStorage.setItem("sp_profile", JSON.stringify(newProfile));

        const classConfig = NCTB_CURRICULUM[newProfile.classLevel];

        if (classConfig) {
            const activeGroup =
                newProfile.group && classConfig.subjects[newProfile.group]
                    ? newProfile.group
                    : "None";

            const subjectList = classConfig.subjects[activeGroup] || [];
            const initialProg: StudentProgress = {};

            subjectList.forEach((sub) => {
                initialProg[sub.id] = {};

                sub.chapters.forEach((ch) => {
                    initialProg[sub.id][ch.id] = {
                        readTextbook: false,
                        watchedLectures: false,
                        solvedExercises: false,
                        solvedBoardQuestions: false,
                        madeNotes: false,
                        revisionCompleted: false
                    };
                });
            });

            setStudentProgress(initialProg);
            localStorage.setItem("sp_progress", JSON.stringify(initialProg));
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
        localStorage.setItem("sp_progress", JSON.stringify(updated));
    };

    const handleAddHomework = (
        newHw: Omit<Homework, "id" | "completed">
    ) => {
        const hw: Homework = {
            ...newHw,
            id: `hw_${Date.now()}`,
            completed: false
        };

        const updated = [hw, ...homeworks];

        setHomeworks(updated);
        localStorage.setItem("sp_homework", JSON.stringify(updated));

        showToast("New assignment successfully added!", "success");
    };

    const handleToggleHomework = (id: string) => {
        const homework = homeworks.find((h) => h.id === id);

        const updated = homeworks.map((h) =>
            h.id === id ? { ...h, completed: !h.completed } : h
        );

        setHomeworks(updated);
        localStorage.setItem("sp_homework", JSON.stringify(updated));

        if (homework) {
            if (!homework.completed) {
                showToast(
                    "Assignment marked as completed! Keep it up!",
                    "success"
                );
            } else {
                showToast("Assignment marked as active.", "info");
            }
        }
    };

    const handleDeleteHomework = (id: string) => {
        const updated = homeworks.filter((h) => h.id !== id);

        setHomeworks(updated);
        localStorage.setItem("sp_homework", JSON.stringify(updated));

        showToast("Assignment deleted from your board.", "info");
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
        localStorage.setItem("sp_diary", JSON.stringify(updated));

        showToast("New entry logged in your Study Diary!", "success");
    };

    const handleDeleteDiaryEntry = (id: string) => {
        const updated = diaryEntries.filter((d) => d.id !== id);

        setDiaryEntries(updated);
        localStorage.setItem("sp_diary", JSON.stringify(updated));

        showToast("Diary entry deleted successfully.", "info");
    };

    // Toggle a selectable subject on/off
    const toggleSubjectSelection = (subjectId: string) => {
        const updated = selectedSubjectIds.includes(subjectId)
            ? selectedSubjectIds.filter((id) => id !== subjectId)
            : [...selectedSubjectIds, subjectId];

        setSelectedSubjectIds(updated);

        localStorage.setItem(
            "sp_selected_subjects",
            JSON.stringify(updated)
        );
    };

    const toggleSubjectGroupSelection = (subjectIds: string[]) => {
        const anySelected = subjectIds.some((id) =>
            selectedSubjectIds.includes(id)
        );

        const updated = anySelected
            ? selectedSubjectIds.filter((id) => !subjectIds.includes(id))
            : [
                ...selectedSubjectIds,
                ...subjectIds.filter((id) => !selectedSubjectIds.includes(id))
            ];

        setSelectedSubjectIds(updated);

        localStorage.setItem(
            "sp_selected_subjects",
            JSON.stringify(updated)
        );
    };

    const resetStudentData = () => {
        localStorage.clear();
        setProfile(null);
        setStudentProgress({});
        setHomeworks([]);
        setDiaryEntries([]);
        setSelectedSubjectIds([]);
    };

    return {
        profile,
        studentProgress,
        homeworks,
        diaryEntries,
        selectedSubjectIds,
        loaded,
        handleSaveProfile,
        handleUpdateChapterProgress,
        handleAddHomework,
        handleToggleHomework,
        handleDeleteHomework,
        handleAddDiaryEntry,
        handleDeleteDiaryEntry,
        toggleSubjectSelection,
        toggleSubjectGroupSelection,
        resetStudentData
    };
}