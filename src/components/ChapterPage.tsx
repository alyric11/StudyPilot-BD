/**
 * STUDYPILOT BD - Interactive Chapter Learning Hub
 * 
 * Purpose:
 * Renders the study canvas for any selected textbook chapter.
 * Includes the AI-generated chapter guide, progress tracking,
 * video lessons, and recommended study resources.
 */

import React, { useEffect, useRef, useState } from "react";
import useDialogFocus from "../hooks/useDialogFocus";
import { CHAPTER_PREPARATION_KEYS } from "../utils/studyProgress";
import { formatOverviewForEditor, parseOverviewFromEditor, isOverviewHeading } from "../utils/chapterOverview";
import { ChapterOverviewData, ChapterProgress, UserProfile } from "../types";
import { BookOpen, CheckCircle, Sparkles, ArrowLeft, Settings2, X, Circle, ChevronDown } from "lucide-react";
import { NCTB_CURRICULUM } from "../data/curriculum";
import { STUDY_RESOURCES } from '../data/resources';

interface ChapterPageProps {
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  chapterBanglaName: string;
  profile: UserProfile;
  chapterProgress: ChapterProgress;
  onUpdateProgress: (progress: ChapterProgress) => void;
  onBack: () => void;
  onWatchVideoLessons: () => void;
}

