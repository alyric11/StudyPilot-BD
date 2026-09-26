/**
 * STUDYPILOT BD - Interactive Chapter Learning Hub
 * 
 * Purpose:
 * Renders the study canvas for any selected textbook chapter.
 * Includes the AI-generated chapter guide, progress tracking,
 * video lessons, and recommended study resources.
 */

import React, { useEffect, useState } from "react";
import { ChapterOverviewData, ChapterProgress, UserProfile } from "../types";
import { BookOpen, CheckCircle, Sparkles, ArrowLeft, Settings2, X } from "lucide-react";
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
  const [guideData, setGuideData] = useState<ChapterOverviewData | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const [showChapterOverview, setShowChapterOverview] = useState(false);
  const [isOverviewManagerOpen, setIsOverviewManagerOpen] = useState(false);
  const [overviewAdminToken, setOverviewAdminToken] = useState("");
  const [draftOverview, setDraftOverview] = useState<ChapterOverviewData>({ introduction: "", importantTopics: [] });
  const [managementMessage, setManagementMessage] = useState<string | null>(null);
  const [isSavingOverview, setIsSavingOverview] = useState(false);
  const [overviewEditorText, setOverviewEditorText] = useState("");

  const copyOverview = (overview: ChapterOverviewData): ChapterOverviewData => ({
    introduction: overview.introduction,
    importantTopics: overview.importantTopics.map((topic) => ({ ...topic })),
  });

  const isOverviewHeading = (line: string) => {
    const plainLine = line.replace(/^\*\*(.*?)\*\*$/, "$1").trim();

    return (
      /^\*\*.+\*\*$/.test(line.trim()) ||
      /^(chapter overview|overview|important topics)\s*:?$/i.test(plainLine) ||
      (!/[.!?।]$/.test(plainLine) && plainLine.length > 0)
    );
  };

  const renderInlineBold = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
      const boldMatch = part.match(/^\*\*(.+)\*\*$/);
      return boldMatch ? <strong key={index}>{boldMatch[1]}</strong> : <React.Fragment key={index}>{part}</React.Fragment>;
    });

  const renderOverviewText = (text: string, bodyClassName: string) => {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const hasMeaningfulLine = lines.some((line) => line.trim());

    if (!hasMeaningfulLine) return null;

    return (
      <div>
        {lines.map((line, index) => {
          const trimmedLine = line.trim();

          if (!trimmedLine) return <div key={index} className="h-1" aria-hidden="true" />;

          if (isOverviewHeading(trimmedLine)) {
            return (
              <h4 key={index} className="mb-2 mt-6 text-base font-semibold leading-relaxed text-slate-900 first:mt-0">
                {renderInlineBold(trimmedLine.replace(/^\*\*(.*?)\*\*$/, "$1"))}
              </h4>
            );
          }

          return (
            <p key={index} className={`${bodyClassName} mb-6 leading-relaxed text-justify`}>
              {renderInlineBold(trimmedLine)}
            </p>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    let cancelled = false;
    const loadPublishedOverview = async () => {
      setGuideData(null);
      setShowChapterOverview(false);
      setApiWarning(null);
      try {
        const params = new URLSearchParams({ subjectId, chapterId });
        const response = await fetch(`/api/chapter-overviews?${params.toString()}`);
        if (!response.ok) return;
        const overview: ChapterOverviewData = await response.json();
        if (!cancelled) {
          setGuideData(overview);
          setShowChapterOverview(true);
        }
      } catch {
        // A saved overview is optional; the regular guide remains available.
      }
    };
    void loadPublishedOverview();
    return () => { cancelled = true; };
  }, [subjectId, chapterId]);

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
    setShowChapterOverview(true);
    setLoadingGuide(true);
    setApiWarning(null);

    try {
      const res = await fetch("/api/generate-chapter-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subjectName,
          chapter: chapterName,
          classLevel: profile.classLevel,
          group: profile.group,
        }),
      });

      if (!res.ok) {
        throw new Error(`Guide request failed: ${res.status}`);
      }

      const data: ChapterOverviewData = await res.json();
      setGuideData(data);
      if (forManagement) {
        const draft = copyOverview(data);
        setDraftOverview(draft);
        setOverviewEditorText(formatOverviewForEditor(draft));
      }
    } catch (error) {
      console.error(error);
      setApiWarning("Chapter guide could not be generated right now.");
    } finally {
      setLoadingGuide(false);
    }
  };

  const openOverviewManager = () => {
    const draft = guideData ? copyOverview(guideData) : { introduction: "", importantTopics: [] };
    setDraftOverview(draft);
    setOverviewEditorText(formatOverviewForEditor(draft));
    setManagementMessage(null);
    setIsOverviewManagerOpen(true);
  };

  const formatOverviewForEditor = (overview: ChapterOverviewData) => [
    "CHAPTER OVERVIEW",
    overview.introduction.trim(),
    "",
    "IMPORTANT TOPICS",
    ...overview.importantTopics.flatMap((topic, index) => [
      `${index + 1}. ${topic.topic.trim()}`,
      topic.description.trim(),
      "",
    ]),
  ].join("\n").trim();

  const parseOverviewFromEditor = (text: string): ChapterOverviewData | null => {
    const normalized = text.replace(/\r\n/g, "\n").trim();
    const sections = normalized.split(/^\s*IMPORTANT TOPICS\s*:?\s*$/im);
    const introduction = (sections[0] || "")
      .replace(/^\s*CHAPTER OVERVIEW\s*:?\s*/i, "")
      .trim();

    if (!introduction) return null;

    const importantTopics: ChapterOverviewData["importantTopics"] = [];
    let activeTopic: { topic: string; description: string[] } | null = null;

    for (const line of (sections[1] || "").split("\n")) {
      const topicMatch = line.match(/^\s*\d+[.)]\s+(.+?)\s*$/);

      if (topicMatch) {
        if (activeTopic) {
          importantTopics.push({
            topic: activeTopic.topic,
            description: activeTopic.description.join("\n").trim(),
          });
        }
        activeTopic = { topic: topicMatch[1].trim().replace(/^\*\*(.*?)\*\*$/, "$1"), description: [] };
      } else if (activeTopic) {
        activeTopic.description.push(line.trim());
      }
    }

    if (activeTopic) {
      importantTopics.push({
        topic: activeTopic.topic,
        description: activeTopic.description.join("\n").trim(),
      });
    }

    return {
      introduction,
      importantTopics: importantTopics.filter((topic) => topic.topic && topic.description),
    };
  };

  const saveOverviewForStudents = async () => {
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
    try {
      const response = await fetch("/api/chapter-overviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-overview-admin-token": overviewAdminToken },
        body: JSON.stringify({ subjectId, chapterId, overview: overviewToSave }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The overview could not be saved.");
      setGuideData(data);
      setDraftOverview(data);
      setOverviewEditorText(formatOverviewForEditor(data));
      setShowChapterOverview(true);
      setIsOverviewManagerOpen(false);
    } catch (error) {
      setManagementMessage(error instanceof Error ? error.message : "The overview could not be saved.");
    } finally {
      setIsSavingOverview(false);
    }
  };

  const handleChecklistToggle = (key: keyof ChapterProgress) => {
    const updated = {
      ...chapterProgress,
      [key]: !chapterProgress[key]
    };
    onUpdateProgress(updated);
  };

  const progressKeys: Array<keyof ChapterProgress> = [
    "readOverview",
    "watchedIntroVideo",
    "readTextbook",
    "watchedLectures",
    "solvedExercises",
    "solvedBoardQuestions",
    "madeNotes",
    "timedExams",
    "revisionCompleted",
  ];

  const totalSteps = progressKeys.length;

  const completedSteps = progressKeys.filter(
    (key) => Boolean(chapterProgress[key])
  ).length;

  const percentProgress = () => {
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps / totalSteps) * 100);
  };


  const hasExpandedOverview = showChapterOverview && Boolean(guideData);

  const renderRecommendedResources = (stacked: boolean) => (
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
          <p className="text-[10px] text-slate-400">Trusted places to continue learning</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${stacked ? "" : "sm:grid-cols-2"}`}>
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
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                  {resource.description}
                </p>
              </div>
              <span className="text-sm text-slate-300 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          ))}
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

      {/* Main content: learning guide + supporting resources */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
        {/* Main learning guide */}
        <div className="space-y-5">
          {!showChapterOverview ? (
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

                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
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
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
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
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
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
                  </div>
                ) : guideData ? (
                  <div className="mx-auto max-w-3xl text-left">
                    <div className="text-[15px] leading-8 text-slate-700 md:text-base">
                      {renderOverviewText(guideData.introduction, "text-slate-700")}
                    </div>

                    {guideData.importantTopics.length > 0 && (
                      <div className="mt-7 border-t border-slate-100 pt-6">
                        <div className="mb-4 flex items-center gap-2.5">
                          <span
                            className="h-5 w-1 rounded-full"
                            style={{ backgroundColor: "var(--subject-accent)" }}
                            aria-hidden="true"
                          />
                          <h3 className="text-lg font-bold text-slate-900">Important Topics</h3>
                        </div>

                        <div className="space-y-1">
                          {guideData.importantTopics.map((item, index) => (
                            <article
                              key={index}
                              className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-slate-100 py-4 last:border-b-0"
                            >
                              <span
                                className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                                style={{
                                  color: "var(--subject-accent)",
                                  backgroundColor: "color-mix(in srgb, var(--subject-accent) 9%, white)"
                                }}
                              >
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <h4 className="mb-1.5 text-[15px] font-bold leading-relaxed text-slate-900">
                                  {item.topic}
                                </h4>
                                <div className="text-sm leading-7 text-slate-600 md:text-[15px]">
                                  {renderOverviewText(item.description, "text-slate-600")}
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {!hasExpandedOverview && renderRecommendedResources(false)}
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
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-400">Video lessons</p>
                <h3 className="mt-0.5 text-sm font-bold text-slate-900">Watch recommended lectures</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  Open curated YouTube lessons for this chapter.
                </p>
              </div>
              <span className="text-lg text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-red-400">
                →
              </span>
            </div>
          </button>

          {/* Compact Study Plan list */}
          <section className="subject-panel rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Progress</p>
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
                { key: "readOverview", label: "Read the chapter overview" },
                { key: "watchedIntroVideo", label: "Watch an introductory video" },
                { key: "readTextbook", label: "Read the chapter & mark difficulties" },
                { key: "watchedLectures", label: "Clarify difficult points" },
                { key: "solvedExercises", label: "Practise chapter exercises" },
                { key: "solvedBoardQuestions", label: "Solve past board questions" },
                { key: "madeNotes", label: "Revise and retry weak areas" },
                { key: "timedExams", label: "Take a timed test" },
                { key: "revisionCompleted", label: "Complete revision session" }
              ].map((item) => {
                const isDone = Boolean(chapterProgress[item.key as keyof ChapterProgress]);

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
                    <span className="text-xs font-medium leading-relaxed">{item.label}</span>
                    <CheckCircle
                      className={`h-4 w-4 shrink-0 transition-colors ${isDone ? "" : "text-slate-300 group-hover:text-slate-400"}`}
                      style={isDone ? { color: "var(--subject-accent)" } : undefined}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {hasExpandedOverview && renderRecommendedResources(true)}
        </aside>
      </div>

      {/* Overview management modal */}
      {isOverviewManagerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label="Manage chapter overview"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur md:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Management</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Manage overview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Generate, edit and publish the overview students will see.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOverviewManagerOpen(false)}
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
                disabled={loadingGuide}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {loadingGuide ? "Generating draft…" : "Generate new draft"}
              </button>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="complete-overview-editor">
                  Complete overview
                </label>
                <p className="mb-2 text-xs leading-relaxed text-slate-500">
                  Edit or paste the whole overview here. Keep <strong>CHAPTER OVERVIEW</strong>, <strong>IMPORTANT TOPICS</strong>, and the numbered topic lines; paragraph breaks will stay separate and topic titles stay bold.
                </p>
                <textarea
                  id="complete-overview-editor"
                  value={overviewEditorText}
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
                  onClick={() => setIsOverviewManagerOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveOverviewForStudents()}
                  disabled={isSavingOverview}
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
