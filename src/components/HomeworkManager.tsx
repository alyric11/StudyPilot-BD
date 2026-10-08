/**
 * STUDYPILOT BD - Personal Homework Task Tracker
 * 
 * Purpose:
 * A local manager for academic assignments. Students can log homework tasks,
 * assign deadlines, specify sub-topics/chapters, toggle priorities (High, Medium, Low),
 * and record custom preparation notes, keeping their self-assessments organized.
 */

import React, { useState } from "react";
import { Homework, UserProfile } from "../types";
import { Plus, Check, Trash2, Calendar, ClipboardList, Tag, AlertCircle, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface HomeworkManagerProps {
  profile: UserProfile;
  subjects: Array<{ id: string; name: string; banglaName: string }>;
  homeworks: Homework[];
  onAddHomework: (hw: Omit<Homework, "id" | "completed">) => void;
  onToggleHomework: (id: string) => void;
  onDeleteHomework: (id: string) => void;
}

export default function HomeworkManager({
  profile,
  subjects,
  homeworks,
  onAddHomework,
  onToggleHomework,
  onDeleteHomework
}: HomeworkManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState(subjects[0]?.name || "");
  const [chapter, setChapter] = useState("");
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>("medium");
  const [notes, setNotes] = useState("");

  // Validation state
  const [errors, setErrors] = useState<{
    subject?: string;
    task?: string;
    deadline?: string;
    general?: string;
  }>({});

  // Deletion overlay state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    const trimmedTask = task.trim();
    const trimmedChapter = chapter.trim();
    const trimmedNotes = notes.trim();

    if (!subject) {
      newErrors.subject = "Please select a valid subject.";
    }

    if (!trimmedTask) {
      newErrors.task = "Task description is required.";
    } else if (trimmedTask.length < 3) {
      newErrors.task = "Task description must be at least 3 characters long.";
    } else if (trimmedTask.length > 200) {
      newErrors.task = "Task description cannot exceed 200 characters.";
    }

    if (!deadline) {
      newErrors.deadline = "Deadline date is required.";
    } else {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.deadline = "Deadline date cannot be in the past.";
      }
    }

    // Check for duplicate assignments
    const isDuplicate = homeworks.some(
      (hw) =>
        hw.subject.toLowerCase() === subject.toLowerCase() &&
        (hw.chapter || "").toLowerCase() === (trimmedChapter || "General").toLowerCase() &&
        hw.task.toLowerCase() === trimmedTask.toLowerCase()
    );

    if (isDuplicate) {
      newErrors.general = "This exact assignment has already been logged on your board.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    onAddHomework({
      subject,
      chapter: trimmedChapter || "General",
      task: trimmedTask,
      deadline,
      priority,
      notes: trimmedNotes || undefined
    });

    // Reset Form
    setChapter("");
    setTask("");
    setDeadline("");
    setPriority("medium");
    setNotes("");
    setShowAddForm(false);
  };

  const sortedHomeworks = [...homeworks].sort((a, b) => {
    if (a.completed === b.completed) {
      // Prioritize high priority first
      const weight = { high: 3, medium: 2, low: 1 };
      return weight[b.priority] - weight[a.priority];
    }
    return a.completed ? 1 : -1;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md space-y-6" id="homework-manager-root">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Homework & Task Manager</h2>
            <p className="text-slate-400 text-xs">Organize your syllabus homework deadlines and class assignments.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
          id="toggle-add-hw-btn"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Close Form" : "Log Homework"}
        </button>
      </div>

      {/* Add Homework Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4 animate-fade-in" id="add-homework-form">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Log Assignment</h3>
            {errors.general && (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.general}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="hw-subject-select">Subject</label>
              <select
                id="hw-subject-select"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors(prev => ({ ...prev, subject: undefined }));
                }}
                className={`w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer ${
                  errors.subject ? "border-rose-300" : "border-slate-200"
                }`}
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.banglaName} ({sub.name})
                  </option>
                ))}
              </select>
              {errors.subject && <p className="text-rose-600 text-[9px] mt-1 font-semibold">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="hw-chapter-input">Focus Chapter</label>
              <input
                id="hw-chapter-input"
                type="text"
                placeholder="e.g. Chapter 2: Force"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="hw-date-input">Deadline Date</label>
              <div className="relative">
                <input
                  id="hw-date-input"
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    if (errors.deadline) setErrors(prev => ({ ...prev, deadline: undefined }));
                  }}
                  className={`w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer ${
                    errors.deadline ? "border-rose-300 font-bold" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.deadline && <p className="text-rose-600 text-[9px] mt-1 font-semibold">{errors.deadline}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="hw-task-input">Task / Assignment Description</label>
              <input
                id="hw-task-input"
                type="text"
                placeholder="e.g. Complete exercise Creative Question (CQ) number 3 and 4 from board syllabus"
                value={task}
                onChange={(e) => {
                  setTask(e.target.value);
                  if (errors.task) setErrors(prev => ({ ...prev, task: undefined }));
                }}
                className={`w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 ${
                  errors.task ? "border-rose-300 focus:ring-1 focus:ring-rose-100" : "border-slate-200"
                }`}
              />
              {errors.task && <p className="text-rose-600 text-[9px] mt-1 font-semibold">{errors.task}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Task Priority</label>
              <div className="flex gap-2">
                {(["high", "medium", "low"] as const).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      priority === p
                        ? p === "high"
                          ? "bg-rose-50 border-rose-300 text-rose-700"
                          : p === "medium"
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="hw-notes-input">Additional Notes / Instructions (Optional)</label>
            <textarea
              id="hw-notes-input"
              placeholder="e.g. Teacher requested clean diagram formulations for Ga-part calculation."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-white text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 h-16 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow cursor-pointer"
            >
              Add to Board
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setErrors({});
              }}
              className="py-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Homework List */}
      <div className="space-y-3" id="homework-list-container">
        {sortedHomeworks.length > 0 ? (
          sortedHomeworks.map((hw) => (
            <div
              key={hw.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                hw.completed
                  ? "bg-slate-50/50 border-slate-100 opacity-60"
                  : hw.priority === 'high'
                  ? "bg-white border-l-4 border-l-rose-500 border-slate-200 shadow-sm"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Complete checkbox */}
                <button
                  onClick={() => onToggleHomework(hw.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${
                    hw.completed
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 hover:border-indigo-500"
                  }`}
                  id={`toggle-hw-checkbox-${hw.id}`}
                  title="Mark Complete"
                >
                  {hw.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                      {hw.subject}
                    </span>
                    {hw.chapter && (
                      <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {hw.chapter}
                      </span>
                    )}
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                      hw.priority === 'high'
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : hw.priority === 'medium'
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                      {hw.priority} priority
                    </span>
                  </div>

                  <h4 className={`text-xs font-semibold text-slate-800 ${hw.completed ? "line-through text-slate-400" : ""}`}>
                    {hw.task}
                  </h4>

                  {hw.notes && (
                    <p className="text-[10px] text-slate-400 italic">
                      Note: {hw.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Deadline & delete */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: <span className="font-bold text-slate-700">{hw.deadline}</span>
                </div>

                <button
                  onClick={() => setDeleteId(hw.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                  id={`delete-hw-${hw.id}`}
                  title="Delete Assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1">
            <ClipboardList className="w-6 h-6 text-slate-300" />
            No active assignments logged. Add your curriculum homework tasks above!
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full border border-slate-150 p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-md font-display font-bold tracking-tight">Delete Assignment?</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Are you sure you want to delete this assignment from your study board? This task progress will be permanently lost.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteHomework(deleteId);
                    setDeleteId(null);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow transition-colors cursor-pointer"
                >
                  Yes, Delete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
