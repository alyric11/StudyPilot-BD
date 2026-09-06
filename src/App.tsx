/**
 * STUDYPILOT BD - Main App Orchestrator and Global State Manager
 * 
 * Purpose:
 * This is the central heart of the StudyPilot client application. It manages:
 * 1. Global States: Student profile, textbook completion checklists, homework logs, and diary entries.
 * 2. Navigation Flow: Directs the view to the Cockpit Dashboard, Daily Planner, Homework Board, or Personal Diary.
 * 3. Persistence: Automatically reads and writes state data to the browser's 'localStorage' for seamless offline use.
 */

import { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";

export default function App() {
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

  // Modal Dialog toggle state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Helper to show modern animated toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  const {
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
  } = useStudentData(showToast);

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
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block -mt-1">Academic MVP</span>
            </div>
          </div>
        </div>

        {/* Right Header Status info */}
        <div className="flex items-center gap-4">
          

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
          className={`fixed md:sticky top-[58px] bottom-0 z-40 bg-slate-900 border-r border-slate-800 w-[260px] p-4 shrink-0 shadow-lg md:shadow-none transition-transform duration-300 transform md:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                <div className="space-y-6 text-left" id="cockpit-dashboard-view">

                  {/* Onboarding Summary Header card */}
                  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6" id="dashboard-header-block">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100/70 shadow-xs flex items-center justify-center font-display font-bold text-xl text-indigo-600 shrink-0">
                        {profile.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
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
                        <hr></hr>
                        {/* Common Subjects */}
                        <div>
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                            Common Subjects
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Subjects common to all students.
                          </p>
                        </div>

                        {/* Subject list grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeSubjects.filter((sub) => sub.category === "common").map((sub) => {
                            const mastery = subjectMasteries[sub.id] || 0;
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
                                className="p-4 bg-white rounded-xl border border-slate-200/70 hover:border-indigo-300 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between cursor-pointer"
                                    onClick={() => setSelectedSubjectPaper(sub.id)}
                                  >
                                    <span className="text-xs font-bold text-slate-800 font-display">{sub.banglaName}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">{sub.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-indigo-600">{mastery}%</span>
                                      <span className="text-[10px] font-semibold text-slate-400">
                                        {sectionCount > 0
                                          ? `${completedChapters} / ${sectionCount} Units`
                                          : `${completedChapters} / ${totalChapters} chapters`}
                                      </span>
                                    </div>
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
                                    {sub.chapters.slice(0, 3).map((ch) => (
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
                        <hr style={{ marginTop: "35px", marginBottom: "35px" }}></hr>
                        {/* Group Subjects */}
                        {(compulsorySubjects.length > 0 || optionalSubjects.length > 0) && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                                Group Subjects
                              </h3>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Mandatory and selected subjects for your group.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[...compulsorySubjects, ...optionalSubjects].map((sub) => {
                                const mastery = subjectMasteries[sub.id] || 0;
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
                                    className="p-4 bg-white rounded-xl border border-slate-200/70 hover:border-indigo-300 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                  >
                                    <div className="space-y-2">
                                      <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setSelectedSubjectPaper(sub.id)}
                                      >
                                        <span className="text-xs font-bold text-slate-800 font-display">
                                          {sub.banglaName}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                                          {sub.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5 text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-indigo-600">{mastery}%</span>
                                          <span className="text-[10px] font-semibold text-slate-400">
                                            {sectionCount > 0
                                              ? `${completedChapters} / ${sectionCount} Units`
                                              : `${completedChapters} / ${totalChapters} chapters`}
                                          </span>
                                        </div>

                                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className="bg-indigo-600 h-full transition-all duration-500"
                                            style={{ width: `${mastery}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                                        Syllabus Chapters:
                                      </span>

                                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                        {sub.chapters.slice(0, 3).map((ch) => (
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
                        )}
                      </div>


                      {/* Selectable Subjects */}
                      {getSelectableSubjectGroups().length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-5">
                          <div>
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                              Selectable Subjects
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1">
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

                                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-all ${isSelected
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                                    }`}
                                >
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate">
                                      {group.banglaName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
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
                        </div>
                      )}
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
    </div >
  );
}
