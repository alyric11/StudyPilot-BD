/**
 * STUDYPILOT BD - Main App Orchestrator and Global State Manager
 * 
 * Purpose:
 * This is the central heart of the StudyPilot client application. It manages:
 * 1. Global States: Student profile, textbook completion checklists, homework logs, and diary entries.
 * 2. Navigation Flow: Directs the view to the Cockpit Dashboard, Daily Planner, Homework Board, or Personal Diary.
 * 3. Persistence: Automatically reads and writes state data to the browser's 'localStorage' for seamless offline use.
 */

import { useState, useEffect, useMemo } from "react";

const getSubjectCardStyles = (color: string) => {
  if (color.includes("emerald")) {
    return {
      card: "bg-emerald-50/45 border-emerald-100/70 hover:border-emerald-200",
      progress: "bg-emerald-500",
      chapter: "bg-emerald-50/40 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-emerald-100/60",
      mastery: "text-emerald-600",
      icon: "bg-emerald-100 text-emerald-600"
    };
  }

  if (color.includes("blue")) {
    return {
      card: "bg-blue-50/45 border-blue-100/70 hover:border-blue-200",
      progress: "bg-blue-500",
      chapter: "bg-blue-50/40 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-blue-100/60",
      mastery: "text-blue-600",
      icon: "bg-blue-100 text-blue-600"
    };
  }

  if (color.includes("purple") || color.includes("violet")) {
    return {
      card: "bg-purple-50/45 border-purple-100/70 hover:border-purple-200",
      progress: "bg-purple-500",
      chapter: "bg-purple-50/40 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-purple-100/60",
      mastery: "text-purple-600",
      icon: "bg-purple-100 text-purple-600"
    };
  }

  if (color.includes("cyan")) {
    return {
      card: "bg-cyan-50/45 border-cyan-100/70 hover:border-cyan-200",
      progress: "bg-cyan-500",
      chapter: "bg-cyan-50/40 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 border-cyan-100/60",
      mastery: "text-cyan-600",
      icon: "bg-cyan-100 text-cyan-600"
    };
  }

  if (color.includes("amber") || color.includes("orange")) {
    return {
      card: "bg-amber-50/45 border-amber-100/70 hover:border-amber-200",
      progress: "bg-amber-500",
      chapter: "bg-amber-50/40 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-amber-100/60",
      mastery: "text-amber-600",
      icon: "bg-amber-100 text-amber-600"
    };
  }

  if (color.includes("teal")) {
    return {
      card: "bg-teal-50/45 border-teal-100/70 hover:border-teal-200",
      progress: "bg-teal-500",
      chapter: "bg-teal-50/40 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border-teal-100/60",
      mastery: "text-teal-600",
      icon: "bg-teal-100 text-teal-600"
    };
  }

  if (color.includes("fuchsia") || color.includes("pink")) {
    return {
      card: "bg-pink-50/45 border-pink-100/70 hover:border-pink-200",
      progress: "bg-pink-500",
      chapter: "bg-pink-50/40 hover:bg-pink-50 text-slate-600 hover:text-pink-700 border-pink-100/60",
      mastery: "text-pink-600",
      icon: "bg-pink-100 text-pink-600"
    };
  }

  if (color.includes("rose")) {
    return {
      card: "bg-rose-50/45 border-rose-100/70 hover:border-rose-200",
      progress: "bg-rose-500",
      chapter: "bg-rose-50/40 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-rose-100/60",
      mastery: "text-rose-600",
      icon: "bg-rose-100 text-rose-600"
    };
  }

  return {
    card: "bg-slate-50/60 border-slate-200/70 hover:border-slate-300",
    progress: "bg-slate-500",
    chapter: "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 border-slate-150",
    mastery: "text-slate-600",
    icon: "bg-slate-100 text-slate-600"
  };
};
import { ChapterProgress } from "./types";
import useStudentData from "./hooks/useStudentData";
import { NCTB_CURRICULUM } from "./data/curriculum";
import { AnimatePresence, motion } from "motion/react";
import VideoLessonsPage from "./components/VideoLessonsPage";

