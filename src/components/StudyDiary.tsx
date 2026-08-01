/**
 * STUDYPILOT BD - Personal Study Diary & Formula Notebook
 * 
 * Purpose:
 * An offline-first study logbook. Students can write down equations, definitions, formulas, or active learning
 * reflections. These entries are categorized (Key Formula, Vocabulary, Study Notes, Reflections) and
 * are fully searchable, acting as a personal reference sheet.
 */

import React, { useState } from "react";
import { DiaryEntry, UserProfile } from "../types";
import { Search, Plus, BookOpen, Trash2, Hash, Tag, Feather, AlertCircle, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface StudyDiaryProps {
  profile: UserProfile;
  subjects: Array<{ id: string; name: string; banglaName: string }>;
  entries: DiaryEntry[];
  onAddEntry: (entry: Omit<DiaryEntry, "id" | "createdAt">) => void;
  onDeleteEntry: (id: string) => void;
}

export default function StudyDiary({
  profile,
  subjects,
  entries,
  onAddEntry,
  onDeleteEntry
}: StudyDiaryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<DiaryEntry["category"]>("notes");
  const [subject, setSubject] = useState(subjects[0]?.name || "General");
  const [chapter, setChapter] = useState("");

  // Validation errors state
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    general?: string;
  }>({});

  // Deletion overlay state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedChapter = chapter.trim();

    if (!trimmedTitle) {
      newErrors.title = "Title is required.";
    } else if (trimmedTitle.length < 3) {
      newErrors.title = "Title must be at least 3 characters long.";
    } else if (trimmedTitle.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters.";
    }

    if (!trimmedContent) {
      newErrors.content = "Content is required.";
    } else if (trimmedContent.length < 5) {
      newErrors.content = "Content must be at least 5 characters long.";
    } else if (trimmedContent.length > 2000) {
      newErrors.content = "Content cannot exceed 2000 characters.";
    }

    // Check for duplicate title within the same subject
    const isDuplicate = entries.some(
      (ent) =>
        ent.subject.toLowerCase() === subject.toLowerCase() &&
        ent.title.toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (isDuplicate) {
      newErrors.general = "A notebook entry with this exact title already exists for this subject.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    onAddEntry({
      title: trimmedTitle,
      content: trimmedContent,
      category,
      subject,
      chapter: trimmedChapter || "General"
    });

    // Reset
    setTitle("");
    setContent("");
    setCategory("notes");
    setChapter("");
    setShowAddForm(false);
  };

  const filteredEntries = entries.filter((ent) => {
    const q = searchTerm.toLowerCase();
    return (
      ent.title.toLowerCase().includes(q) ||
      ent.content.toLowerCase().includes(q) ||
      ent.subject.toLowerCase().includes(q) ||
      ent.chapter.toLowerCase().includes(q) ||
      ent.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md space-y-6" id="study-diary-root">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Feather className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Personal Study Diary</h2>
            <p className="text-slate-400 text-xs">Keep searchable notebooks of formulas, vocabulary, and active reflections.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
          id="toggle-add-diary-btn"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Close Journal" : "Write Entry"}
        </button>
      </div>

      {/* Add Journal Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4 animate-fade-in" id="add-diary-form">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft New Entry</h3>
            {errors.general && (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.general}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="diary-title-input">Title / Highlight</label>
              <input
                id="diary-title-input"
                type="text"
                placeholder="e.g. Einstein's Mass-Energy Equivalence or Acid-Base definitions"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
                }}
                className={`w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 ${
                  errors.title ? "border-rose-300 focus:ring-1 focus:ring-rose-100" : "border-slate-200"
                }`}
              />
              {errors.title && <p className="text-rose-600 text-[9px] mt-1 font-semibold">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="diary-category">Notebook Category</label>
              <select
                id="diary-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="formula">📐 Key Formula</option>
                <option value="vocab">📖 Vocabulary</option>
                <option value="notes">📝 Active Study Notes</option>
                <option value="reflection">💡 Personal Reflection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="diary-subject">Link Subject</label>
              <select
                id="diary-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="General">General (সব)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="diary-content-input">Content / Formula Derivations / Meanings</label>
              <textarea
                id="diary-content-input"
                placeholder="Write formulas, steps, vocabulary definitions, or reflection diaries here..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors(prev => ({ ...prev, content: undefined }));
                }}
                className={`w-full p-2.5 bg-white text-xs text-slate-800 border rounded-lg focus:outline-none focus:border-indigo-500 h-28 resize-none font-medium ${
                  errors.content ? "border-rose-300 focus:ring-1 focus:ring-rose-100" : "border-slate-200"
                }`}
              />
              {errors.content && <p className="text-rose-600 text-[9px] mt-1 font-semibold">{errors.content}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="diary-chapter-input">Focus Chapter (Optional)</label>
              <input
                id="diary-chapter-input"
                type="text"
                placeholder="e.g. States of Matter"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow cursor-pointer"
            >
              Save to Notebook
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

      {/* Search Bar */}
      <div className="relative" id="diary-search-bar">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search formulas, vocab, notes, reflections or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
        />
      </div>

      {/* Journal entries board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="diary-entries-container">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((ent) => (
            <div
              key={ent.id}
              className="p-5 bg-white border border-slate-150 rounded-xl shadow-sm hover:shadow transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Category Pill */}
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    ent.category === 'formula'
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : ent.category === 'vocab'
                      ? "bg-sky-50 text-sky-600 border-sky-100"
                      : ent.category === 'reflection'
                      ? "bg-rose-50 text-rose-600 border-rose-100"
                      : "bg-purple-50 text-purple-600 border-purple-100"
                  }`}>
                    {ent.category === 'formula' ? "📐 Formula" : ent.category === 'vocab' ? "📖 Vocab" : ent.category === 'reflection' ? "💡 Reflection" : "📝 Notes"}
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(ent.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">
                    {ent.title}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                    {ent.content}
                  </p>
                </div>
              </div>

              {/* Tags and Delete */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {ent.subject}
                  </span>
                  {ent.chapter && ent.chapter !== "General" && (
                    <span className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" />
                      {ent.chapter}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setDeleteId(ent.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-all cursor-pointer"
                  id={`delete-diary-${ent.id}`}
                  title="Delete Entry"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5">
            <BookOpen className="w-6 h-6 text-slate-300" />
            No notes or diary entries match your search query. Try logging or drafting a new one above!
          </div>
        )}
      </div>

      {/* Delete Notebook Entry Confirmation Modal */}
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
                <h3 className="text-md font-display font-bold tracking-tight">Delete Diary Entry?</h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Are you sure you want to delete this entry from your Study Diary & Formula Notebook? This action cannot be undone.
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
                    onDeleteEntry(deleteId);
                    setDeleteId(null);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow transition-colors cursor-pointer"
                >
                  Yes, Delete Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
