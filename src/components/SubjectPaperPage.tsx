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
  const hasSections = subject.chapters.some((chapter) => chapter.section);
  const subjectClass = subject.chapters[0]?.class ?? "";

  const sections = hasSections
    ? Array.from(
      new Set(
        subject.chapters
          .map((chapter) => chapter.section)
          .filter((section): section is string => Boolean(section))
      )
    )
    : ["Chapters"];

  const getChaptersForSection = (section: string) => {
    if (!hasSections) {
      return subject.chapters;
    }

    return subject.chapters.filter(
      (chapter) => chapter.section === section
    );
  };

  return (
    <div className="space-y-5">
      {/* Subject Header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Back button + Subject title */}
          <div className="flex items-center gap-4 min-w-0 flex-1">

            <button
              onClick={onBack}
              className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="hidden sm:block w-px h-16 bg-slate-200 shrink-0" />

            <div className="min-w-0">
              <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold uppercase tracking-wider">
                {subjectClass}
              </div>

              <h1 className="text-xl md:text-3xl font-display font-bold text-slate-800 break-words leading-tight mt-1">
                {subject.banglaName}
                <span className="text-slate-400 font-normal block sm:inline">
                  {" | "}
                  {subject.name}
                </span>
              </h1>
            </div>

          </div>

          {/* Progress */}
          <div className="w-full sm:w-48 shrink-0">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-slate-500">
                Progress
              </span>

              <span className="font-bold text-indigo-600">
                {mastery}%
              </span>
            </div>

            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${mastery}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Chapter navigator */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-5">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Chapters
          </h2>

          <p className="text-[11px] text-slate-400 mt-1">
            Select a chapter to open its StudyPilot learning center.
          </p>
        </div>

        {/* Two-column section grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-8">
          {sections.map((section) => {
            const chapters = getChaptersForSection(section);

            return (
              <section key={section}>
                {/* Section heading */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800">
                    {section}
                  </h3>

                  <span className="text-[11px] font-semibold text-indigo-600">
                    See all ({chapters.length})
                  </span>
                </div>

                {/* Chapter list */}
                <div className="mt-2">
                  {chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => onSelectChapter(chapter)}
                      className="w-full flex items-center gap-2.5 py-1.5 px-1.5 text-left hover:bg-indigo-50/50 rounded-md transition-colors cursor-pointer group"
                    >
                      {/* Number marker */}
                      <div className="relative flex flex-col items-center shrink-0">
                        <div className="w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-colors">
                          <span className="text-[8px] font-bold text-slate-400 group-hover:text-indigo-600">
                            {index + 1}
                          </span>
                        </div>

                        {index < chapters.length - 1 && (
                          <div className="absolute top-6 h-3 w-px bg-slate-200" />
                        )}
                      </div>

                      {/* Chapter title */}
                      <span className="flex-1 text-xs font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">
                        {chapter.banglaName}
                      </span>

                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}