// Component Imports
import ProfileSetup from "./components/ProfileSetup";
import ChapterPage from "./components/ChapterPage";
import StudyPlanner from "./components/StudyPlanner";
import HomeworkManager from "./components/HomeworkManager";
import StudyDiary from "./components/StudyDiary";
import SubjectPaperPage from "./components/SubjectPaperPage";

// Vector Icons
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  Feather,
  ChevronRight,
  LogOut,
  Sparkles,
  Menu,
  X,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CalendarDays,
  Lightbulb,
  BarChart3
} from "lucide-react";

const getTimeGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { text: "Good Morning", Icon: Sunrise };
  }

  if (hour >= 12 && hour < 17) {
    return { text: "Good Afternoon", Icon: Sun };
  }

  if (hour >= 17 && hour < 20) {
    return { text: "Good Evening", Icon: Sunset };
  }

  return { text: "Good Night", Icon: Moon };
};

export default function App() {
  const { text: timeGreeting, Icon: TimeGreetingIcon } = getTimeGreeting();

  // Authentication & Profile state

  // Navigation Section (MVP includes only these 4 views)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'planner' | 'homework' | 'diary'>('dashboard');

  // Currently studied textbook chapter
  const [selectedSubjectPaper, setSelectedSubjectPaper] = useState<string | null>(null);
  const [showVideoLessons, setShowVideoLessons] = useState(false);

  const [selectedChapter, setSelectedChapter] = useState<{
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    chapterBanglaName: string;
  } | null>(null);

  // Core Persistent State Arrays
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // In-app Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleCreateAdditionalSubject = () => {
    const added = handleAddAdditionalSubject(newAdditionalSubjectName);

    if (added) {
      setNewAdditionalSubjectName("");
      setShowAddSubjectModal(false);
    }
  };

  // Modal Dialog toggle state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newAdditionalSubjectName, setNewAdditionalSubjectName] = useState("");

  // Helper to show modern animated toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  const {
    profile,
    studentProgress,
    homeworks,
    routineBlocks,
    diaryEntries,
    selectedSubjectIds,
    loaded,
    handleSaveProfile,
    handleAddRoutineBlock,
    handleDeleteRoutineBlock,
    handleUpdateChapterProgress,
    handleAddHomework,
    handleToggleHomework,
    handleDeleteHomework,
    handleAddDiaryEntry,
    handleDeleteDiaryEntry,
    toggleSubjectSelection,
    toggleSubjectGroupSelection,
    additionalSubjects,
    handleAddAdditionalSubject,
    toggleAdditionalSubject,
    handleDeleteAdditionalSubject,
    resetStudentData
  } = useStudentData(showToast);

  const todayRoutineBlocks = useMemo(() => {
    const today = new Date().getDay();

    return [...routineBlocks]
      .filter((block) => block.dayOfWeek === today)
      .sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
  }, [routineBlocks]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);


  // Reset local app data and log out - using state overlay modal instead of alert
  const handleLogOut = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogOut = () => {
    resetStudentData();
    setActiveSection("dashboard");
    setSelectedChapter(null);
    setSelectedSubjectPaper(null);
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

  // Fetch active subjects for the student:
  // Common subjects for every student
  const getCommonSubjects = () => {
    if (!profile) return [];

    const classConfig = NCTB_CURRICULUM[profile.classLevel];
    if (!classConfig) return [];

    const activeGroup =
      profile.group && classConfig.subjects[profile.group]
        ? profile.group
        : "None";

    const allSubjects = classConfig.subjects[activeGroup] || [];

    return allSubjects.filter(
      (subject) => subject.category === "common"
    );
  };

  // Mandatory subjects for the student's group
  const getMandatorySubjects = () => {
    if (!profile) return [];

    const classConfig = NCTB_CURRICULUM[profile.classLevel];
    if (!classConfig) return [];

    const activeGroup =
      profile.group && classConfig.subjects[profile.group]
        ? profile.group
        : "None";

    const allSubjects = classConfig.subjects[activeGroup] || [];

    return allSubjects.filter(
      (subject) => subject.category === "mandatory"
    );
  };

  // Subjects active for the student:
  // Common + group mandatory + selected selectable
  const getActiveSubjects = () => {
    if (!profile) return [];

    const classConfig = NCTB_CURRICULUM[profile.classLevel];
    if (!classConfig) return [];

    const activeGroup =
      profile.group && classConfig.subjects[profile.group]
        ? profile.group
        : "None";

    const allSubjects = classConfig.subjects[activeGroup] || [];

    const commonSubjects = allSubjects.filter(
      (subject) => subject.category === "common"
    );

    const mandatorySubjects = allSubjects.filter(
      (subject) => subject.category === "mandatory"
    );

    const selectableSubjects = allSubjects.filter(
      (subject) =>
        subject.category === "selectable" &&
        selectedSubjectIds.includes(subject.id)
    );

    return [
      ...commonSubjects,
      ...mandatorySubjects,
      ...selectableSubjects
    ];
  };

  const activeSubjects = getActiveSubjects();

  // Subjects available for the student to choose
  const getAvailableSelectableSubjects = () => {
    if (!profile) return [];

    const classConfig = NCTB_CURRICULUM[profile.classLevel];
    if (!classConfig) return [];

    const activeGroup =
      profile.group && classConfig.subjects[profile.group]
        ? profile.group
        : "None";

    const allSubjects = classConfig.subjects[activeGroup] || [];

    return allSubjects.filter(
      (subject) => subject.category === "selectable"
    );
  };

  const getSelectableSubjectGroups = () => {
    const subjects = getAvailableSelectableSubjects();

    const groups = new Map<string, typeof subjects>();

    subjects.forEach((subject) => {
      const baseId = subject.id.replace(/1$/, "").replace(/2$/, "");

      if (!groups.has(baseId)) {
        groups.set(baseId, []);
      }

      groups.get(baseId)!.push(subject);
    });

    return Array.from(groups.entries()).map(([id, papers]) => ({
      id,
      name: papers[0].name.replace(/1st Paper|2nd Paper/g, "").trim(),
      banglaName: papers[0].banglaName.replace(/১ম পত্র|২য় পত্র/g, "").trim(),
      papers
    }));
  };

  const commonSubjects = activeSubjects.filter(
    (subject) => subject.category === "common"
  );

  const compulsorySubjects = activeSubjects.filter(
    (subject) => subject.category === "mandatory"
  );

  const optionalSubjects = activeSubjects.filter(
    (subject) =>
      subject.category === "selectable" &&
      selectedSubjectIds.includes(subject.id)
  );

  const selectableSubjects = getAvailableSelectableSubjects();

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
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block -mt-1">Academic MVP</span>
            </div>
          </div>
        </div>

        {/* Right Header Status info */}
        <div className="flex items-center gap-4">


          <div className="flex items-center gap-2.5 border-l border-slate-200/70 pl-4">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`}
              alt="Avatar"
              className="w-8.5 h-8.5 rounded-full border border-slate-200/70 bg-white shadow-sm hidden sm:block"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-700 block truncate max-w-[120px]">{profile.name}</span>
              <span className="text-[9px] text-slate-500 font-bold block">{profile.classLevel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Structural Body */}
      <div className="w-full min-w-0" id="app-main-pane">
        {/* Navigation Sidebar Drawer */}
        <aside
          className={`fixed top-[58px] bottom-0 left-0 z-40 bg-slate-900 border-r border-slate-800 w-[260px] p-4 shadow-lg md:shadow-none transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                        className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${isActive
                          ? "bg-slate-800 text-white font-bold border-l-4 border-indigo-500"
                          : "text-slate-500 hover:text-white hover:bg-slate-800/50"
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
        <main className={`min-w-0 w-full md:ml-[260px] md:w-[calc(100%-260px)] p-3 sm:p-4 md:p-6 overflow-x-hidden ${activeSection === "dashboard" && !selectedChapter && !selectedSubjectPaper ? "bg-slate-50" : ""}`} id="dynamic-flight-window">
          {showVideoLessons ? (
            <VideoLessonsPage
              chapter={selectedChapter!}
              classLevel={profile.classLevel}
              onBack={() => setShowVideoLessons(false)}
            />
          ) : selectedChapter ? (
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
              onWatchVideoLessons={() => setShowVideoLessons(true)}
            />
          ) : selectedSubjectPaper ? (
            <SubjectPaperPage
              subject={
                activeSubjects.find(
                  (sub) => sub.id === selectedSubjectPaper
                )!
              }
              mastery={subjectMasteries[selectedSubjectPaper] || 0}
              onBack={() => setSelectedSubjectPaper(null)}
              onSelectChapter={(chapter) =>
                setSelectedChapter({
                  subjectId: selectedSubjectPaper,
                  subjectName:
                    activeSubjects.find(
                      (sub) => sub.id === selectedSubjectPaper
                    )!.name,
                  chapterId: chapter.id,
                  chapterName: chapter.name,
                  chapterBanglaName: chapter.banglaName
                })
              }
            />
          ) : (
            <>
              {/* Cockpit - Dashboard view */}
              {activeSection === 'dashboard' && (
                <div className="w-full max-w-[1440px] mx-auto px-0 sm:px-1 lg:px-2 space-y-2 text-left" id="cockpit-dashboard-view">

                  {/* Onboarding Summary Header card */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="dashboard-header-block">
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={profile.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name)}`}
                        alt={`${profile.name}'s avatar`}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-slate-200/70 bg-white shadow-xs object-cover shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-slate-500">{timeGreeting}</span>
                          <TimeGreetingIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" aria-hidden="true" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-display font-bold text-slate-800 tracking-tight break-words">{profile.name}</h1>
                        <p className="text-xs text-slate-500 font-medium break-words leading-relaxed">
                          {profile.school} <span className="text-indigo-400 font-bold hidden sm:inline">•</span><span className="sm:hidden block my-0.5"></span> {profile.classLevel} ({profile.group || "None"}) <span className="text-indigo-400 font-bold hidden sm:inline">•</span><span className="sm:hidden block my-0.5"></span> {profile.board} Board
                        </p>
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div className="flex gap-3 sm:gap-4 shrink-0">
                      <div className="bg-indigo-50/55 p-3.5 rounded-xl border border-indigo-100/60 text-center w-26">
                        <div className="flex items-center justify-center gap-1.5 text-indigo-500 mb-0.5">
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span className="text-lg font-bold text-slate-800">
                            {homeworks.filter((h) => !h.completed).length}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">Todo Tasks</span>
                      </div>
                      <div className="bg-emerald-50/55 p-3.5 rounded-xl border border-emerald-100/60 text-center w-26">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-0.5">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span className="text-lg font-bold text-slate-800">
                            {overallCompletion}%
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-sans">Syllabus Done</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary content grid layout */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-2.5">
                    {/* Left & center - Subject Cards */}
                    <div className="xl:col-span-2 space-y-2">
                      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                              <BookOpen className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">NCTB Subjects Navigator</h2>
                              <p className="text-slate-500 text-xs mt-0.5">Select a subject to explore its chapters, study guides and tutor chat.</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50/60 px-3 py-1 rounded-lg border border-indigo-100/50">
                            {activeSubjects.length} Subjects
                          </span>
                        </div>
                        
                        {/* Common Subjects */}
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                            Common Subjects
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Subjects common to all students.
                          </p>
                        </div>

                        {/* Subject list grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeSubjects.filter((sub) => sub.category === "common").map((sub) => {
                            const mastery = subjectMasteries[sub.id] || 0;
                            const subjectStyles = getSubjectCardStyles(sub.color);
                            const totalChapters = sub.chapters.length;
                            const completedChapters = sub.chapters.filter(
                              (ch) => studentProgress[sub.id]?.[ch.id]?.revisionCompleted
                            ).length;

                            const sectionCount = new Set(
                              sub.chapters
                                .map((ch) => ch.section)
                                .filter((section): section is string => Boolean(section))
                            ).size;
                            return (
                              <div
                                key={sub.id}
                                className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between space-y-3 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${subjectStyles.card}`}
                                onClick={() => setSelectedSubjectPaper(sub.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setSelectedSubjectPaper(sub.id);
                                  }
                                }}
                              >
                                <div className="space-y-2">
                                  <div
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${subjectStyles.icon}`}>
                                        <BookOpen className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-800 font-display truncate">
                                          {sub.banglaName}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono shrink-0">
                                          {sub.name}
                                        </span>
                                      </div>
                                    </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${subjectStyles.mastery}`}>{mastery}%</span>
                                      <span className="text-[10px] font-semibold text-slate-500">
                                        {sectionCount > 0
                                          ? `${completedChapters} / ${sectionCount} Units`
                                          : `${completedChapters} / ${totalChapters} chapters`}
                                      </span>
                                    </div>
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className={`${subjectStyles.progress} h-full transition-all duration-500`}
                                        style={{ width: `${mastery}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                
                              </div>
                            );
                          })}
                        </div>
                        <div className="h-px bg-slate-200/50 my-3" aria-hidden="true" />
                        {/* Group Subjects */}
                        {(compulsorySubjects.length > 0 || optionalSubjects.length > 0) && (
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                                Group Subjects
                              </h3>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Mandatory and selected subjects for your group.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[...compulsorySubjects, ...optionalSubjects].map((sub) => {
                                const mastery = subjectMasteries[sub.id] || 0;
                                const subjectStyles = getSubjectCardStyles(sub.color);
                                const totalChapters = sub.chapters.length;
                                const completedChapters = sub.chapters.filter(
                                  (ch) => studentProgress[sub.id]?.[ch.id]?.revisionCompleted
                                ).length;

                                const sectionCount = new Set(
                                  sub.chapters
                                    .map((ch) => ch.section)
                                    .filter((section): section is string => Boolean(section))
                                ).size;

                                return (
                                  <div
                                    key={sub.id}
                                    className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between space-y-3 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${subjectStyles.card}`}
                                onClick={() => setSelectedSubjectPaper(sub.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setSelectedSubjectPaper(sub.id);
                                  }
                                }}
                                  >
                                    <div className="space-y-2">
                                      <div
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${subjectStyles.icon}`}>
                                        <BookOpen className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-800 font-display truncate">
                                          {sub.banglaName}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono shrink-0">
                                          {sub.name}
                                        </span>
                                      </div>
                                    </div>

                                      <div className="flex items-center gap-1.5 text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className={`font-bold ${subjectStyles.mastery}`}>{mastery}%</span>
                                          <span className="text-[10px] font-semibold text-slate-500">
                                            {sectionCount > 0
                                              ? `${completedChapters} / ${sectionCount} Units`
                                              : `${completedChapters} / ${totalChapters} chapters`}
                                          </span>
                                        </div>

                                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className={`${subjectStyles.progress} h-full transition-all duration-500`}
                                            style={{ width: `${mastery}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Subjects */}
                      {additionalSubjects.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                                Additional Subjects
                              </h3>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Personal subjects added outside the NCTB curriculum.
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0">
                              {additionalSubjects.length} / 4
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {additionalSubjects.map((subject) => (
                              <div
                                key={subject.id}
                                className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                                  subject.active
                                    ? "bg-indigo-50/50 border-indigo-200"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleAdditionalSubject(subject.id)}
                                  className="min-w-0 flex-1 text-left cursor-pointer"
                                  aria-pressed={subject.active}
                                >
                                  <div className={`text-xs font-bold truncate ${
                                    subject.active ? "text-indigo-700" : "text-slate-600"
                                  }`}>
                                    {subject.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {subject.active ? "Active" : "Inactive"} • Personal subject
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdditionalSubject(subject.id)}
                                  className="shrink-0 text-[10px] font-bold text-slate-400 hover:text-rose-500 px-1.5 py-1 cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Selectable Subjects */}
                      {getSelectableSubjectGroups().length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 sm:p-6 shadow-sm space-y-5">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                              Selectable Subjects
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Select the subjects you want to study.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {getSelectableSubjectGroups().map((group) => {
                              const isSelected = group.papers.some((paper) =>
                                selectedSubjectIds.includes(paper.id)
                              );

                              return (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() =>
                                    toggleSubjectGroupSelection(group.papers.map((paper) => paper.id))
                                  }

                                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? "bg-indigo-50/70 border-indigo-200 text-indigo-700 shadow-xs"
                                      : "bg-white border-slate-200/80 text-slate-600 hover:bg-indigo-50/40 hover:border-indigo-100"
                                    }`}
                                >
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate">
                                      {group.banglaName}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {group.name}
                                    </div>
                                  </div>

                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected
                                      ? "bg-indigo-600 border-indigo-600"
                                      : "bg-white border-slate-300"
                                      }`}
                                  >
                                    {isSelected && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setShowAddSubjectModal(true)}
                              disabled={additionalSubjects.length >= 4}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-[11px] font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="text-base leading-none">+</span>
                              Add Subject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column - Study tips & guidelines */}
                    <div className="space-y-2 items-start">

                      {/* Today's Tasks */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                          <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                            <CalendarDays className="w-4 h-4" />
                          </div>
                          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">
                            Today's Tasks
                          </h2>
                          
                        </div>

                        {todayRoutineBlocks.length > 0 ? (
                          <div className="space-y-2">
                            {todayRoutineBlocks.map((block) => (
                              <div
                                key={block.id}
                                className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-b-0"
                              >
                                <div className="text-xs font-bold text-indigo-600 whitespace-nowrap">
                                  {block.startTime}–{block.endTime}
                                </div>

                                <div className="h-4 w-px bg-slate-200" />

                                <div className="text-sm font-semibold text-slate-700 truncate">
                                  {block.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center border border-dashed border-slate-200/70 rounded-xl">
                            <p className="text-xs font-semibold text-slate-500">
                              No routine planned for today.
                            </p>

                            <button
                              type="button"
                              onClick={() => setActiveSection("planner")}
                              className="mt-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                            >
                              Create routine
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Study Strategy Tips */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 font-display font-bold text-sm">
                          <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <span>Study Strategy Tips</span>
                        </div>

                        <div className="space-y-3">
                          <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/40 px-1.5 py-0.2 rounded uppercase">
                              NCTB Preparation
                            </span>

                            <h4 className="text-xs font-bold text-slate-800 font-display">
                              Active Textbook Mapping
                            </h4>

                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Always study the textbook first. 80% of board Creative Questions are designed directly from textbook experiments and derivations.
                            </p>
                          </div>

                          <div className="p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/40 px-1.5 py-0.2 rounded uppercase">
                              Efficiency
                            </span>

                            <h4 className="text-xs font-bold text-slate-800 font-display">
                              Formula Revision Logs
                            </h4>

                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Keep logging equations and definitions in your Personal Notebook tab. Quick reviews help keep concepts fresh for solving board math sums!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info box about current build */}
                      <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-3 text-left">
                        <div className="flex items-center gap-2 font-display font-bold text-xs text-indigo-400">
                          <BookOpen className="w-4 h-4" />
                          NCTB Core Companion MVP
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          This platform is tailored to help students prepare for SSC and HSC exams cleanly. You can check off chapters, generate AI plans, log tasks, and run formula diaries safely offline!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Study Planner panel */}
              {activeSection === 'planner' && (
                <StudyPlanner
                  profile={profile}
                  subjects={activeSubjects}
                  additionalSubjects={additionalSubjects}
                  routineBlocks={routineBlocks}
                  onAddRoutineBlock={handleAddRoutineBlock}
                  onDeleteRoutineBlock={handleDeleteRoutineBlock}
                />
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
      <footer className="md:ml-[260px] bg-white border-t border-slate-100 py-3 text-center text-[10px] text-slate-400 font-mono">
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
              className={`p-4 rounded-xl shadow-lg border pointer-events-auto flex items-start gap-3 ${toast.type === "success"
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
                className="text-slate-500 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Additional Subject Modal */}
      <AnimatePresence>
        {showAddSubjectModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowAddSubjectModal(false);
            }}
          >
            <motion.div
              className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-5"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
            >
              <h2 className="text-base font-bold text-slate-800">Add an Additional Subject</h2>
              <p className="text-[11px] text-slate-500 mt-1 mb-4">
                This is a personal subject and will not be treated as NCTB curriculum.
              </p>

              <label
                className="block text-[11px] font-semibold text-slate-600 mb-1.5"
                htmlFor="additional-subject-name"
              >
                Subject name
              </label>
              <input
                id="additional-subject-name"
                type="text"
                value={newAdditionalSubjectName}
                onChange={(e) => setNewAdditionalSubjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateAdditionalSubject();
                  if (e.key === "Escape") setShowAddSubjectModal(false);
                }}
                placeholder="e.g. Robotics"
                maxLength={60}
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setNewAdditionalSubjectName("");
                    setShowAddSubjectModal(false);
                  }}
                  className="px-3 py-2 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAdditionalSubject}
                  disabled={!newAdditionalSubjectName.trim()}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Add Subject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-500 hover:text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
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
    </div >
  );
}
