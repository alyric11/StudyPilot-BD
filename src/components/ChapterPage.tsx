/**
 * STUDYPILOT BD - Interactive Chapter Learning Hub
 * 
 * Purpose:
 * Renders the study canvas for any selected textbook chapter. It combines:
 * 1. Active AI Tutor Chat: Interactive chat box styled in Bangla/English (Banglish) to answer student doubts and explain concepts.
 * 2. Syllabus Checklists: An interactive checklist (textbooks, lectures, notes, CQs) to track active completion.
 */

import React, { useState, useEffect, useRef } from "react";
import { ChapterOverviewData, ChapterProgress, UserProfile } from "../types";
import { BookOpen, AlertTriangle, Play, CheckCircle, Send, Sparkles, Compass, FileText, ChevronRight, MessageSquare, ArrowLeft, ExternalLink, GraduationCap } from "lucide-react";
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
  onBack,
  onWatchVideoLessons,
}: ChapterPageProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'tutor'>('guide');
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

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hi, ${profile.name}! I am your StudyPilot academic assistant for **${subjectName}: ${chapterBanglaName} (${chapterName})**. Ask me anything about this chapter, or click one of the quick study prompts below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle checklist checkbox toggling
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
          classLevel: profile.classLevel,
          history: messages
        })
      });

      if (!res.ok) {
        throw new Error(`Tutor request failed: ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.text || "Lyritalk is temporarily unavailable. Please try again shortly.",
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
          classLevel: profile.classLevel,
          history: messages
        })
      });

      if (!res.ok) {
        throw new Error(`Tutor request failed: ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.text || "Lyritalk is temporarily unavailable. Please try again shortly.",
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
                <span className="text-slate-400 font-normal block sm:inline">
                  {" | "}
                  {chapterName}
                </span>
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

      {/* Primary Navigation Tabs */}
      <div className="flex border border-slate-250 bg-slate-50 p-1 rounded-xl" id="chapter-tab-bar">
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'guide'
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
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'tutor'
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

            {/* Study Plan */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">
                Study Plan
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                  "Read NCTB textbook",
                  "Watch video lectures",
                  "Solve textbook exercises",
                  "Solve board questions",
                  "Test yourself"
                ].map((step, idx) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      if (idx === 1) {
                        onWatchVideoLessons();
                      }
                    }}
                    disabled={idx !== 1}
                    className={`w-full flex items-center gap-4 relative text-left rounded-lg p-1 -m-1 ${idx === 1
                      ? "cursor-pointer hover:bg-slate-50"
                      : "cursor-default"
                      } transition-colors`}
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>

                    <h4 className="text-xs font-bold text-slate-700">
                      {step}
                    </h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Resources */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider mb-4">
                Recommended Resources
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STUDY_RESOURCES.map((resource) => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {resource.logoUrl ? (
                          <img
                            src={resource.logoUrl}
                            alt={`${resource.name} logo`}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <BookOpen className="w-5 h-5 text-indigo-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {resource.name}
                        </h4>

                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                          {resource.description}
                        </p>
                      </div>

                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

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
          <div className="md:col-span-3 flex flex-col min-h-0 h-[500px] md:h-full bg-white">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Active Study Session: NCTB Assistant</span>
            </div>

            {/* Logs */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.sender === 'student'
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
                    <span className={`block text-[10px] mt-2 ${msg.sender === 'student' ? 'text-indigo-100 text-right' : 'text-slate-400'
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