export default function ChapterPage({
  subjectId,
  subjectName,
  chapterId,
  chapterName,
  chapterBanglaName,
  profile,
  chapterProgress,
  onUpdateProgress,
  onBack,
  onWatchVideoLessons,
}: ChapterPageProps) {
  const [mobilePlanOpen, setMobilePlanOpen] = useState(false);
  const [guideData, setGuideData] = useState<ChapterOverviewData | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const [showChapterOverview, setShowChapterOverview] = useState(false);
  const [isOverviewManagerOpen, setIsOverviewManagerOpen] = useState(false);
  const [overviewAdminToken, setOverviewAdminToken] = useState("");
  const [loadingPublished, setLoadingPublished] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const managerRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef<AbortController | null>(null);
  const saveRef = useRef<AbortController | null>(null);
  const [managementMessage, setManagementMessage] = useState<string | null>(null);
  const [isSavingOverview, setIsSavingOverview] = useState(false);
  const [overviewEditorText, setOverviewEditorText] = useState("");

  const copyOverview = (overview: ChapterOverviewData): ChapterOverviewData => ({
    introduction: overview.introduction,
    importantTopics: overview.importantTopics.map((topic) => ({ ...topic })),
  });

  const closeOverviewManager = () => {
    if (isSavingOverview) return;
    generationRef.current?.abort();
    setLoadingDraft(false);
    setIsOverviewManagerOpen(false);
  };
  useDialogFocus(isOverviewManagerOpen, managerRef, closeOverviewManager);

  const renderInlineBold = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
      const boldMatch = part.match(/^\*\*(.+)\*\*$/);
      return boldMatch ? <strong key={index}>{boldMatch[1]}</strong> : <React.Fragment key={index}>{part}</React.Fragment>;
    });

  const renderOverviewText = (text: string, bodyClassName: string) => {
    const lines = text.replace(/\r\n?/g, "\n").split("\n").map(line => line.trim()).filter(Boolean);
    return (
      <div className="chapter-overview-prose">
        {lines.map((line, index) => {
          // Older saved overviews use short bilingual topic labels without markup.
          const legacyTopic = line.length <= 120 &&
            /^[^.!?।:]+\([^()]+\)$/.test(line) &&
            index + 1 < lines.length && /[.!?।]$/.test(lines[index + 1]);
          const heading = isOverviewHeading(line) || legacyTopic;
          return heading ? (
            <h4 key={index}>
              {renderInlineBold(line.replace(/^#{1,6}\s+/, "").replace(/^\*\*(.*?)\*\*$/, "$1"))}
            </h4>
          ) : (
            <p key={index} className={bodyClassName}>{renderInlineBold(line)}</p>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    const loadPublishedOverview = async () => {
      setLoadingPublished(true);
      setLoadError(null);
      setIsOverviewManagerOpen(false);
      setLoadingGuide(false);
      setLoadingDraft(false);
      setIsSavingOverview(false);
      setGuideData(null);
      setShowChapterOverview(false);
      setApiWarning(null);
      try {
        const params = new URLSearchParams({ subjectId, chapterId });
        const response = await fetch(`/api/chapter-overviews?${params.toString()}`, { signal: controller.signal });
        if (response.status === 404) return;
        if (!response.ok) throw new Error("Unable to load saved overview.");
        const overview: ChapterOverviewData = await response.json();
        if (!cancelled) {
          setGuideData(overview);
          setShowChapterOverview(true);
        }
      } catch {
        if (!cancelled) setLoadError("The saved overview could not be loaded. Please retry.");
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setLoadingPublished(false);
      }
    };
    void loadPublishedOverview();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
      generationRef.current?.abort();
      saveRef.current?.abort();
      generationRef.current = null;
      saveRef.current = null;
    };
  }, [subjectId, chapterId, loadAttempt]);

  // Retrieve complete chapter object from curriculum reference
  const activeChapterObj = (() => {
    const classConfig = NCTB_CURRICULUM[profile.classLevel];
    if (!classConfig) return null;
    const activeGroup = profile.group && classConfig.subjects[profile.group] ? profile.group : "None";
    const subjects = classConfig.subjects[activeGroup] || [];
    const activeSubject = subjects.find(s => s.id === subjectId || s.name === subjectName);
    return activeSubject?.chapters.find(c => c.id === chapterId || c.name === chapterName) || null;
  })();

  // Generate the AI chapter overview
  const generateChapterGuide = async (forManagement = false) => {
    if (loadingPublished || loadingGuide || loadingDraft || isSavingOverview) return;
    const controller = new AbortController();
    generationRef.current?.abort();
    generationRef.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 60000);
    if (forManagement) { setLoadingDraft(true); setManagementMessage(null); }
    else { setShowChapterOverview(true); setLoadingGuide(true); setApiWarning(null); }

    try {
      const res = await fetch("/api/generate-chapter-guide", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subjectName,
          chapter: chapterName.trim() || chapterBanglaName.trim(),
          chapterBanglaName,
          classLevel: profile.classLevel,
          group: profile.group,
        }),
      });

      if (!res.ok) {
        throw new Error(`Guide request failed: ${res.status}`);
      }

      const data: ChapterOverviewData = await res.json();
      if (controller.signal.aborted) return;
      if (forManagement) {
        setOverviewEditorText(formatOverviewForEditor(data));
      } else setGuideData(data);
    } catch (error) {
      if (controller.signal.aborted && !timedOut) return;
      const message = timedOut ? "Generation took too long. Please retry." : "Chapter guide could not be generated right now. Please retry.";
      if (forManagement) setManagementMessage(message);
      else setApiWarning(message);
    } finally {
      window.clearTimeout(timeout);
      if (generationRef.current === controller) {
        generationRef.current = null;
        setLoadingGuide(false);
        setLoadingDraft(false);
      }
    }
  };

  const openOverviewManager = () => {
    const draft = guideData ? copyOverview(guideData) : { introduction: "", importantTopics: [] };
    setOverviewEditorText(formatOverviewForEditor(draft));
    setManagementMessage(null);
    setIsOverviewManagerOpen(true);
  };


  const saveOverviewForStudents = async () => {
    if (loadingDraft || isSavingOverview) return;
    if (!overviewAdminToken.trim()) {
      setManagementMessage("Enter the overview management token to save.");
      return;
    }
    const overviewToSave = parseOverviewFromEditor(overviewEditorText);
    if (!overviewToSave) {
      setManagementMessage("Add the chapter overview before saving.");
      return;
    }
    setIsSavingOverview(true);
    setManagementMessage(null);
    const controller = new AbortController();
    saveRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/chapter-overviews", {
        method: "PUT",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "x-overview-admin-token": overviewAdminToken },
        body: JSON.stringify({ subjectId, chapterId, overview: overviewToSave }),
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(data.error || "The overview could not be saved.");
      setGuideData(data);
      setOverviewEditorText(formatOverviewForEditor(data));
      setShowChapterOverview(true);
      setApiWarning(null);
      setIsOverviewManagerOpen(false);
    } catch (error) {
      if (saveRef.current === controller) setManagementMessage(controller.signal.aborted
        ? "Saving could not be confirmed. Your text is still here; please retry."
        : error instanceof Error ? error.message : "The overview could not be saved.");
    } finally {
      window.clearTimeout(timeout);
      if (saveRef.current === controller) setIsSavingOverview(false);
    }
  };

  const handleChecklistToggle = (key: keyof ChapterProgress) => {
    const updated = {
      ...chapterProgress,
      [key]: !chapterProgress[key]
    };
    if (key === "readOverview") {
      updated.watchedIntroVideo = updated.readOverview;
    }
    onUpdateProgress(updated);
  };

  const progressKeys = CHAPTER_PREPARATION_KEYS;
  const isPlaceholderOverview = guideData?.introduction.trim().toLowerCase() === "test editing" &&
    guideData.importantTopics.length === 0;

  const totalSteps = progressKeys.length;

  const completedSteps = progressKeys.filter(
    (key) => Boolean(chapterProgress[key])
  ).length;

  const percentProgress = () => {
    return Math.round((completedSteps / totalSteps) * 100);
  };



  const renderRecommendedResources = () => (
    <section className="subject-panel rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            color: "var(--subject-accent)",
            backgroundColor: "color-mix(in srgb, var(--subject-accent) 9%, white)"
          }}
        >
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recommended Resources</h3>
          <p className="text-xs text-slate-500">Useful learning websites</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[...STUDY_RESOURCES]
          .sort(
            (a, b) =>
              ["NCTB", "10 Minute School", "Shikho", "Khan Academy"].indexOf(a.name) -
              ["NCTB", "10 Minute School", "Shikho", "Khan Academy"].indexOf(b.name)
          )
          .slice(0, 4)
          .map((resource) => (
            <a
              key={resource.name}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[92px] items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/55 p-3.5 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                {resource.logoUrl ? (
                  <img
                    src={resource.logoUrl}
                    alt={`${resource.name} logo`}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <BookOpen className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 transition-colors group-hover:text-slate-950">
                  {resource.name}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {resource.description}
                </p>
              </div>
              <span className="text-sm text-slate-300 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          ))}
      </div>
    </section>
  );

  const renderStudyPlan = () => (
          <section className="subject-panel rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Progress</p>
                <h3 className="mt-1 text-base font-bold text-slate-900">Study Plan</h3>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  color: "var(--subject-accent)",
                  backgroundColor: "color-mix(in srgb, var(--subject-accent) 9%, white)"
                }}
              >
                {completedSteps}/{totalSteps}
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentProgress()}%`,
                  backgroundColor: "var(--subject-accent)"
                }}
              />
            </div>

            <div className="mt-4 space-y-1.5">
              {[
                { key: "readOverview", label: "Read the overview & watch an introductory video" },
                { key: "readTextbook", label: "Read the chapter & mark difficulties" },
                { key: "watchedLectures", label: "Clarify difficult points" },
                { key: "solvedExercises", label: "Practise chapter exercises" },
                { key: "solvedBoardQuestions", label: "Solve past board questions" },
                { key: "madeNotes", label: "Review mistakes and retry difficult questions" },
                { key: "timedExams", label: "Take a timed test" },
                { key: "revisionCompleted", label: "Complete final revision" }
              ].map((item) => {
                const isDone = Boolean(chapterProgress[item.key as keyof ChapterProgress]);
                const StatusIcon = isDone ? CheckCircle : Circle;

                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={isDone}
                    onClick={() => handleChecklistToggle(item.key as keyof ChapterProgress)}
                    className={`group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isDone
                        ? "text-slate-700"
                        : "bg-slate-50/65 text-slate-600 hover:bg-slate-100"
                    }`}
                    style={
                      isDone
                        ? {
                            backgroundColor: "color-mix(in srgb, var(--subject-accent) 8%, white)"
                          }
                        : undefined
                    }
                  >
                    <span className="text-[13px] font-medium leading-relaxed">{item.label}</span>
                    <StatusIcon
                      className={`h-4 w-4 shrink-0 transition-colors ${isDone ? "" : "text-slate-300 group-hover:text-slate-400"}`}
                      style={isDone ? { color: "var(--subject-accent)" } : undefined}
                    />
                  </button>
                );
              })}
            </div>
          </section>

  );

  return (
    <div className="subject-page space-y-5" id="chapter-page-root">
      {/* Chapter identity */}
      <section
        className="subject-panel rounded-2xl border bg-white shadow-sm"
        id="chapter-page-header"
        style={{
          borderColor: "color-mix(in srgb, var(--subject-accent) 18%, #e2e8f0)",
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--subject-accent) 7%, white), white 72%)"
        }}
      >
        <div className="flex items-start gap-4 p-4 md:p-5">
          <button
            type="button"
            onClick={onBack}
            className="mt-0.5 shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-800"
            title="Go Back"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {activeChapterObj?.chapterNumber && (
                <span
                  className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    color: "var(--subject-accent)",
                    borderColor: "color-mix(in srgb, var(--subject-accent) 25%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--subject-accent) 8%, white)"
                  }}
                >
                  {activeChapterObj.chapterNumber}
                </span>
              )}

              {activeChapterObj && (
                <>
                  <span className="rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    📚 {activeChapterObj.nctbBookName}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {activeChapterObj.class}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {activeChapterObj.group}
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-3 break-words text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
              {chapterBanglaName && (
                <span className="font-bangla-title">{chapterBanglaName}</span>
              )}
              {chapterBanglaName && chapterName && (
                <span className="mx-2 hidden font-normal text-slate-300 sm:inline">|</span>
              )}
              {chapterName && (
                <span className="mt-1 block font-normal text-slate-500 sm:mt-0 sm:inline">
                  {chapterName}
                </span>
              )}
            </h1>
          </div>
        </div>
      </section>

      <section className="subject-panel rounded-2xl border bg-white lg:hidden">
        <button type="button" onClick={() => setMobilePlanOpen(open => !open)}
          aria-expanded={mobilePlanOpen} aria-controls="mobile-chapter-study-plan"
          className="flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left text-sm font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-500">
          <span>Study Plan · {completedSteps}/{totalSteps} completed</span>
          <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${mobilePlanOpen ? "rotate-180" : ""}`} />
        </button>
        <div id="mobile-chapter-study-plan" hidden={!mobilePlanOpen}>{renderStudyPlan()}</div>
      </section>

      {/* Main content: learning guide + supporting resources */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
        {/* Main learning guide */}
        <div className="space-y-5">
          {loadingPublished || loadError ? (
            <section className="subject-panel rounded-2xl border bg-white p-8 text-center" aria-live="polite">
              <p className="text-sm text-slate-500">{loadingPublished ? "Loading saved overview…" : loadError}</p>
              {!loadingPublished && <button type="button" onClick={() => setLoadAttempt(value => value + 1)} className="mt-3 rounded-lg border px-4 py-2 text-sm font-semibold">Retry</button>}
            </section>
          ) : !showChapterOverview ? (
            <section
              className="subject-panel flex min-h-[290px] flex-col justify-center rounded-2xl border bg-white p-7 shadow-sm md:p-8"
              style={{
                borderColor: "color-mix(in srgb, var(--subject-accent) 18%, #e2e8f0)",
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--subject-accent) 6%, white), white 72%)"
              }}
            >
              <div className="max-w-xl">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    color: "var(--subject-accent)",
                    backgroundColor: "color-mix(in srgb, var(--subject-accent) 10%, white)"
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Intelligent chapter guide
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                  Understand the chapter before you dive deeper
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Generate a concise overview and important topics for this chapter.
                </p>

                <button
                  type="button"
                  onClick={() => void generateChapterGuide()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ backgroundColor: "var(--subject-accent)" }}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate chapter guide
                </button>
                <button type="button" onClick={openOverviewManager} className="ml-3 mt-5 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-white hover:text-slate-800">
                  <Settings2 className="h-4 w-4" /> Manage overview
                </button>
              </div>
            </section>
          ) : (
            <section
              className="subject-panel overflow-hidden rounded-2xl border bg-white shadow-sm"
              style={{ borderColor: "color-mix(in srgb, var(--subject-accent) 18%, #e2e8f0)" }}
            >
              <div
                className="flex items-center justify-between gap-4 border-b px-5 py-4 md:px-7"
                style={{
                  borderColor: "color-mix(in srgb, var(--subject-accent) 12%, #e2e8f0)",
                  background:
                    "linear-gradient(90deg, color-mix(in srgb, var(--subject-accent) 6%, white), white)"
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      color: "var(--subject-accent)",
                      backgroundColor: "color-mix(in srgb, var(--subject-accent) 10%, white)"
                    }}
                  >
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Learning guide
                    </p>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                      Chapter Overview
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openOverviewManager}
                  disabled={loadingGuide}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                  title="Manage overview"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Manage</span>
                </button>
              </div>

              <div className="px-5 py-6 md:px-7 md:py-7">
                {loadingGuide ? (
                  <div className="rounded-xl bg-slate-50 p-8 text-center">
                    <p className="text-sm text-slate-500">Generating your chapter overview...</p>
                  </div>
                ) : apiWarning ? (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
                    <p className="text-sm text-red-600">{apiWarning}</p>
                    <button type="button" onClick={() => void generateChapterGuide()} className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700">Retry</button>
                  </div>
                ) : isPlaceholderOverview ? (
                  <p className="text-sm leading-relaxed text-slate-500">This chapter overview is not ready yet. You can use the Study Plan and video lessons while it is being prepared.</p>
                ) : guideData ? (
                  <div className="mx-auto max-w-3xl text-left">
                    {renderOverviewText([
                      guideData.introduction,
                      ...guideData.importantTopics.flatMap(item => [
                        `**${item.topic}**`, item.description,
                      ]),
                    ].join("\n\n"), "text-slate-700")}
                  </div>
                ) : null}
              </div>
            </section>
          )}


        </div>

        {/* Supporting column */}
        <aside className="space-y-4">
          <button
            type="button"
            onClick={onWatchVideoLessons}
            className="subject-panel group w-full rounded-2xl border border-red-100 bg-white p-4 text-left shadow-sm transition-all hover:border-red-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                  <path fill="#FF0000" d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8Z" />
                  <path fill="white" d="m10 15.5 5-3.5-5-3.5v7Z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-600">Video lessons</p>
                <h3 className="mt-0.5 text-sm font-bold text-slate-900">Find video lessons for this chapter</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  Browse YouTube search results and your saved lessons.
                </p>
              </div>
              <span className="text-lg text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-red-400">
                →
              </span>
            </div>
          </button>

          <div className="hidden lg:block">{renderStudyPlan()}</div>

          {renderRecommendedResources()}
        </aside>
      </div>

      {/* Overview management modal */}
      {isOverviewManagerOpen && (
        <div
          ref={managerRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Manage chapter overview"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur md:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Management</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Manage overview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Generate, edit and publish the overview students will see.
                </p>
              </div>
              <button
                type="button"
                onClick={closeOverviewManager}
                disabled={isSavingOverview}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close overview management"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              <button
                type="button"
                onClick={() => void generateChapterGuide(true)}
                disabled={loadingDraft || isSavingOverview}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {loadingDraft ? "Generating draft…" : "Generate new draft"}
              </button>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="complete-overview-editor">
                  Complete overview
                </label>
                <p className="mb-2 text-xs leading-relaxed text-slate-500">
                  Edit or paste the whole overview here. Paragraphs are preserved. Use **Title** or # Title for bold headings; numbered topics under IMPORTANT TOPICS are also supported.
                </p>
                <textarea
                  id="complete-overview-editor"
                  value={overviewEditorText}
                  readOnly={loadingDraft || isSavingOverview}
                  onChange={(event) => setOverviewEditorText(event.target.value)}
                  rows={22}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="overview-admin-token">
                  Management token
                </label>
                <input
                  id="overview-admin-token"
                  type="password"
                  value={overviewAdminToken}
                  onChange={(event) => setOverviewAdminToken(event.target.value)}
                  placeholder="Enter your private token"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {managementMessage && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {managementMessage}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeOverviewManager}
                  disabled={isSavingOverview}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveOverviewForStudents()}
                  disabled={isSavingOverview || loadingDraft}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingOverview ? "Saving…" : "Save for students"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
