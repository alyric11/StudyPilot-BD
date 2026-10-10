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
import { CLASS_TRIAL_MESSAGE, DEFAULT_ENABLED_CLASS, isClassEnabled, SSC_CLASSES_ENABLED } from '../config/classAvailability';
import { GraduationCap, School, Calendar, MapPin, User, Mail, Phone, ArrowRight, AlertCircle } from "lucide-react";

interface ProfileSetupProps {
  initialProfile: UserProfile | null;
  accountEmail?: string;
  onSave: (profile: UserProfile) => void;
  feedback?: React.ReactNode;
}

export default function ProfileSetup({ initialProfile, accountEmail, onSave, feedback }: ProfileSetupProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [email, setEmail] = useState(accountEmail || initialProfile?.email || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [school, setSchool] = useState(initialProfile?.school || "");
  const [classLevel, setClassLevel] = useState(initialProfile?.classLevel || DEFAULT_ENABLED_CLASS);
  const [group, setGroup] = useState<any>(initialProfile?.group || "Science");
  const [board, setBoard] = useState(initialProfile?.board || "Dhaka");
  const [examYear, setExamYear] = useState(
    initialProfile?.examYear || String(new Date().getFullYear() + 1)
  );

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
    const selectedClass =
      e.target.value as "Class 9" | "Class 10" | "Class 11" | "Class 12";

    setClassLevel(selectedClass);

    const newConfig = NCTB_CURRICULUM[selectedClass];

    if (newConfig && newConfig.groups && !newConfig.groups.includes(group)) {
      setGroup(newConfig.groups[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClassEnabled(classLevel)) { setErrors({ general: CLASS_TRIAL_MESSAGE }); return; }
    const newErrors: typeof errors = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSchool = school.trim();
    const trimmedPhone = phone.trim();

    // 1. Name validation
    if (!trimmedName) {
      newErrors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    } else if (trimmedName.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters.";
    }

    // 2. Email validation
    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = "Please enter a valid email address (e.g. student@domain.com).";
      }
    }

    // 3. School validation
    if (trimmedSchool && trimmedSchool.length < 4) {
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

  return (
    <section className="profile-setup-card" id="profile-setup-card" aria-labelledby="profile-setup-heading">
      <div className="profile-setup-card-heading">
        <h1 id="profile-setup-heading">Your academic profile</h1>
        <p>A few details to make StudyPilot yours.</p>
      </div>
      <form onSubmit={handleSubmit} className="profile-setup-form">
        {/* General Alert */}
        {errors.general && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Name and Contact */}
        <div className="profile-setup-field-row">
          <div>
            <label className="profile-setup-label" htmlFor="name-input">Full name</label>
            <div className="relative">
              <User className="profile-setup-field-icon" />
              <input
                id="name-input"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="profile-setup-field"
              />
            </div>
            {errors.name && <p id="name-error" className="profile-setup-field-error">{errors.name}</p>}
          </div>

          <div>
            <label className="profile-setup-label" htmlFor="email-input">Email address</label>
            <div className="relative">
              <Mail className="profile-setup-field-icon" />
              <input
                id="email-input"
                readOnly={!!accountEmail}
                autoComplete="email"
                type="text"
                placeholder="Your verified email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="profile-setup-field"
              />
            </div>
            {errors.email && <p id="email-error" className="profile-setup-field-error">{errors.email}</p>}
          </div>
        </div>

        {/* Phone & School */}
        <div className="profile-setup-field-row">
          <div>
            <label className="profile-setup-label" htmlFor="phone-input">Mobile number (optional)</label>
            <div className="relative">
              <Phone className="profile-setup-field-icon" />
              <input
                id="phone-input"
                type="tel"
                autoComplete="tel"
                placeholder="Your mobile number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className="profile-setup-field"
              />
            </div>
            {errors.phone && <p id="phone-error" className="profile-setup-field-error">{errors.phone}</p>}
          </div>

          <div>
            <label className="profile-setup-label" htmlFor="school-input">School / college (optional)</label>
            <div className="relative">
              <School className="profile-setup-field-icon" />
              <input
                id="school-input"
                type="text"
                autoComplete="organization"
                placeholder="School / college name"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  if (errors.school) setErrors(prev => ({ ...prev, school: undefined }));
                }}
                aria-invalid={!!errors.school}
                aria-describedby={errors.school ? "school-error" : undefined}
                className="profile-setup-field"
              />
            </div>
            {errors.school && <p id="school-error" className="profile-setup-field-error">{errors.school}</p>}
          </div>
        </div>

        {/* Class Selection & Group */}
        <div className="profile-setup-field-row">
          <div>
            <label className="profile-setup-label" htmlFor="class-select">Class level</label>
            <div className="relative">
              <GraduationCap className="profile-setup-field-icon" />
              <select
                id="class-select"
                value={classLevel}
                onChange={(e) => {
                  handleClassChange(e);
                }}
                className="profile-setup-field"
              >
                {Object.keys(NCTB_CURRICULUM).map((cl) => (
                  <option key={cl} value={cl} disabled={!isClassEnabled(cl)}>
                    {NCTB_CURRICULUM[cl].name}{!isClassEnabled(cl) ? ' — Temporarily unavailable' : ''}
                  </option>
                ))}
              </select>
            </div>
            {!SSC_CLASSES_ENABLED && <p className="mt-2 text-xs leading-relaxed text-slate-500">The current trial is for Classes 11–12.</p>}
          </div>

          <div>
            <label className="profile-setup-label" htmlFor="group-select">Academic group</label>
            <div className="relative">
              <User className="profile-setup-field-icon" />
              <select
                id="group-select"
                value={group}
                onChange={(e) => {
                  setGroup(e.target.value);
                }}
                disabled={availableGroups.length === 1 && availableGroups[0] === "None"}
                className="profile-setup-field"
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
        <div className="profile-setup-field-row">
          <div>
            <label className="profile-setup-label" htmlFor="board-select">Education board</label>
            <div className="relative">
              <MapPin className="profile-setup-field-icon" />
              <select
                id="board-select"
                value={board}
                onChange={(e) => {
                  setBoard(e.target.value);
                }}
                className="profile-setup-field"
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
            <label className="profile-setup-label" htmlFor="year-input">Exam year (SSC/HSC)</label>
            <div className="relative">
              <Calendar className="profile-setup-field-icon" />
              <input
                id="year-input"
                type="number"
                placeholder="2027"
                value={examYear}
                onChange={(e) => {
                  setExamYear(e.target.value);
                }}
                className="profile-setup-field"
                required
              />
            </div>
          </div>
        </div>

        {feedback && <div className="profile-setup-feedback">{feedback}</div>}

        {/* Submit */}
        <button
          type="submit"
          className="profile-setup-submit"
          id="profile-submit-btn"
        >
          Start studying
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </section>
  );
}
