/**
 * STUDYPILOT BD - National Curriculum and Textbook Board (NCTB) Reference Dataset
 * 
 * Purpose:
 * This file contains the complete curriculum maps for Classes IX to XII (Class 9 to Class 12).
 * It indexes Bangla name representations, specific academic study groups (Science, Business, Humanities),
 * and individual textbook chapters mapped directly to the official Bangladesh NCTB syllabus.
 * It also defines the official NCTB Education Boards (Dhaka, Chittagong, Rajshahi, etc.).
 */

import { class9Subjects } from "./class9";
import { class10Subjects } from "./class10";
import { class11Subjects } from "./class11";
import { class12Subjects } from "./class12";

export interface Chapter {
  id: string;
  chapterNumber: string;       // e.g. "Chapter 1", "১ম অধ্যায়"
  name: string;                // English Title
  banglaName: string;          // Bangla Title
  shortDescription: string;    // Brief summary of chapters
  class: string;               // Class level
  group: string;               // Stream group
  subject: string;             // Subject name
  nctbBookName: string;        // Official Board Book Name
}

export interface Subject {
  id: string;
  name: string;
  banglaName: string;
  chapters: Chapter[];
  color: string; // Tailwind color class for cards/tags
}

export const NCTB_BOARDS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Comilla",
  "Barisal",
  "Sylhet",
  "Jessore",
  "Dinajpur",
  "Mymensingh",
  "Madrasah Board",
  "Technical Board"
];

export const NCTB_CURRICULUM: Record<string, {
  name: string;
  groups?: string[];
  subjects: Record<string, Subject[]>;
}> = {
  "Class 9": {
    name: "Class 9",
    groups: ["Science", "Business Studies", "Humanities", "None"],
    subjects: {
      "Science": class9Subjects("Science"),
      "Business Studies": class9Subjects("Business Studies"),
      "Humanities": class9Subjects("Humanities"),
      "None": class9Subjects("None")
    }
  },
  "Class 10": {
    name: "Class 10 (SSC Candidate)",
    groups: ["Science", "Business Studies", "Humanities", "None"],
    subjects: {
      "Science": class10Subjects("Science"),
      "Business Studies": class10Subjects("Business Studies"),
      "Humanities": class10Subjects("Humanities"),
      "None": class10Subjects("None")
    }
  },
  "Class 11": {
    name: "Class 11 (HSC First Year)",
    groups: ["Science", "Business Studies", "Humanities", "None"],
    subjects: {
      "Science": class11Subjects("Science"),
      "Business Studies": class11Subjects("Business Studies"),
      "Humanities": class11Subjects("Humanities"),
      "None": class11Subjects("None")
    }
  },
  "Class 12": {
    name: "Class 12 (HSC Candidate)",
    groups: ["Science", "Business Studies", "Humanities", "None"],
    subjects: {
      "Science": class12Subjects("Science"),
      "Business Studies": class12Subjects("Business Studies"),
      "Humanities": class12Subjects("Humanities"),
      "None": class12Subjects("None")
    }
  }
};
