/**
 * STUDYPILOT BD - Interactive Chapter Learning Hub
 * 
 * Purpose:
 * Renders the study canvas for any selected textbook chapter.
 * Includes the AI-generated chapter guide, progress tracking,
 * video lessons, and recommended study resources.
 */

import React, { useState } from "react";
import { ChapterOverviewData, ChapterProgress, UserProfile } from "../types";
import { BookOpen, CheckCircle, Sparkles, ArrowLeft } from "lucide-react";
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
  const generateChapterGuide = async () => {
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
    } catch (error) {
      console.error(error);
      setApiWarning("Chapter guide could not be generated right now.");
    } finally {
      setLoadingGuide(false);
    }
  };

  const handleChecklistToggle = (key: keyof ChapterProgress) => {
    const updated = {
      ...chapterProgress,
      [key]: !chapterProgress[key]
    };
    onUpdateProgress(updated);
  };

  const percentProgress = () => {
    const total = Object.values(chapterProgress).length;
    const completed = Object.values(chapterProgress).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6" id="chapter-page-root">
      {/* Chapter Header */}
      <div className="space-y-3" id="chapter-page-header">

        {/* Title Box */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">

            <button
              onClick={onBack}
              className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shrink-0 border border-slate-200"
              title="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="hidden sm:block w-px h-16 bg-slate-200 shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold uppercase tracking-wider">
                {activeChapterObj?.chapterNumber}
              </div>

              <h1 className="mt-2 text-xl md:text-3xl font-display font-bold text-slate-800 break-words leading-tight">
                {chapterBanglaName}
                {chapterBanglaName && chapterName && (
                  <span className="text-slate-400 font-normal block sm:inline">
                    {" | "}
                  </span>
                )}
                {chapterName && (
                  <span className="text-slate-400 font-normal block sm:inline">
                    {chapterName}
                  </span>
                )}
              </h1>
            </div>

          </div>
        </div>

        {/* Metadata Box */}
        {activeChapterObj && (
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              {/* Chapter Metadata */}
              <div className="flex flex-wrap items-center gap-2">

                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200/70 text-slate-700 rounded-md border border-slate-300/20">
                  📚 {activeChapterObj.nctbBookName}
                </span>

                <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/10">
                  {activeChapterObj.class}
                </span>

                <span className="text-xs font-medium px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md border border-violet-200/10">
                  Group: {activeChapterObj.group}
                </span>

              </div>

              {/* Chapter Mastery */}
              <div className="flex items-center gap-3 shrink-0 px-2.5 py-1 bg-slate-100/80 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">
                  Chapter Mastery:
                </span>

                <div className="w-20 sm:w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${percentProgress()}%` }}
                  />
                </div>

                <span className="text-xs font-bold text-indigo-600 w-8 text-right">
                  {percentProgress()}%
                </span>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Intelligent Chapter Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Intelligent Chapter Guide / Chapter Overview */}
            {!showChapterOverview ? (
              <button
                type="button"
                onClick={generateChapterGuide}
                className="w-full bg-white rounded-xl border border-slate-200/60 p-8 shadow-sm text-left hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-indigo-600 font-display font-bold">
                  <Sparkles className="w-5 h-5" />
                  Intelligent Chapter Guide
                </div>

                <p className="mt-3 text-slate-600 text-sm">
                  Get a quick AI-generated overview of this chapter.
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Click to generate
                </p>
              </button>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/60 p-8 shadow-sm text-center">
                <h3 className="text-slate-700 font-semibold">
                  Chapter Overview
                </h3>
                {loadingGuide ? (
                  <p className="text-lg text-slate-400">
                    Generating your chapter overview...
                  </p>
                ) : apiWarning ? (
                  <p className="text-lg text-red-500">
                    {apiWarning}
                  </p>
                ) : guideData ? (
                  <div className="text-left space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Chapter Overview
                      </h3>
                      <p className="text-slate-700 leading-relaxed text-justify">
                        {guideData.introduction}
                      </p>
                    </div>

                    {guideData.importantTopics.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Important Topics
                        </h3>

                        <div className="space-y-4">
                          {guideData.importantTopics.map((item, index) => (
                            <div key={index}>
                              <p className="font-semibold text-slate-900">
                                {index + 1}. {item.topic}
                              </p>
                              <p className="text-slate-600 mt-1 leading-relaxed text-justify">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}




          </div>

          {/* Checklist Sidebar - Column 3 */}
          <div className="space-y-6">
            {/* Learning Checklist */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">Study Plan</h3>

              </div>

              <div className="space-y-3">
                {[
                  { key: "readOverview", label: "Read overview here" },
                  { key: "readTextbook", label: "Read textbook chapter" },
                  { key: "watchedLectures", label: "Watch lecture videos" },
                  { key: "solvedExercises", label: "Solve chapter exercises" },
                  { key: "solvedBoardQuestions", label: "Practice past board questions" },
                  { key: "madeNotes", label: "Create formula/concept notes" },
                  { key: "timedExams", label: "Sit for timed exams" },
                  { key: "revisionCompleted", label: "Complete revision session" }
                ].map((item) => (

                  <button
                    key={item.key}
                    onClick={() => handleChecklistToggle(item.key as keyof ChapterProgress)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer group ${chapterProgress[item.key as keyof ChapterProgress]
                      ? "bg-indigo-50/30 border-indigo-100 text-slate-700"
                      : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-indigo-300"
                      }`}
                  >
                    <span className="text-xs font-medium">{item.label}</span>
                    <CheckCircle className={`w-4 h-4 transition-colors ${chapterProgress[item.key as keyof ChapterProgress]
                      ? "text-indigo-500 fill-indigo-100"
                      : "text-slate-300 group-hover:text-indigo-400"
                      }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Study Plan */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={onWatchVideoLessons}
                  className="w-full flex items-center gap-4 relative text-left rounded-lg p-1 -m-1 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                      <path fill="#FF0000" d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8Z" />
                      <path fill="white" d="m10 15.5 5-3.5-5-3.5v7Z" />
                    </svg>
                  </div>

                  <h4 className="text-xs font-bold text-slate-700">
                    Watch video lectures
                  </h4>
                </button>
              </div>
            </div>

            {/* Recommended Resources */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider mb-4">
                Recommended Resources
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {[...STUDY_RESOURCES]
                  .sort(
                    (a, b) =>
                      ["NCTB", "10 Minute School", "Shikho", "Khan Academy"].indexOf(a.name) -
                      ["NCTB", "10 Minute School", "Shikho", "Khan Academy"].indexOf(b.name)
                  )
                  .map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {resource.logoUrl ? (
                            <img
                              src={resource.logoUrl}
                              alt={`${resource.name} logo`}
                              className="w-7 h-7 object-contain"
                            />
                          ) : (
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {resource.name}
                          </h4>
                          <p className="text-xs text-slate-500 leading-snug">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
              </div>
            </div>


          </div>
        </div>

    </div>
  );
}
