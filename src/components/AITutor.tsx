import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { UserProfile } from "../types";

interface TutorContext {
  page: string;
  subjectName?: string;
  chapterName?: string;
  chapterBanglaName?: string;
}

interface AITutorProps {
  profile: UserProfile;
  context: TutorContext;
}

interface ChatMessage {
  sender: "student" | "ai";
  text: string;
  timestamp: string;
}

const formatTime = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AITutor({ profile, context }: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendTutorMessage = async (message: string, queryType?: string) => {
    if (!message.trim() || sendingMessage) return;

    const studentMessage: ChatMessage = {
      sender: "student",
      text: message,
      timestamp: formatTime(),
    };

    const previousMessages = messages;
    setMessages((current) => [...current, studentMessage]);
    setSendingMessage(true);

    try {
      const response = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          queryType,
          subject: context.subjectName || context.page,
          chapter: context.chapterName || "General study support",
          classLevel: profile.classLevel,
          history: previousMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tutor request failed: ${response.status}`);
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          sender: "ai",
          text:
            data.text ||
            "I could not prepare a response just now. Please try again.",
          timestamp: formatTime(),
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          sender: "ai",
          text: "I could not connect right now. Please try again in a moment.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const message = userInput.trim();
    if (!message) return;

    setUserInput("");
    await sendTutorMessage(message);
  };

  const contextLabel = context.chapterName
    ? `${context.subjectName || "Subject"} • ${
        context.chapterBanglaName || context.chapterName
      }`
    : context.subjectName || context.page;

  const suggestions = context.chapterName
    ? [
        { label: "Explain this chapter", type: "explain_bangla" },
        { label: "Quiz me", type: "quiz" },
        { label: "Summarize", type: "summarize" },
      ]
    : context.page === "Homework Board"
      ? [
          { label: "Help with homework", type: "homework_help" },
          { label: "Break down a task", type: "study_help" },
          { label: "Explain a concept", type: "general_explain" },
        ]
      : context.page === "Daily Planner"
        ? [
            { label: "Plan my study", type: "study_plan" },
            { label: "Prioritize subjects", type: "study_help" },
            { label: "Make a focus plan", type: "study_help" },
          ]
        : [
            { label: "Explain something", type: "general_explain" },
            { label: "Quiz me", type: "quiz" },
            { label: "Help me study", type: "study_help" },
          ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-indigo-200 bg-white text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 ${
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label="Open StudyPilot AI"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/10 sm:hidden"
            aria-label="Close StudyPilot AI"
          />

          <section
            className="fixed bottom-4 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-[370px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:bottom-6 sm:right-6"
            aria-label="StudyPilot AI"
          >
            <header className="flex items-start justify-between border-b border-slate-100 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-slate-900">
                    StudyPilot AI
                  </h2>
                  <p className="truncate text-xs text-slate-500">
                    {contextLabel}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-3 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close StudyPilot AI"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="px-5 py-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    Hi {profile.name}, what are you studying?
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Ask a question, get an explanation, or practice what you are
                    learning on this page.
                  </p>

                  <div className="mt-5 space-y-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() =>
                          sendTutorMessage(suggestion.label, suggestion.type)
                        }
                        disabled={sendingMessage}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 px-4 py-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.timestamp}-${index}`}
                      className={`flex ${
                        message.sender === "student"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                          message.sender === "student"
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.text}</div>
                        <span
                          className={`mt-1.5 block text-[10px] ${
                            message.sender === "student"
                              ? "text-right text-indigo-100"
                              : "text-slate-400"
                          }`}
                        >
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {sendingMessage && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500">
                        Thinking...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-100 bg-white p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                <textarea
                  value={userInput}
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Ask StudyPilot AI..."
                  rows={1}
                  disabled={sendingMessage}
                  className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!userInput.trim() || sendingMessage}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </>
  );
}
