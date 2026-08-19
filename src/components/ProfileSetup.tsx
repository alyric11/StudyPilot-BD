/**
 * STUDYPILOT BD - Profile Setup and Onboarding Panel
 * 
 * Purpose:
 * Provides an elegant onboarding form for Bangladeshi students to configure their profile.
 * Students can save their Name, Email, School, Grade Level (Classes IX-XII), Study Group (Science, Commerce, Arts),
 * and Board (Dhaka, Chittagong, etc.) so that the educational content adapts precisely to their syllabus.
 */

import React, { useState } from "react";
import { UserProfile } from "../types";
import { NCTB_BOARDS, NCTB_CURRICULUM } from "../data/curriculum";
import { GraduationCap, School, Calendar, MapPin, User, Mail, Phone, ArrowRight, AlertCircle } from "lucide-react";

interface ProfileSetupProps {
  initialProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

export default function ProfileSetup({ initialProfile, onSave }: ProfileSetupProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [school, setSchool] = useState(initialProfile?.school || "");
  const [classLevel, setClassLevel] = useState(initialProfile?.classLevel || "Class 9");
  const [group, setGroup] = useState<any>(initialProfile?.group || "Science");
  const [board, setBoard] = useState(initialProfile?.board || "Dhaka");
  const [examYear, setExamYear] = useState(initialProfile?.examYear || "2027");

  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    school?: string;
    general?: string;
  }>({});

  // Determine valid groups for the selected class
  const classConfig = NCTB_CURRICULUM[classLevel] || { groups: ["None"] };
  const availableGroups = classConfig.groups || ["None"];

  // Handle class level change to auto-adjust group if not available
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = e.target.value;
    setClassLevel(selectedClass);
    const newConfig = NCTB_CURRICULUM[selectedClass];
    if (newConfig && newConfig.groups && !newConfig.groups.includes(group)) {
      setGroup(newConfig.groups[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSchool = school.trim();
    const trimmedPhone = phone.trim();

    // 1. Name validation
    if (!trimmedName) {
      newErrors.name = "Full Name is required.";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    } else if (trimmedName.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters.";
    }

    // 2. Email validation
    if (!trimmedEmail) {
      newErrors.email = "Email Address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = "Please enter a valid email address (e.g. student@domain.com).";
      }
    }

    // 3. School validation
    if (!trimmedSchool) {
      newErrors.school = "School/College Name is required.";
    } else if (trimmedSchool.length < 4) {
      newErrors.school = "Please specify a valid school name (minimum 4 characters).";
    } else if (trimmedSchool.length > 100) {
      newErrors.school = "School name cannot exceed 100 characters.";
    }

    // 4. Phone validation (optional, but if provided, validate pattern)
    if (trimmedPhone) {
      const bdPhoneRegex = /^(?:\+88)?01[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(trimmedPhone)) {
        newErrors.phone = "Enter a valid 11-digit BD mobile number (e.g., 017XXXXXXXX).";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Set a top-level validation error
      setErrors(prev => ({ ...prev, general: "Please correct the highlighted input errors before saving." }));
      return;
    }

    // Reset error state
    setErrors({});

    onSave({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      school: trimmedSchool,
      classLevel,
      group: availableGroups.includes(group) ? group : availableGroups[0],
      board,
      examYear,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(trimmedName)}`
    });
  };

  const triggerGoogleLogin = () => {
    setName("Jesica");
    setEmail("jesica123@gmail.com");
    setSchool("Dhaka City College");
    setBoard("Dhaka");
    setClassLevel("Class 11");
    setGroup("Science");
    setExamYear("2027-28");
    setPhone("01712345678");
    setErrors({});
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden" id="profile-setup-card">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-800 px-6 py-8 text-white text-center">
        <h2 className="text-2xl font-display font-bold tracking-tight">Set Up Your Academic Profile</h2>
        <p className="text-indigo-100 mt-2 text-sm leading-relaxed">
          
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* General Alert */}
        {errors.general && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Quick Social Auth */}
        <div className="border-b border-slate-100 pb-5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fast Account Setup</label>
          <button
            type="button"
            onClick={triggerGoogleLogin}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="google-signin-btn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.67-5.17 3.67-8.45z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.81-2.13-6.76-5H1.32v3.1A11.996 11.996 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.25c-.24-.72-.38-1.5-.38-2.25s.14-1.53.38-2.25V6.65H1.32A11.996 11.996 0 0 0 0 12c0 1.92.45 3.74 1.32 5.35l3.92-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.32 0 3.32 2.69 1.32 6.65l3.92 3.1c.95-2.87 3.61-5 6.76-5z"
              />
            </svg>
            Import Demo Profile (Jesica Jerin)
          </button>
        </div>

        {/* Name and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="name-input">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="name-input"
                type="text"
                placeholder="e.g. Adnan Rahman"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none transition-all text-slate-800 font-medium ${
                  errors.name ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-200" : "border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>
            {errors.name && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="email-input">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="email-input"
                type="text"
                placeholder="e.g. adnan@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none transition-all text-slate-800 font-medium ${
                  errors.email ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-200" : "border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>
            {errors.email && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errors.email}</p>}
          </div>
        </div>

        {/* Phone & School */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="phone-input">Mobile Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="phone-input"
                type="tel"
                placeholder="e.g. 01712345678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none transition-all text-slate-800 font-medium ${
                  errors.phone ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-200" : "border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>
            {errors.phone && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="school-input">School / College Name</label>
            <div className="relative">
              <School className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="school-input"
                type="text"
                placeholder="e.g. Viqarunnisa Noon School"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  if (errors.school) setErrors(prev => ({ ...prev, school: undefined }));
                }}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none transition-all text-slate-800 font-medium ${
                  errors.school ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-200" : "border-slate-200 focus:border-indigo-500"
                }`}
              />
            </div>
            {errors.school && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errors.school}</p>}
          </div>
        </div>

        {/* Class Selection & Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="class-select">NCTB Class Level</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                id="class-select"
                value={classLevel}
                onChange={handleClassChange}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white transition-all text-slate-800 font-medium cursor-pointer"
              >
                {Object.keys(NCTB_CURRICULUM).map((cl) => (
                  <option key={cl} value={cl}>
                    {NCTB_CURRICULUM[cl].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="group-select">Academic Group</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                id="group-select"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                disabled={availableGroups.length === 1 && availableGroups[0] === "None"}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white transition-all text-slate-800 font-medium cursor-pointer disabled:opacity-50"
              >
                {availableGroups.map((grp: string) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Board & Exam Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="board-select">Education Board</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                id="board-select"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white transition-all text-slate-800 font-medium cursor-pointer"
              >
                {NCTB_BOARDS.map((bd) => (
                  <option key={bd} value={bd}>
                    {bd} Board
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="year-input">Exam Year (SSC/HSC)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="year-input"
                type="number"
                placeholder="e.g. 2027"
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-800 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          id="profile-submit-btn"
        >
          Confirm & Access
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
