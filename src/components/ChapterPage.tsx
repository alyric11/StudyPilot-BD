/**
 * STUDYPILOT BD - Interactive Chapter Learning Hub
 * 
 * Purpose:
 * Renders the study canvas for any selected textbook chapter. It combines:
 * 1. AI Study Guide: Dynamically fetched via backend Gemini APIs, laying out learning objectives, exam weights, and mistake lists.
 * 2. Active AI Tutor Chat: Interactive chat box styled in Bangla/English (Banglish) to answer student doubts and explain concepts.
 * 3. Syllabus Checklists: An interactive checklist (textbooks, lectures, notes, CQs) to track active completion.
 */

import React, { useState, useEffect, useRef } from "react";
import { ChapterOverviewData, ChapterProgress, UserProfile } from "../types";
import { BookOpen, AlertTriangle, Play, CheckCircle, Send, Sparkles, Clock, Compass, FileText, ChevronRight, MessageSquare, ArrowLeft } from "lucide-react";
import { NCTB_CURRICULUM } from "../data/curriculum";

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
}

interface ChatMessage {
  sender: 'student' | 'ai';
  text: string;
  timestamp: string;
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
  onBack
}: ChapterPageProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'tutor'>('guide');
  const [guideData, setGuideData] = useState<ChapterOverviewData | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  // Retrieve complete chapter object from curriculum reference
  const activeChapterObj = (() => {
    const classConfig = NCTB_CURRICULUM[profile.classLevel];
    if (!classConfig) return null;
    const activeGroup = profile.group && classConfig.subjects[profile.group] ? profile.group : "None";
    const subjects = classConfig.subjects[activeGroup] || [];
    const activeSubject = subjects.find(s => s.id === subjectId || s.name === subjectName);
    return activeSubject?.chapters.find(c => c.id === chapterId || c.name === chapterName) || null;
  })();

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `আসসালামু আলাইকুম, ${profile.name}! I am your StudyPilot academic assistant for **${subjectName}: ${chapterBanglaName} (${chapterName})**. Ask me anything about this chapter, or click one of the quick study prompts below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getLocalFallbackGuide = (subject: string, chapter: string): ChapterOverviewData => {
    return {
      introduction: `This guide outlines the core topics for ${subject} chapter "${chapter}". It covers essential theorems, definitions, and equations from the National Curriculum and Textbook Board (NCTB) syllabus, optimized for Bangladeshi students preparing for final evaluations.`,
      whyItMatters: "Mastering this chapter is highly critical because it introduces foundational concepts tested across multiple board question blocks.",
      realLifeApplications: "Provides the base logic for scientific experiments, computational applications, and advanced studies.",
      examImportance: {
        priority: "high",
        reason: "This chapter accounts for approximately 15-20% of marks in creative questions (CQ) and multiple-choice questions (MCQ) in final board examinations."
      },
      learningObjectives: [
        "Explain key terms, variables, definitions, and physical/logical units.",
        "Derive major mathematical proofs and equations correctly.",
        "Apply correct formulas to complete syllabus exercise questions.",
        "Avoid common terminal-exam pitfalls and board questions errors."
      ],
      prerequisites: [
        "Knowledge of previous chapters and fundamental mathematical formulas.",
        "Familiarity with standard NCTB course vocabulary."
      ],
      commonMistakes: [
        "Mixing up similar formulas or misapplying physical units under pressure.",
        "Omitting detailed steps in Gha/Umo creative CQ question blocks.",
        "Reading questions too quickly and missing small trick constraints in stems."
      ],
      estimatedTime: {
        readingTextbook: "45 min",
        watchingLectures: "60 min",
        practice: "120 min",
        revision: "40 min"
      },
      studyStrategySteps: [
        { step: "Step 1: Read NCTB textbook", description: "Highlight primary formulas, core definitions, and board-question triggers." },
        { step: "Step 2: Watch animated video lectures", description: "Clear visual blocks and understand experimental setups." },
        { step: "Step 3: Solve textbook exercises", description: "Test your immediate conceptual clarity with end-of-chapter exercises." },
        { step: "Step 4: Solve Board Exam CQs", description: "Practice previous 5 years' board exam questions (Dhaka, Rajshahi, Chittagong, etc.)" },
        { step: "Step 5: Test yourself with a mock quiz", description: "Answer standard MCQ or short questions under a strict timer." }
      ],
      recommendedResources: [
        {
          title: "Complete Video Lecture and Practice - 10 Minute School",
          source: "10 Minute School",
          url: "https://10minuteschool.com",
          type: "video",
          qualityRating: "Highly Recommended"
        },
        {
          title: "Interactive Practice Exercises - Khan Academy Bangla",
          source: "Khan Academy Bangla",
          url: "https://bangla.khanacademy.org",
          type: "simulation",
          qualityRating: "Highly Recommended"
        },
        {
          title: "NCTB Board Book Digital PDF Version",
          source: "NCTB Bangladesh",
          url: "http://nctb.gov.bd",
          type: "pdf",
          qualityRating: "Official Resource"
        }
      ]
    };
  };

  // Fetch chapter guide
  useEffect(() => {
    const fetchGuide = async () => {
      setLoadingGuide(true);
      setApiWarning(null);
      try {
        const response = await fetch("/api/generate-chapter-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subjectName,
            chapter: chapterName,
            classLevel: profile.classLevel,
            group: profile.group
          })
        });
        if (response.ok) {
          const data = await response.json();
          setGuideData(data);
        } else {
          throw new Error("Failed to load custom guide");
        }
      } catch (err) {
        console.warn("Could not fetch real guide, using cached fallback", err);
        const offlineGuide = getLocalFallbackGuide(subjectName, chapterName);
        setGuideData(offlineGuide);
        setApiWarning("Unable to contact AI co-pilot. Showing offline curriculum study guide instead!");
      } finally {
        setLoadingGuide(false);
      }
    };
    fetchGuide();
  }, [subjectName, chapterName, profile]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle checklist checkbox toggling
  const handleChecklistToggle = (key: keyof ChapterProgress) => {
    const updated = {
      ...chapterProgress,
      [key]: !chapterProgress[key]
    };
    onUpdateProgress(updated);
  };

  // Quick Action Chat prompts
  const triggerQuickPrompt = async (queryType: string, label: string) => {
    const newMsg: ChatMessage = {
      sender: 'student',
      text: label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
    setSendingMessage(true);

    try {
      const res = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: label,
          queryType,
          subject: subjectName,
          chapter: chapterName,
          classLevel: profile.classLevel
        })
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.text || "I'm having trouble retrieving details right now. Let's try again shortly!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "System offline. Here is a study tip: Make sure to read the NCTB textbook summary and formulate a mind map!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Submit manual chat text
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || sendingMessage) return;

    const studentText = userInput;
    setUserInput("");

    const newMsg: ChatMessage = {
      sender: 'student',
      text: studentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
    setSendingMessage(true);

    try {
      const res = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: studentText,
          subject: subjectName,
          chapter: chapterName,
          classLevel: profile.classLevel
        })
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "My connection fluctuated. Let's continue talking! Could you repeat or ask another NCTB curriculum question?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const percentProgress = () => {
    const total = Object.values(chapterProgress).length;
    const completed = Object.values(chapterProgress).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6" id="chapter-page-root">
      {/* Back Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm" id="chapter-page-header">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{subjectName}</div>
            <h1 className="text-lg md:text-2xl font-display font-bold text-slate-800 break-words leading-tight">
              {chapterBanglaName} <span className="text-slate-400 font-normal block sm:inline">| {chapterName}</span>
            </h1>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200/60 shadow-xs shrink-0 self-start md:self-auto">
          <span className="text-xs text-slate-500 font-medium">Chapter Mastery:</span>
          <div className="w-20 sm:w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${percentProgress()}%` }}
            />
          </div>
          <span className="text-xs font-bold text-indigo-600">{percentProgress()}%</span>
        </div>
      </div>

      {/* Chapter Official NCTB Metadata */}
      {activeChapterObj && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col md:flex-row items-start gap-4 shadow-2xs" id="chapter-metadata-banner">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg shrink-0 flex flex-col items-center justify-center min-w-[75px] border border-indigo-100/30">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">Official</span>
            <span className="text-xs font-extrabold whitespace-nowrap">{activeChapterObj.chapterNumber || "Chapter"}</span>
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md border border-slate-300/20">
                📚 {activeChapterObj.nctbBookName}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/10">
                Class: {activeChapterObj.class}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md border border-violet-200/10">
                Group: {activeChapterObj.group}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans pt-0.5 break-words">
              {activeChapterObj.shortDescription}
            </p>
          </div>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex border border-slate-250 bg-slate-50 p-1 rounded-xl" id="chapter-tab-bar">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'guide'
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Intelligent Chapter Guide</span>
          <span className="inline sm:hidden">Chapter Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'tutor'
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">AI Co-Pilot Tutor</span>
          <span className="inline sm:hidden">AI Tutor</span>
        </button>
      </div>

      {/* Tab: Intelligent Chapter Guide */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Column 1 & 2 */}
          <div className="lg:col-span-2 space-y-6">
            {apiWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-800 text-xs flex items-start gap-2.5 shadow-xs animate-fade-in">
                <span className="text-base">⚠️</span>
                <div>
                  <p className="font-bold">Offline Study Guide Active</p>
                  <p className="text-amber-700 mt-0.5">{apiWarning}</p>
                </div>
              </div>
            )}

            {loadingGuide ? (
              <div className="bg-white rounded-xl border border-slate-200/60 p-12 text-center shadow-sm space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-slate-700 font-semibold font-display">Pilot AI is Plotting Chapter Metrics...</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Parsing past NCTB Board Exams, estimated timings, resource rankings, and mapping a step-by-step master flight strategy.
                </p>
              </div>
            ) : guideData ? (
              <>
                {/* Introduction & Details */}
                <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 text-indigo-600 font-display font-bold">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Chapter Overview
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{guideData.introduction}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Why It Matters</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">{guideData.whyItMatters}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Real-Life Applications</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">{guideData.realLifeApplications}</p>
                    </div>
                  </div>
                </div>

                {/* Exam Priority & Prerequisites */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exam Priority */}
                  <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-rose-500 font-semibold font-display text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Exam Importance Priority
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        guideData.examImportance.priority === 'high'
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : guideData.examImportance.priority === 'medium'
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {guideData.examImportance.priority} Priority
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{guideData.examImportance.reason}</p>
                  </div>

                  {/* Prerequisites */}
                  <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-violet-500 font-semibold font-display text-sm">
                      <BookOpen className="w-4 h-4" />
                      Prerequisite Knowledge
                    </div>
                    <ul className="space-y-1.5">
                      {guideData.prerequisites.map((pre, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-violet-400 mt-0.5">•</span>
                          {pre}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="bg-white rounded-xl border border-rose-100 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold font-display text-sm">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    Board Exam Pitfalls (Common Mistakes)
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guideData.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="bg-rose-50/50 p-2.5 rounded-lg text-xs text-slate-600 border border-rose-100/50 flex items-start gap-2">
                        <span className="text-rose-500 font-bold">⚠️</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Study Strategy */}
                <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">AI Directed Flight Plan</h3>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {guideData.studyStrategySteps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 relative">
                        <div className="w-6.5 h-6.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-700">{step.step}</h4>
                          <p className="text-slate-500 text-xs mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource Finder */}
                <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">AI Recommended Resource Finder</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guideData.recommendedResources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-start gap-3 transition-all cursor-pointer group"
                      >
                        <div className={`p-2.5 rounded-lg ${
                          res.type === 'video' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                          {res.type === 'video' ? <Play className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/60 px-1.5 py-0.5 rounded border border-indigo-100/40">
                              {res.qualityRating}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {res.source}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                            {res.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            Click to open external link <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">
                Failed to assemble guide. Ask your AI Tutor directly by switching tabs above!
              </div>
            )}
          </div>

          {/* Checklist Sidebar - Column 3 */}
          <div className="space-y-6">
            {/* Learning Checklist */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">Mastery Checklist</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-150">
                  {percentProgress()}% Done
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Check off items as you complete them to update your subject dashboard progress.
              </p>
              <div className="space-y-3">
                {[
                  { key: "readTextbook", label: "Read standard textbook" },
                  { key: "watchedLectures", label: "Watch lecture videos" },
                  { key: "solvedExercises", label: "Solve end-of-chapter exercises" },
                  { key: "solvedBoardQuestions", label: "Practice past board questions" },
                  { key: "madeNotes", label: "Create formula/concept notes" },
                  { key: "revisionCompleted", label: "Complete revision session" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleChecklistToggle(item.key as keyof ChapterProgress)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer group ${
                      chapterProgress[item.key as keyof ChapterProgress]
                        ? "bg-indigo-50/30 border-indigo-100 text-slate-700"
                        : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-indigo-300"
                    }`}
                  >
                    <span className="text-xs font-medium">{item.label}</span>
                    <CheckCircle className={`w-4 h-4 transition-colors ${
                      chapterProgress[item.key as keyof ChapterProgress]
                        ? "text-indigo-500 fill-indigo-100"
                        : "text-slate-300 group-hover:text-indigo-400"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Study Time */}
            {guideData && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Estimated Timings
                </h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Reading Book</span>
                    <span className="text-xs font-bold text-slate-700">{guideData.estimatedTime.readingTextbook}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Lectures</span>
                    <span className="text-xs font-bold text-slate-700">{guideData.estimatedTime.watchingLectures}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Practice CQs</span>
                    <span className="text-xs font-bold text-slate-700">{guideData.estimatedTime.practice}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Revision</span>
                    <span className="text-xs font-bold text-slate-700">{guideData.estimatedTime.revision}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: AI Co-Pilot Tutor Chat */}
      {activeTab === 'tutor' && (
        <div className="bg-white rounded-xl border border-slate-200/65 shadow-sm flex flex-col md:grid md:grid-cols-4 md:h-[600px] overflow-hidden" id="tutor-split-pane">
          {/* Action Prompts Sidebar */}
          <div className="p-4 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 md:col-span-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Quick Actions
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click a directive to trigger a pre-mapped curriculum lesson or oral testing exercise.
              </p>
              <div className="space-y-2">
                {[
                  { type: "explain_bangla", label: "Explain in Bangla 🇧🇩", desc: "Get details in simple code-switched Bangla" },
                  { type: "explain_12", label: "Explain Like I'm 12 🧒", desc: "Super friendly, simple analogies" },
                  { type: "summarize", label: "Generate Summary 📝", desc: "Definitions & formulas sheet" },
                  { type: "examples", label: "Show Formula Examples 🧮", desc: "Step-by-step solved numeric problems" },
                  { type: "viva", label: "Take Oral Viva 🎤", desc: "Interactively test conceptual recall" }
                ].map((action) => (
                  <button
                    key={action.type}
                    onClick={() => triggerQuickPrompt(action.type, action.label)}
                    disabled={sendingMessage}
                    className="w-full p-2.5 text-left bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 transition-all flex flex-col gap-0.5 cursor-pointer disabled:opacity-50 hover:bg-indigo-50/20"
                  >
                    <span className="font-semibold text-indigo-700">{action.label}</span>
                    <span className="text-[10px] text-slate-400">{action.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-400">
              Co-Pilot stores context of active chapter milestones & parameters.
            </div>
          </div>

          {/* Chat Pane */}
          <div className="md:col-span-3 flex flex-col h-[500px] md:h-full bg-white">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Active Study Session: NCTB Assistant</span>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                    msg.sender === 'student'
                      ? "bg-indigo-600 text-white rounded-br-none shadow-xs"
                      : "bg-slate-50 text-slate-800 border border-slate-150 rounded-bl-none shadow-xs"
                  }`}>
                    {msg.sender === 'ai' ? (
                      <div className="whitespace-pre-wrap leading-relaxed prose prose-sm text-slate-700">
                        {/* Custom visual parsing of bullet highlights */}
                        {msg.text.split("\n").map((line, lidx) => {
                          if (line.startsWith("- ") || line.startsWith("* ")) {
                            return <li key={lidx} className="ml-3 my-1 text-slate-700">{line.substring(2)}</li>;
                          }
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return <h4 key={lidx} className="font-bold text-indigo-800 mt-2 mb-1">{line.replace(/\*\*/g, "")}</h4>;
                          }
                          return <p key={lidx} className="my-1.5">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}
                    <span className={`block text-[10px] mt-2 ${
                      msg.sender === 'student' ? 'text-indigo-100 text-right' : 'text-slate-400'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {sendingMessage && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    AI Tutor is drafting academic feedback...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Ask your tutor (e.g. explain chemical bonds in Bangla, or give formula review...)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={sendingMessage}
                className="flex-1 px-4 py-2 bg-slate-50 text-slate-800 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                id="tutor-chat-input"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || sendingMessage}
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                id="tutor-send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
