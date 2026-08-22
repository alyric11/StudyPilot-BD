import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Subject, Chapter } from "../data/curriculum";

interface SubjectPaperPageProps {
  subject: Subject;
  mastery: number;
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
}

export default function SubjectPaperPage({
  subject,
  mastery,
  onBack,
  onSelectChapter
}: SubjectPaperPageProps) {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Subjects
      </button>

      {/* Subject header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              NCTB Subject / Paper
            </p>

            <h1 className="text-2xl font-display font-bold text-slate-800 mt-1">
              {subject.banglaName}
            </h1>

            <p className="text-sm text-slate-400 font-semibold mt-1">
              {subject.name}
            </p>
          </div>

          <div className="w-full sm:w-48">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-500">
                Progress
              </span>

              <span className="font-bold text-indigo-600">
                {mastery}%
              </span>
            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${mastery}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Chapters
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Select a chapter to open its StudyPilot learning center.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {subject.chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter)}
              className="w-full p-4 bg-slate-50/50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between gap-4 text-left transition-all cursor-pointer group"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {chapter.chapterNumber}
                </span>

                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 block mt-1">
                  {chapter.banglaName}
                </span>

                <span className="text-xs text-slate-400 block mt-1 truncate">
                  {chapter.name}
                </span>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}