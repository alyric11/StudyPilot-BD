/**
 * STUDYPILOT BD - Main App Orchestrator and Global State Manager
 * 
 * Purpose:
 * This is the central heart of the StudyPilot client application. It manages:
 * 1. Global States: Student profile, textbook completion checklists, homework logs, and diary entries.
 * 2. Navigation Flow: Directs the view to the Cockpit Dashboard, Daily Planner, Homework Board, or Personal Diary.
 * 3. Persistence: Automatically reads and writes state data to the browser's 'localStorage' for seamless offline use.
 */

import { useState, useEffect, useRef } from "react";
import { getSubjectCardStyles } from "./colorPalettes";
import { ChapterProgress, RoutineEditRequest } from "./types";
import useStudentData from "./hooks/useStudentData";
import { NCTB_CURRICULUM } from "./data/curriculum";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import DashboardSubjectCard from "./components/DashboardSubjectCard";
import { getStudyProgress } from "./utils/studyProgress";
import {
  getDailyRoutineTasks,
  localDateKey,
} from "./utils/routineTasks.ts";
import useDialogFocus from "./hooks/useDialogFocus";
import VideoLessonsPage from "./components/VideoLessonsPage";

// Component Imports
import ProfileSetup from "./components/ProfileSetup";
import ChapterPage from "./components/ChapterPage";
import StudyPlanner from "./components/StudyPlanner";
import TodaysTasks from "./components/TodaysTasks";
import HomeworkManager from "./components/HomeworkManager";
import StudyDiary from "./components/StudyDiary";
import SubjectPaperPage from "./components/SubjectPaperPage";
import AITutor from "./components/AITutor";

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
  const [routineEditRequest, setRoutineEditRequest] = useState<RoutineEditRequest | null>(null);

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
  const [showSelectableSubjects, setShowSelectableSubjects] = useState(false);
  const selectableSubjectButtonsRef = useRef<HTMLDivElement>(null);
  const [newAdditionalSubjectName, setNewAdditionalSubjectName] = useState("");
  const addSubjectDialogRef = useRef<HTMLDivElement>(null);
  const resetDialogRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [mobileNavigation, setMobileNavigation] = useState(() => window.matchMedia("(max-width: 1023px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => { setMobileNavigation(media.matches); if (!media.matches) setSidebarOpen(false); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useDialogFocus(showAddSubjectModal, addSubjectDialogRef, () => setShowAddSubjectModal(false));
  useDialogFocus(showLogoutConfirm, resetDialogRef, () => setShowLogoutConfirm(false));
  useDialogFocus(sidebarOpen && mobileNavigation, sidebarRef, () => setSidebarOpen(false));

  // Helper to show modern animated toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  const {
    profile,
    studentProgress,
    homeworks,
    routineBlocks,
    dailyRoutineTasks,
    handleSetDailyRoutineCompletion,
    handleSnapshotDailyRoutineTasks,
    handleSaveDatedRoutineTask,
    diaryEntries,
    selectedSubjectIds,
    loaded,
    handleSaveProfile,
    handleAddRoutineBlock,
    handleDeleteRoutineBlock,
    handleRestoreRoutineBlock,
    handleUpdateRoutineBlock,
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
    handleDeleteAdditionalSubject,
    resetStudentData
  } = useStudentData(showToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);


  const navigateToSection = (section: typeof activeSection) => {
    setShowVideoLessons(false);
    setSelectedChapter(null);
    setSelectedSubjectPaper(null);
    setRoutineEditRequest(null);
    setActiveSection(section);
    setSidebarOpen(false);
    document.getElementById("dynamic-flight-window")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    if (!loaded || !profile) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("dynamic-flight-window")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeSection, selectedSubjectPaper, selectedChapter?.chapterId, showVideoLessons, loaded]);

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
  useEffect(() => {
    if (!loaded || !profile) {
      return;
    }

    const today = localDateKey(new Date());

    const todayTasks = getDailyRoutineTasks(
      today,
      routineBlocks,
      dailyRoutineTasks,
      activeSubjects,
      additionalSubjects
    );

    handleSnapshotDailyRoutineTasks(todayTasks);
  }, [
    loaded,
    profile,
    routineBlocks,
    dailyRoutineTasks,
    additionalSubjects,
    selectedSubjectIds,
  ]);

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
    subjectMasteries[s.id] = getStudyProgress(s, studentProgress[s.id]).percentage;
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
    <MotionConfig reducedMotion="user" transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans" id="study-pilot-app-shell">
        {/* Top Header Panel */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 shadow-xs flex items-center justify-between" id="app-top-header">
          <div className="flex items-center gap-3">
            {/* Mobile Navigation Trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-slate-500 transition-colors hover:bg-slate-100 rounded-lg cursor-pointer lg:hidden"
              id="mobile-nav-toggle"
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
              aria-controls="app-navigation-sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo Brand */}
            <button type="button" aria-label="StudyPilot home"
              className="flex items-center gap-2.5 cursor-pointer group text-left rounded-lg"
              onClick={() => navigateToSection("dashboard")}
            >
              <div className="w-8.5 h-8.5 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-display font-bold shadow-md shadow-indigo-150 transition-transform group-hover:scale-105">
                SP
              </div>
              <div>
                <span className="font-display font-bold text-slate-800 tracking-tight block">StudyPilot BD</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block -mt-1">Academic MVP</span>
              </div>
            </button>
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
            ref={sidebarRef}
            inert={mobileNavigation && !sidebarOpen}
            role={mobileNavigation ? "dialog" : undefined}
            aria-modal={mobileNavigation && sidebarOpen ? true : undefined}
            aria-label="Main navigation"
            tabIndex={-1}
            className={`fixed top-[58px] bottom-0 left-0 z-40 bg-[#15213a] border-r border-[#24324a] w-[260px] p-4 shadow-lg lg:shadow-none transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              }`}
            id="app-navigation-sidebar"
          >
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-[#7182a0] font-bold uppercase tracking-wider block px-2 mb-2">Student Cockpit</span>
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
                            navigateToSection(item.id as typeof activeSection);
                          }}
                          aria-current={isActive ? "page" : undefined}
                          className={`w-full py-2.5 px-3 rounded-lg border-l-4 text-left text-sm font-semibold flex items-center gap-3 transition-colors duration-150 cursor-pointer ${isActive
                            ? "bg-[#24324a] text-white font-bold border-l-4 border-[#6d5dfc]"
                            : "border-transparent text-[#b0bdd2] hover:text-white hover:bg-[#1d2a43]"
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
              <div className="pt-4 border-t border-[#24324a]">
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
              className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs lg:hidden"
            />
          )}

          {/* Study Workstation */}
          <main className={`min-w-0 w-full lg:ml-[260px] lg:w-[calc(100%-260px)] p-3 sm:p-4 lg:p-6 overflow-x-hidden ${activeSection === "dashboard" && !selectedChapter && !selectedSubjectPaper ? "bg-slate-50" : activeSection === "planner" ? "bg-[#f5f7fb]" : ""}`} id="dynamic-flight-window" tabIndex={-1}>
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
                subjects={activeSubjects}
                additionalSubjects={additionalSubjects}
                routineBlocks={routineBlocks}
                dailyRoutineTasks={dailyRoutineTasks}
                mastery={subjectMasteries[selectedSubjectPaper] || 0}
                chapterProgress={studentProgress[selectedSubjectPaper] || {}}
                onSetRoutineCompletion={handleSetDailyRoutineCompletion}
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
                    chapterBanglaName: chapter.banglaName,
                  })
                }
              />

            ) : (
              <>
                {/* Cockpit - Dashboard view */}
                {activeSection === 'dashboard' && (
                  <div className="w-full max-w-[1440px] mx-auto px-0 sm:px-1 lg:px-2 space-y-4 text-left" id="cockpit-dashboard-view">

                    {/* Onboarding Summary Header card */}
                    <div className="dashboard-panel flex flex-col md:flex-row md:items-center justify-between gap-4" id="dashboard-header-block">
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
                      <div className="dashboard-stats">
                        <div className="dashboard-stat bg-indigo-50/55">
                          <div className="flex items-center justify-center gap-1.5 text-indigo-500 mb-0.5">
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span className="text-lg font-bold text-slate-800">
                              {homeworks.filter((h) => !h.completed).length}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-slate-600">Pending homework</span>
                        </div>
                        <div className="dashboard-stat bg-emerald-50/55">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-0.5">
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span className="text-lg font-bold text-slate-800">
                              {overallCompletion}%
                            </span>
                          </div>
                          <span className="text-xs font-medium text-slate-600" title="Average study-checklist completion across your subjects">Study progress</span>
                        </div>
                      </div>
                    </div>

                    {/* Primary content grid layout */}
                    <div className="dashboard-columns">
                      <TodaysTasks
                        subjects={activeSubjects}
                        additionalSubjects={additionalSubjects}
                        routineBlocks={routineBlocks}
                        records={dailyRoutineTasks}
                        onSetCompletion={handleSetDailyRoutineCompletion}
                        onOpenChapter={(subjectId, chapterId) => {
                          const subject = activeSubjects.find((item) => item.id === subjectId);
                          const chapter = subject?.chapters.find((item) => item.id === chapterId);
                          if (!subject || !chapter) return;

                          setShowVideoLessons(false);
                          setSelectedSubjectPaper(null);
                          setSelectedChapter({
                            subjectId: subject.id,
                            subjectName: subject.name,
                            chapterId: chapter.id,
                            chapterName: chapter.name,
                            chapterBanglaName: chapter.banglaName,
                          });
                        }}
                        onOpenPlanner={() => navigateToSection("planner")}
                        onEditRoutine={(routineId, occurrenceDate) => {
                          setSelectedChapter(null);
                          setSelectedSubjectPaper(null);
                          setShowVideoLessons(false);
                          setRoutineEditRequest({ routineId, occurrenceDate, requestId: crypto.randomUUID() });
                          setActiveSection("planner");
                        }}
                      />
                      {/* Left & center - Subject Cards */}
                      <div className="dashboard-subjects space-y-4">
                        <div className="dashboard-panel space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-3 pb-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                <BookOpen className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Your subjects</h2>
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
                            {commonSubjects.map((sub) => (
                              <DashboardSubjectCard key={sub.id} subject={sub} progress={studentProgress[sub.id]}
                                onOpen={() => setSelectedSubjectPaper(sub.id)} />
                            ))}
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
                                {[...compulsorySubjects, ...optionalSubjects].map((sub) => (
                                  <DashboardSubjectCard key={sub.id} subject={sub} progress={studentProgress[sub.id]}
                                    onOpen={() => setSelectedSubjectPaper(sub.id)} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Additional Subjects */}
                        {additionalSubjects.length > 0 && (
                          <div className="dashboard-panel space-y-4">
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
                                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${getSubjectCardStyles("amber").card}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="break-words text-sm font-semibold text-slate-800">
                                      {subject.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Personal subject
                                    </div>
                                  </div>

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
                          <div className="dashboard-panel flex flex-col gap-5">
                            {showSelectableSubjects && (
                              <>
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
                                          toggleSubjectGroupSelection(
                                            group.papers.map((paper) => paper.id)
                                          )
                                        }
                                        aria-pressed={isSelected}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-colors ${isSelected
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
                              </>
                            )}

                            <div
                              ref={selectableSubjectButtonsRef}
                              className="pt-1 w-full flex flex-col items-start gap-2 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const buttonsTop =
                                    selectableSubjectButtonsRef.current?.getBoundingClientRect().top;

                                  setShowSelectableSubjects((current) => !current);

                                  if (!showSelectableSubjects && buttonsTop !== undefined) {
                                    requestAnimationFrame(() => {
                                      const newButtonsTop =
                                        selectableSubjectButtonsRef.current?.getBoundingClientRect().top;

                                      if (newButtonsTop !== undefined) {
                                        window.scrollBy({
                                          top: newButtonsTop - buttonsTop,
                                          behavior: "instant",
                                        });
                                      }
                                    });
                                  }
                                }}
                                aria-expanded={showSelectableSubjects}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-[11px] font-bold hover:bg-indigo-50 transition-colors"
                              >
                                <span className="text-base leading-none">+</span>
                                Add Optional Subject
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowAddSubjectModal(true)}
                                disabled={additionalSubjects.length >= 4}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-[11px] font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="text-base leading-none">+</span>
                                Add Personal Subject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right column - Study tips & guidelines */}
                      <div className="dashboard-support space-y-4">

                        {/* Today's Tasks */}


                        {/* Study Strategy Tips */}
                        <div className="dashboard-panel dashboard-tips space-y-4">
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
                        <div className="dashboard-panel dashboard-about space-y-3 text-left">
                          <div className="flex items-center gap-2 font-semibold text-sm text-slate-700">
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
                    dailyRoutineTasks={dailyRoutineTasks}
                    onSaveDatedRoutineTask={handleSaveDatedRoutineTask}
                    onAddRoutineBlock={handleAddRoutineBlock}
                    onDeleteRoutineBlock={handleDeleteRoutineBlock}
                    onRestoreRoutineBlock={handleRestoreRoutineBlock}
                    onUpdateRoutineBlock={handleUpdateRoutineBlock}
                    editRoutineRequest={routineEditRequest}
                    onEditRequestHandled={() => setRoutineEditRequest(null)}
                    onOpenRoutineChapter={(subjectId, chapterId) => {
                      const subject = activeSubjects.find((item) => item.id === subjectId);
                      const chapter = subject?.chapters.find((item) => item.id === chapterId);

                      if (!subject || !chapter) return;

                      setShowVideoLessons(false);
                      setSelectedChapter({
                        subjectId: subject.id,
                        subjectName: subject.name,
                        chapterId: chapter.id,
                        chapterName: chapter.name,
                        chapterBanglaName: chapter.banglaName,
                      });
                    }}
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
        <footer className="lg:ml-[260px] bg-white border-t border-slate-100 py-3 text-center text-[10px] text-slate-400 font-mono">
          StudyPilot BD • NCTB Core MVP • Ready for Action
        </footer>

        {/* Global AI Tutor */}
        <AITutor
          profile={profile}
          context={
            selectedChapter
              ? {
                page: showVideoLessons ? "Video Lessons" : "Chapter Guide",
                subjectName: selectedChapter.subjectName,
                chapterName: selectedChapter.chapterName,
                chapterBanglaName: selectedChapter.chapterBanglaName,
              }
              : selectedSubjectPaper
                ? {
                  page: "Subject Chapters",
                  subjectName: activeSubjects.find(
                    (subject) => subject.id === selectedSubjectPaper
                  )?.name,
                }
                : {
                  page:
                    activeSection === "dashboard"
                      ? "Study Cockpit"
                      : activeSection === "planner"
                        ? "Daily Planner"
                        : activeSection === "homework"
                          ? "Homework Board"
                          : "Personal Notebook",
                }
          }
        />

        {/* Toast Notification Container */}
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
          <AnimatePresence>
            {toast && (
              <motion.div
                role={toast.type === "error" ? "alert" : "status"}
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
                  aria-label="Dismiss notification"
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
                ref={addSubjectDialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-subject-heading"
                tabIndex={-1}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
              >
                <h2 id="add-subject-heading" className="text-base font-bold text-slate-800">Add an additional subject</h2>
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
                ref={resetDialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="reset-heading"
                tabIndex={-1}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full border border-slate-100 p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="p-2.5 bg-rose-50 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 id="reset-heading" className="text-lg font-display font-bold tracking-tight">Reset Data & Logout?</h3>
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
    </MotionConfig>
  );
}
