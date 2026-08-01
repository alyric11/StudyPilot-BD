/**
 * STUDYPILOT BD - Intelligent Daily Study Planner
 * 
 * Purpose:
 * Generates structured study routines for the day. Students input their target study hours
 * and select specific subjects. The app then calls the backend Gemini API to return a precise,
 * bite-sized study plan outlining textbook readings, equations/formulas review, and exercise practices.
 */

import React, { useState } from "react";
import { UserProfile, StudyPlanResponse } from "../types";
import { Clock, Flame, CheckCircle, Sparkles } from "lucide-react";

interface StudyPlannerProps {
  profile: UserProfile;
  subjects: Array<{ id: string; name: string; banglaName: string }>;
  onBackToDashboard?: () => void;
}

export default function StudyPlanner({ profile, subjects, onBackToDashboard }: StudyPlannerProps) {
  const [hours, setHours] = useState("2");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    subjects.slice(0, 3).map((s) => s.name)
  );
  const [generating, setGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<StudyPlanResponse | null>(null);

  // Validation & Error States
  const [errors, setErrors] = useState<{ hours?: string; subjects?: string }>({});
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  const toggleSubject = (name: string) => {
    setSelectedSubjects((prev) => {
      const next = prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name];
      if (next.length > 0 && errors.subjects) {
        setErrors((errs) => ({ ...errs, subjects: undefined }));
      }
      return next;
    });
  };

  const generateLocalFallbackPlan = (numHours: number, subjectList: string[]): StudyPlanResponse => {
    const totalMin = Math.round(numHours * 60);
    const revisionMin = 15;
    const studyPool = totalMin - revisionMin;
    const subjectsCount = Math.max(subjectList.length, 1);
    const blockMin = Math.max(Math.floor(studyPool / subjectsCount), 15);

    const items: Array<{ timeInMinutes: number; subject: string; chapter: string; activity: string }> = [];
    
    subjectList.forEach((subName) => {
      const subObj = subjects.find(s => s.name === subName);
      const subTitle = subObj ? `${subObj.banglaName} (${subObj.name})` : subName;
      items.push({
        timeInMinutes: blockMin,
        subject: subTitle,
        chapter: "Syllabus Core Study",
        activity: "Review key textbook sections, write out equations in your notebook, and solve Creative Question (CQ) exercises."
      });
    });

    items.push({
      timeInMinutes: revisionMin,
      subject: "Revision Block",
      chapter: "Formulas & Diaries",
      activity: "Revise formulas in your Study Diary, review custom equations, and check off completed syllabus topics."
    });

    return {
      totalMinutes: totalMin,
      plan: items,
      motivationQuote: "সাফল্যের রাস্তা একটাই—পরিশ্রম ও ধারাবাহিকতা। Every step counts! Keep going!"
    };
  };

  const handleGeneratePlan = async () => {
    const newErrors: typeof errors = {};
    setApiWarning(null);

    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      newErrors.hours = "Please enter a valid study duration.";
    } else if (parsedHours < 0.5) {
      newErrors.hours = "Minimum study time is 0.5 hours.";
    } else if (parsedHours > 16) {
      newErrors.hours = "Maximum study time is capped at 16 hours.";
    }

    if (selectedSubjects.length === 0) {
      newErrors.subjects = "Please select at least 1 subject to build your plan.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours: parsedHours.toString(),
          subjects: selectedSubjects,
          classLevel: profile.classLevel,
          group: profile.group
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlanResult(data);
      } else {
        throw new Error("Server returned an error status");
      }
    } catch (err) {
      console.warn("Could not generate plan from API, using custom offline algorithm instead.", err);
      const offlinePlan = generateLocalFallbackPlan(parsedHours, selectedSubjects);
      setPlanResult(offlinePlan);
      setApiWarning("Unable to reach AI co-pilot. Generated an optimized offline study routine for you instead!");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6" id="study-planner-container">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Daily Study Planner</h2>
          <p className="text-slate-400 text-xs">Pilot your day with custom hour blocks mapped to NCTB syllabus requirements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Setup Column */}
        <div className="lg:col-span-2 space-y-5 bg-slate-50/50 p-5 rounded-xl border border-slate-150">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Flight Controls</h3>

          {/* Hours Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500" htmlFor="hours-input">Available Study Time Today (Hours)</label>
            <div className="relative">
              <input
                id="hours-input"
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={hours}
                onChange={(e) => {
                  setHours(e.target.value);
                  if (errors.hours) setErrors((prev) => ({ ...prev, hours: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm bg-white font-medium text-slate-800 focus:outline-none focus:border-indigo-500 ${
                  errors.hours ? "border-rose-300 focus:ring-1 focus:ring-rose-100" : "border-slate-200"
                }`}
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Hours</span>
            </div>
            {errors.hours && <p className="text-rose-600 text-[9px] font-semibold">{errors.hours}</p>}
            <p className="text-[10px] text-slate-400">Usually 1.5 to 3 hours are highly recommended for daily self-study.</p>
          </div>

          {/* Subjects Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500">Prioritize Today's Subjects</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjects.map((sub) => (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => toggleSubject(sub.name)}
                  className={`p-2 rounded-lg border text-left transition-all text-xs flex items-center justify-between cursor-pointer ${
                    selectedSubjects.includes(sub.name)
                      ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{sub.banglaName} ({sub.name})</span>
                  <CheckCircle className={`w-3.5 h-3.5 ${
                    selectedSubjects.includes(sub.name) ? "text-indigo-500 fill-indigo-100" : "text-transparent"
                  }`} />
                </button>
              ))}
            </div>
            {errors.subjects && <p className="text-rose-600 text-[9px] font-semibold">{errors.subjects}</p>}
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            id="plan-generate-btn"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? "AI is Calculating Timings..." : "Generate Guided Flight Plan"}
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-4">
          {apiWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-800 text-xs flex items-start gap-2.5 shadow-xs">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-bold">Offline Planner Active</p>
                <p className="text-amber-700 mt-0.5">{apiWarning}</p>
              </div>
            </div>
          )}

          {generating ? (
            <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 space-y-4 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-700">Pilot AI is Plotting Your Study Plan...</h4>
                <p className="text-xs text-slate-400 max-w-xs">Splitting available time, designing revision blocks, and finding custom learning milestones.</p>
              </div>
            </div>
          ) : planResult ? (
            <div className="space-y-5" id="study-plan-output">
              {/* Motivation quote */}
              <div className="bg-slate-900 p-4.5 rounded-xl text-white shadow-sm flex items-start gap-3">
                <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Daily Inspiration</h4>
                  <p className="text-xs italic font-medium leading-relaxed mt-0.5 text-slate-200">"{planResult.motivationQuote}"</p>
                </div>
              </div>

              {/* Timeline list */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Step-by-Step Schedule</h3>
                <div className="relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100 space-y-4">
                  {planResult.plan.map((item, index) => (
                    <div key={index} className="flex gap-4 relative">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/50 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-slate-300 hover:bg-white transition-all duration-250">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.subject}</span>
                          <h4 className="text-xs font-semibold text-slate-800 font-display">{item.chapter}</h4>
                          <p className="text-xs text-slate-500">{item.activity}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full border border-indigo-100/40 self-start sm:self-center">
                          <Clock className="w-3.5 h-3.5" />
                          {item.timeInMinutes} mins
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
              <Clock className="w-8 h-8 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-600">No Plan Generated</h4>
              <p className="text-xs text-slate-400 max-w-xs">Select your study time and subjects in the left column to create today's custom co-pilot schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
