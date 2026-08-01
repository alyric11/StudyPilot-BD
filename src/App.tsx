/**
 * STUDYPILOT BD - Main App Orchestrator and Global State Manager
 * 
 * Purpose:
 * This is the central heart of the StudyPilot client application. It manages:
 * 1. Global States: Student profile, textbook completion checklists, homework logs, and diary entries.
 * 2. Navigation Flow: Directs the view to the Cockpit Dashboard, Daily Planner, Homework Board, or Personal Diary.
 * 3. Persistence: Automatically reads and writes state data to the browser's 'localStorage' for seamless offline use.
 */

import React, { useState, useEffect } from "react";
import { UserProfile, StudentProgress, Homework, DiaryEntry, ChapterProgress } from "./types";
import { NCTB_CURRICULUM } from "./data/curriculum";
import { AnimatePresence, motion } from "motion/react";

// Component Imports
import ProfileSetup from "./components/ProfileSetup";
import ChapterPage from "./components/ChapterPage";
import StudyPlanner from "./components/StudyPlanner";
import HomeworkManager from "./components/HomeworkManager";
import StudyDiary from "./components/StudyDiary";

// Vector Icons
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  Feather,
  Flame,
  ChevronRight,
  LogOut,
  Sparkles,
  Menu,
  X,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function App() {
  // Authentication & Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Navigation Section (MVP includes only these 4 views)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'planner' | 'homework' | 'diary'>('dashboard');
  
  // Currently studied textbook chapter
  const [selectedChapter, setSelectedChapter] = useState<{
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    chapterBanglaName: string;
  } | null>(null);

  // Core Persistent State Arrays
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({});
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(5); // Default study streak

  // In-app Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Modal Dialog toggle state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Helper to show modern animated toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // App loading lifecycle state
  const [loaded, setLoaded] = useState(false);

  // Load initial data from browser's LocalStorage on mount - isolated safely
  useEffect(() => {
    // 1. Load Profile Safely
    try {
      const savedProfile = localStorage.getItem("sp_profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed === "object" && parsed.name && parsed.email && parsed.classLevel) {
          setProfile(parsed);
        } else {
          console.warn("Invalid profile format in storage, resetting.");
          localStorage.removeItem("sp_profile");
        }
      }
    } catch (err) {
      console.error("Failed to parse student profile from local storage:", err);
      localStorage.removeItem("sp_profile");
    }

    // 2. Load Progress Safely
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
      console.error("Failed to parse student progress from local storage:", err);
      localStorage.removeItem("sp_progress");
    }

    // 3. Load Homework Safely
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
            deadline: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // 2 days from now
            priority: "high",
            completed: false,
            notes: "Focus heavily on the river-boat navigation and vector multiplication sums."
          },
          {
            id: "hw2",
            subject: "Chemistry 1st Paper",
            chapter: "Qualitative Chemistry",
            task: "Revise electronic configuration principles and exceptions (Cr, Cu).",
            deadline: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
            priority: "medium",
            completed: true
          }
        ];
        setHomeworks(demoHw);
        localStorage.setItem("sp_homework", JSON.stringify(demoHw));
      }
    } catch (err) {
      console.error("Failed to parse homework data from local storage:", err);
      localStorage.removeItem("sp_homework");
    }

    // 4. Load Diary Safely
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
            content: "Dot Product (A.B) = AB cos(θ). Cross Product (A x B) = AB sin(θ) η.\nRemember: If two vectors are perpendicular, their dot product is zero! Extremely common trick in board questions.",
            category: "formula",
            subject: "Physics 1st Paper",
            chapter: "Vector",
            createdAt: new Date().toISOString()
          },
          {
            id: "diary2",
            title: "Cr & Cu Electronic Configuration",
            content: "Chromium (Z=24): [Ar] 3d5 4s1 instead of 3d4 4s2.\nCopper (Z=29): [Ar] 3d10 4s1 instead of 3d9 4s2.\nReason: Half-filled (d5) and fully-filled (d10) orbitals possess extra stability due to symmetry and exchange energy.",
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
      console.error("Failed to parse diary entries from local storage:", err);
      localStorage.removeItem("sp_diary");
    }

    setLoaded(true);
  }, []);

  // Save student profile and bootstrap initial curriculum checklist
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("sp_profile", JSON.stringify(newProfile));

    // Seeds default progress checklists for newly unlocked subjects
    const classConfig = NCTB_CURRICULUM[newProfile.classLevel];
    if (classConfig) {
      const activeGroup = newProfile.group && classConfig.subjects[newProfile.group] ? newProfile.group : "None";
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
    showToast(`Profile configured! Welcome to StudyPilot BD, ${newProfile.name}!`, "success");
  };

  // Update textbook chapter progress checklist
  const handleUpdateChapterProgress = (subjectId: string, chapterId: string, progress: ChapterProgress) => {
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

  // Add a new Homework task
  const handleAddHomework = (newHw: Omit<Homework, "id" | "completed">) => {
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

  // Toggle Homework completion
  const handleToggleHomework = (id: string) => {
    const homework = homeworks.find(h => h.id === id);
    const updated = homeworks.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h));
    setHomeworks(updated);
    localStorage.setItem("sp_homework", JSON.stringify(updated));
    
    if (homework) {
      if (!homework.completed) {
        showToast("Assignment marked as completed! Keep it up!", "success");
      } else {
        showToast("Assignment marked as active.", "info");
      }
    }
  };

  // Delete Homework task
  const handleDeleteHomework = (id: string) => {
    const updated = homeworks.filter((h) => h.id !== id);
    setHomeworks(updated);
    localStorage.setItem("sp_homework", JSON.stringify(updated));
    showToast("Assignment deleted from your board.", "info");
  };

  // Add dynamic formula/diary entry
  const handleAddDiaryEntry = (newEntry: Omit<DiaryEntry, "id" | "createdAt">) => {
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

  // Delete diary/formula log
  const handleDeleteDiaryEntry = (id: string) => {
    const updated = diaryEntries.filter((d) => d.id !== id);
    setDiaryEntries(updated);
    localStorage.setItem("sp_diary", JSON.stringify(updated));
    showToast("Diary entry deleted successfully.", "info");
  };

  // Reset local app data and log out - using state overlay modal instead of alert
  const handleLogOut = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogOut = () => {
    localStorage.clear();
    setProfile(null);
    setStudentProgress({});
    setHomeworks([]);
    setDiaryEntries([]);
    setActiveSection('dashboard');
    setSelectedChapter(null);
    setShowLogoutConfirm(false);
    showToast("Account reset. Successfully logged out!", "info");
  };

  // Compute subject mastery percentage based on completed checklist boxes
  const getSubjectMasteryPercentage = (subjectId: string): number => {
    const subjectProgMap = studentProgress[subjectId];
    if (!subjectProgMap) return 0;

    const chapters = Object.keys(subjectProgMap);
    if (chapters.length === 0) return 0;

    let totalPoints = 0;
    let earnedPoints = 0;

    chapters.forEach((chId) => {
      const chProgress = subjectProgMap[chId];
      if (chProgress) {
        const checklistItems = Object.values(chProgress);
        totalPoints += checklistItems.length;
        earnedPoints += checklistItems.filter(Boolean).length;
      }
    });

    return totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
  };

  // Fetch current subjects filtered by selected class and group
  const getActiveSubjects = () => {
    if (!profile) return [];
    const classConfig = NCTB_CURRICULUM[profile.classLevel];
    if (!classConfig) return [];
    const activeGroup = profile.group && classConfig.subjects[profile.group] ? profile.group : "None";
    return classConfig.subjects[activeGroup] || [];
  };

  const activeSubjects = getActiveSubjects();

  // Pre-calculate mastery percentages for active subjects
  const subjectMasteries: Record<string, number> = {};
  activeSubjects.forEach((s) => {
    subjectMasteries[s.id] = getSubjectMasteryPercentage(s.id);
  });

  // Calculate overall program completion (mean of all subject masteries)
  const getOverallCompletionRate = (): number => {
    if (activeSubjects.length === 0) return 0;
    const sum = activeSubjects.reduce((acc, curr) => acc + (subjectMasteries[curr.id] || 0), 0);
    return Math.round(sum / activeSubjects.length);
  };

  const overallCompletion = getOverallCompletionRate();

  // App loading visual screen
  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h4 className="text-slate-600 font-semibold font-display">Initializing Academic Cockpit...</h4>
      </div>
    );
  }

  // Profile setup flow if not onboarding complete
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 md:p-8 font-sans">
        <ProfileSetup initialProfile={null} onSave={handleSaveProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans" id="study-pilot-app-shell">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 shadow-xs flex items-center justify-between" id="app-top-header">
        <div className="flex items-center gap-3">
          {/* Mobile Navigation Trigger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer transition-colors"
            id="mobile-nav-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => { setActiveSection('dashboard'); setSelectedChapter(null); }}
          >
            <div className="w-8.5 h-8.5 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-display font-bold shadow-md shadow-indigo-150 transition-transform group-hover:scale-105">
              SP
            </div>
            <div>
              <span className="font-display font-bold text-slate-800 tracking-tight block">StudyPilot BD</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block -mt-1">Academic MVP</span>
            </div>
          </div>
        </div>

        {/* Right Header Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200/50" title="Active Streak">
            <Flame className="w-4 h-4 fill-amber-500 stroke-amber-600 animate-pulse" />
            <span className="text-xs font-bold">{streakCount} Day Streak</span>
          </div>

          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`}
              alt="Avatar"
              className="w-8.5 h-8.5 rounded-full border border-slate-200 bg-white shadow-sm hidden sm:block"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-700 block truncate max-w-[120px]">{profile.name}</span>
              <span className="text-[9px] text-slate-400 font-bold block">{profile.classLevel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Structural Body */}
      <div className="flex-1 flex" id="app-main-pane">
        {/* Navigation Sidebar Drawer */}
        <aside
          className={`fixed md:sticky top-[58px] bottom-0 z-40 bg-slate-900 border-r border-slate-800 w-[240px] p-4 shrink-0 shadow-lg md:shadow-none transition-transform duration-300 transform md:transform-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
          id="app-navigation-sidebar"
        >
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2 mb-2">Student Cockpit</span>
                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Study Cockpit', icon: LayoutDashboard },
                    { id: 'planner', label: 'Daily Planner', icon: Clock },
                    { id: 'homework', label: 'Homework Board', icon: ClipboardList },
                    { id: 'diary', label: 'Personal Notebook', icon: Feather }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id && !selectedChapter;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id as any);
                          setSelectedChapter(null);
                          setSidebarOpen(false);
                        }}
                        className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                          isActive
                            ? "bg-slate-800 text-white font-bold border-l-4 border-indigo-500"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        }`}
                        id={`sidebar-link-${item.id}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Logout panel */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleLogOut}
                className="w-full py-2 px-3 rounded-lg text-left text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-3 transition-all cursor-pointer"
                id="sidebar-link-logout"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Reset & Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar overlay backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs md:hidden"
          />
        )}

        {/* Study Workstation */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden" id="dynamic-flight-window">
          {selectedChapter ? (
            /* Active chapter page study hub */
            <ChapterPage
              subjectId={selectedChapter.subjectId}
              subjectName={selectedChapter.subjectName}
              chapterId={selectedChapter.chapterId}
              chapterName={selectedChapter.chapterName}
              chapterBanglaName={selectedChapter.chapterBanglaName}
              profile={profile}
              chapterProgress={
                (studentProgress[selectedChapter.subjectId] &&
                  studentProgress[selectedChapter.subjectId][selectedChapter.chapterId]) || {
                  readTextbook: false,
                  watchedLectures: false,
                  solvedExercises: false,
                  solvedBoardQuestions: false,
                  madeNotes: false,
                  revisionCompleted: false
                }
              }
              onUpdateProgress={(prog) =>
                handleUpdateChapterProgress(selectedChapter.subjectId, selectedChapter.chapterId, prog)
              }
              onBack={() => setSelectedChapter(null)}
            />
          ) : (
            <>
              {/* Cockpit - Dashboard view */}
              {activeSection === 'dashboard' && (
                <div className="space-y-6 text-left" id="cockpit-dashboard-view">
                  
                  {/* Onboarding Summary Header card */}
                  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6" id="dashboard-header-block">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100/70 shadow-xs flex items-center justify-center font-display font-bold text-xl text-indigo-600 shrink-0">
                        {profile.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider block font-display">Student Cockpit</span>
                        <h1 className="text-xl md:text-2xl font-display font-bold text-slate-800 tracking-tight break-words">{profile.name}</h1>
                        <p className="text-xs text-slate-500 font-medium break-words leading-relaxed">
                          {profile.school} <span className="text-indigo-400 font-bold hidden sm:inline">•</span><span className="sm:hidden block my-0.5"></span> {profile.classLevel} ({profile.group || "None"}) <span className="text-indigo-400 font-bold hidden sm:inline">•</span><span className="sm:hidden block my-0.5"></span> {profile.board} Board
                        </p>
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div className="flex gap-4 shrink-0">
                      <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-150 text-center w-26">
                        <span className="text-lg font-bold text-slate-800 block">
                          {homeworks.filter((h) => !h.completed).length}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">Todo Tasks</span>
                      </div>
                      <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-150 text-center w-26">
                        <span className="text-lg font-bold text-slate-800 block">
                          {overallCompletion}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">Syllabus Done</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary content grid layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left & center - Subject Cards */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">NCTB Subjects Navigator</h2>
                            <p className="text-slate-400 text-xs mt-0.5">Click any subject chapter to access AI study guides and tutor chat.</p>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50/60 px-3 py-1 rounded-lg border border-indigo-100/50">
                            {activeSubjects.length} Subjects
                          </span>
                        </div>

                        {/* Subject list grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeSubjects.map((sub) => {
                            const mastery = subjectMasteries[sub.id] || 0;
                            return (
                              <div
                                key={sub.id}
                                className="p-4 bg-white rounded-xl border border-slate-200/70 hover:border-indigo-300 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 font-display">{sub.banglaName}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{sub.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-bold text-indigo-600">{mastery}%</span>
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-indigo-600 h-full transition-all duration-500"
                                        style={{ width: `${mastery}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Chapters within card */}
                                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Syllabus Chapters:</span>
                                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                    {sub.chapters.map((ch) => (
                                      <button
                                        key={ch.id}
                                        onClick={() =>
                                          setSelectedChapter({
                                            subjectId: sub.id,
                                            subjectName: sub.name,
                                            chapterId: ch.id,
                                            chapterName: ch.name,
                                            chapterBanglaName: ch.banglaName
                                          })
                                        }
                                        className="w-full p-2 bg-slate-50/50 hover:bg-indigo-50/40 text-[11px] font-semibold text-slate-600 hover:text-indigo-700 text-left rounded-lg border border-slate-150 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                                      >
                                        <span className="truncate">{ch.banglaName}</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right column - Study tips & guidelines */}
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 font-display font-bold text-sm">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          Study Strategy Tips
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/40 px-1.5 py-0.2 rounded uppercase">
                              NCTB Preparation
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 font-display">Active Textbook Mapping</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Always study the textbook first. 80% of board Creative Questions are designed directly from textbook experiments and derivations.
                            </p>
                          </div>

                          <div className="p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/40 px-1.5 py-0.2 rounded uppercase">
                              Efficiency
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 font-display">Formula Revision Logs</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Keep logging equations and definitions in your Personal Notebook tab. Quick reviews help keep concepts fresh for solving board math sums!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info box about current build */}
                      <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-md space-y-3 text-left">
                        <div className="flex items-center gap-2 font-display font-bold text-xs text-indigo-400">
                          <BookOpen className="w-4 h-4" />
                          NCTB Core Companion MVP
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          This platform is tailored to help students prepare for SSC and HSC exams cleanly. You can check off chapters, generate AI plans, log tasks, and run formula diaries safely offline!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Study Planner panel */}
              {activeSection === 'planner' && (
                <StudyPlanner profile={profile} subjects={activeSubjects} />
              )}

              {/* Homework Manager panel */}
              {activeSection === 'homework' && (
                <HomeworkManager
                  profile={profile}
                  subjects={activeSubjects}
                  homeworks={homeworks}
                  onAddHomework={handleAddHomework}
                  onToggleHomework={handleToggleHomework}
                  onDeleteHomework={handleDeleteHomework}
                />
              )}

              {/* Personal Diary/Notebook panel */}
              {activeSection === 'diary' && (
                <StudyDiary
                  profile={profile}
                  subjects={activeSubjects}
                  entries={diaryEntries}
                  onAddEntry={handleAddDiaryEntry}
                  onDeleteEntry={handleDeleteDiaryEntry}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer bar */}
      <footer className="bg-white border-t border-slate-100 py-3 text-center text-[10px] text-slate-400 font-mono">
        StudyPilot BD • NCTB Core MVP • Ready for Action
      </footer>

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`p-4 rounded-xl shadow-lg border pointer-events-auto flex items-start gap-3 ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : toast.type === "error"
                  ? "bg-rose-50 border-rose-100 text-rose-800"
                  : toast.type === "warning"
                  ? "bg-amber-50 border-amber-100 text-amber-800"
                  : "bg-blue-50 border-blue-100 text-blue-800"
              }`}
            >
              {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
              {toast.type === "info" && <BookOpen className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
              
              <div className="flex-1">
                <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout & Reset Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-100 p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-bold tracking-tight">Reset Data & Logout?</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Are you sure you want to reset your local StudyPilot data and log out? 
                This will clear all your <strong>subject progress checklists</strong>, 
                <strong>homework logs</strong>, and <strong>study diary entries</strong> from this browser. 
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Keep My Data
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogOut}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition-colors cursor-pointer"
                >
                  Yes, Reset & Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
