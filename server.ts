/**
 * STUDYPILOT BD - Express + Vite Backend Server
 * 
 * Purpose:
 * This is the full-stack server backend. It serves three critical functions:
 * 1. Hosts smart AI-driven APIs integrating Google Gemini (using the modern @google/genai SDK).
 * 2. Implements beautiful cached fallback datasets if no API key is available, ensuring a bulletproof user experience.
 * 3. Integrates with Vite as a middleware for Hot-Reload development and serves compiled production files.
 * 
 * Key Endpoints:
 * - POST /api/generate-chapter-guide: Generates a structured study guide for NCTB textbook chapters.
 * - POST /api/tutor-chat: Serves as a customized personal educational tutor.
 * - POST /api/generate-quiz: Formulates multiple-choice (MCQs), Srijonshil (Creative CQs), and short questions.
 * - POST /api/generate-study-plan: Crafts customized hourly daily learning paths.
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI SDK to avoid crashing if API key is not set.
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function hasRealAPIKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key !== "MY_GEMINI_API_KEY" && key.trim().length > 0;
}

// Fallback Mock data for Chapter Page Guide
const fallbackChapterGuides: Record<string, any> = {
  default: {
    introduction: "This chapter covers core fundamentals of the curriculum, designed to establish a solid ground in logical thinking, scientific inquiry, or linguistic depth.",
    whyItMatters: "Understanding this chapter builds essential concepts that are heavily tested in school and board exams (SSC/HSC), enabling critical application in advanced chapters.",
    realLifeApplications: "Used in everyday problem solving, technical automation, commercial logic, or professional content development.",
    examImportance: {
      priority: "high",
      reason: "This chapter accounts for approximately 15-20% of marks in creative questions (CQ) and multiple-choice questions (MCQ) in previous years' board examinations."
    },
    learningObjectives: [
      "Explain the fundamental definitions, principles, and theories.",
      "Apply formulas and logical rules to solve exercise problems.",
      "Identify common misconceptions and correct them in exam writing.",
      "Draw accurate flowcharts, diagrams, or outline structures as required."
    ],
    prerequisites: [
      "Basic algebraic equations and standard operations",
      "Terminology introduced in earlier standard classes"
    ],
    commonMistakes: [
      "Mixing up formulas or applying wrong units",
      "Overlooking contextual conditions in problem stems",
      "Skipping steps in CQ (Creative Question) step-by-step layout (Gha/Umo parts)"
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
        title: "Free Animated Chapter Walkthrough - Shikho",
        source: "Shikho Bangla",
        url: "https://shikho.com",
        type: "video",
        qualityRating: "Featured"
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
  }
};

// Fallback Mock Quiz Generator
const generateFallbackQuiz = (subject: string, chapter: string, difficulty: string): any => {
  return {
    id: `quiz_${Date.now()}`,
    subject,
    chapter,
    title: `NCTB ${subject} - ${chapter} Mock Assessment`,
    difficulty,
    questions: [
      {
        id: "q1",
        type: "mcq",
        questionText: `Which of the following is considered a primary core concept of ${subject} (${chapter}) under the NCTB curriculum?`,
        options: [
          "Fundamental principles and physical definitions",
          "Secondary non-reactive elements",
          "Advanced speculative modeling",
          "None of the listed items"
        ],
        correctAnswer: "A",
        explanation: "The NCTB syllabus prioritizes foundational definitions and core analytical methods as primary evaluation metrics."
      },
      {
        id: "q2",
        type: "mcq",
        questionText: "What is a very common student mistake when solving creative questions in this specific topic?",
        options: [
          "Using improper units (SI system deviations)",
          "Writing too fast and neatly",
          "Referencing the official NCTB textbook",
          "Solving multiple choices with calculations"
        ],
        correctAnswer: "A",
        explanation: "NCTB board examiners emphasize proper SI units in calculation steps. Skipping unit parameters often results in point deductions."
      },
      {
        id: "q3",
        type: "cq",
        questionText: `Creative Question (CQ) Stem: Rafiq is conducting an experiment on ${subject} in his high school laboratory. He notes a change in variables when standard temperature and pressure are maintained.`,
        explanation: "This tests deep comprehension and analytical capability across standard boards.",
        questionParts: [
          { part: "a", marks: 1, question: "Define the primary term of this phenomenon." },
          { part: "b", marks: 2, question: "Explain the difference between standard conditions and lab environments." },
          { part: "c", marks: 3, question: "Calculate the value based on Rafiq's noted parameters using standard formulas." },
          { part: "d", marks: 4, question: "Evaluate the experimental consistency if temperature is increased by 10%." }
        ]
      },
      {
        id: "q4",
        type: "short",
        questionText: `Explain in brief the main differences between NCTB board requirements and standard competitive exercises for ${subject}.`,
        explanation: "Short questions test precise conceptual boundaries.",
        sampleAnswer: "NCTB boards focus on clear theoretical derivations and textbook exercises, whereas competitive exams often integrate multi-concept numerical problems."
      }
    ]
  };
};

// Fallback Mock Study Planner
const generateFallbackPlan = (minutes: number, subjects: string[]): any => {
  const planList = [];
  const validSubjects = subjects.length > 0 ? subjects : ["Physics", "Chemistry", "Mathematics"];
  const count = validSubjects.length;
  const chunk = Math.floor((minutes * 0.8) / count);
  const revTime = minutes - (chunk * count);

  validSubjects.forEach((sub, idx) => {
    planList.push({
      timeInMinutes: chunk,
      subject: sub,
      chapter: "Active Chapter",
      activity: idx % 2 === 0 ? "Read textbook pages, take key concept notes" : "Watch video lectures & solve exercise CQs"
    });
  });

  if (revTime > 0) {
    planList.push({
      timeInMinutes: revTime,
      subject: validSubjects[0],
      chapter: "Revision Block",
      activity: "Review saved formulae & check common mistakes checklist"
    });
  }

  return {
    totalMinutes: minutes,
    plan: planList,
    motivationQuote: "অধ্যবসায়ই সাফল্যের চাবিকাঠি। Study steadily, companion! One small step each day makes the flight seamless."
  };
};

// API: Generate Chapter Study Guide
app.post("/api/generate-chapter-guide", async (req, res) => {
  const { subject, chapter, classLevel, group } = req.body;

  if (!subject || !chapter) {
    return res.status(400).json({ error: "Subject and chapter are required parameters." });
  }

  if (!hasRealAPIKey()) {
    console.log("Using cached fallback guide for", subject, chapter);
    const mockGuide = { ...fallbackChapterGuides.default };
    mockGuide.introduction = `Welcome to your customized StudyPilot guide for ${subject}, Chapter: ${chapter} (Class ${classLevel || "9-10"}). This page is loaded with NCTB curriculum specifics.`;
    return res.json(mockGuide);
  }

  try {
    const ai = getAI();
    const prompt = `Generate a comprehensive NCTB-aligned study page for Class ${classLevel || "9-10"}, Subject: ${subject}, Chapter: ${chapter}.
    Group: ${group || "Science"}.
    Ensure the data is structured to help a Bangladeshi student prepare for school & Board Exams (SSC/HSC).
    Be realistic, name actual YouTube channels or resources like '10 Minute School', 'Shikho', 'Khan Academy Bangla', 'Onnorokom Web School', and provide genuine links or educational website structures where possible.
    Respond strictly in JSON matching the specified schema format. Keep explanations very practical, using a friendly, highly professional tone. You can use some standard Bangla terms (using English alphabet or Bangla script where suitable) e.g., 'Creative Question (CQ)', 'Srijonshil (সৃজনশীল)'.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introduction: { type: Type.STRING, description: "A highly specific, friendly overview introduction of the chapter." },
            whyItMatters: { type: Type.STRING, description: "Brief explanation of why this is important to study." },
            realLifeApplications: { type: Type.STRING, description: "Real-life examples of how this is applied in Bangladesh or worldwide." },
            examImportance: {
              type: Type.OBJECT,
              properties: {
                priority: { type: Type.STRING, description: "high, medium, or low" },
                reason: { type: Type.STRING, description: "Reason why board exams focus on this, percentage weight, typical number of CQs/MCQs." }
              },
              required: ["priority", "reason"]
            },
            learningObjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "What the student will learn (3-5 objectives)."
            },
            prerequisites: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Prior knowledge or textbook chapters needed."
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific mistakes Bangladeshi students make in SSC/HSC board papers (e.g., unit errors, formula mix-ups)."
            },
            estimatedTime: {
              type: Type.OBJECT,
              properties: {
                readingTextbook: { type: Type.STRING, description: "e.g., 45 minutes" },
                watchingLectures: { type: Type.STRING, description: "e.g., 70 minutes" },
                practice: { type: Type.STRING, description: "e.g., 2 hours" },
                revision: { type: Type.STRING, description: "e.g., 40 minutes" }
              },
              required: ["readingTextbook", "watchingLectures", "practice", "revision"]
            },
            studyStrategySteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["step", "description"]
              },
              description: "5 step strategy from textbook reading to past board papers and quiz."
            },
            recommendedResources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  source: { type: Type.STRING, description: "e.g., 10 Minute School, Shikho, YouTube, Khan Academy Bangla" },
                  url: { type: Type.STRING },
                  type: { type: Type.STRING, description: "video, pdf, simulation, or textbook" },
                  qualityRating: { type: Type.STRING, description: "Highly Recommended, Featured, official" }
                },
                required: ["title", "source", "url", "type", "qualityRating"]
              }
            }
          },
          required: [
            "introduction",
            "whyItMatters",
            "realLifeApplications",
            "examImportance",
            "learningObjectives",
            "prerequisites",
            "commonMistakes",
            "estimatedTime",
            "studyStrategySteps",
            "recommendedResources"
          ]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API guide error:", error);
    res.status(500).json({ error: "Failed to generate chapter study guide", details: error.message });
  }
});

// API: Tutor Chat Endpoint
app.post("/api/tutor-chat", async (req, res) => {
  const { message, history, subject, chapter, classLevel, queryType } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Pre-configured templates based on quick actions
  let augmentedMessage = message;
  if (queryType === "explain_bangla") {
    augmentedMessage = `Explain the core concepts of this chapter (${chapter}) in friendly Bangla (or banglish code-switching). Include easy real-world examples.`;
  } else if (queryType === "explain_12") {
    augmentedMessage = `Explain the main concepts of ${subject} chapter ${chapter} like I am 12 years old. Keep it fun and use simple terms.`;
  } else if (queryType === "summarize") {
    augmentedMessage = `Provide a crisp, bulleted summary of ${subject} chapter ${chapter}. List key definitions, standard equations/formulas, and core laws.`;
  } else if (queryType === "examples") {
    augmentedMessage = `Give me 3 realistic mathematical or contextual examples of how topics in ${subject} - ${chapter} are solved, with step-by-step layout.`;
  } else if (queryType === "viva") {
    augmentedMessage = `Act as an NCTB high school teacher. Ask me 1 quick conceptual question (viva/oral quiz style) from this chapter (${chapter}). Wait for my response before asking another.`;
  }

  if (!hasRealAPIKey()) {
    console.log("Mocking tutor response for", subject, chapter);
    let mockResponse = `I am StudyPilot AI, your personal academic tutor for NCTB ${subject} (${chapter}).\n\n`;

    if (queryType === "explain_bangla" || message.toLowerCase().includes("bangla")) {
      mockResponse += `**সহজ বাংলা ব্যাখ্যা (Simplified Explanation):**\n` +
        `১. এই অধ্যায়টি মূলত আমাদের দৈনিক জীবনের অনেকগুলো গুরুত্বপূর্ণ সূত্র নিয়ে আলোচনা করে।\n` +
        `২. বোর্ড পরীক্ষার জন্য এই টপিকটি অনেক গুরুত্বপূর্ণ। বিশেষ করে সৃজনশীল প্রশ্ন (CQ)-এর 'গ' ও 'ঘ' নম্বর প্রশ্নে গাণিতিক সমস্যা সমাধান করতে হয়।\n` +
        `৩. সহজে মনে রাখতে পারো: যেকোনো সূত্র মনে রাখার জন্য কাগজে লিখে পড়ার টেবিলের সামনে ঝুলিয়ে রাখবে।\n\n` +
        `তুমি কি এই অধ্যায়ের কোনো নির্দিষ্ট সূত্র বা সৃজনশীল সমস্যার সমাধান দেখতে চাও? আমাকে জিজ্ঞেস করো!`;
    } else if (queryType === "explain_12") {
      mockResponse += `Imagine you are playing with Lego blocks! Each block represents a tiny piece of data or a single molecule. In ${chapter}, we learn how these pieces fit together to create beautiful houses (or react to produce energy). Just like Lego, if you follow the right steps, everything balances out perfectly!`;
    } else if (queryType === "summarize") {
      mockResponse += `**Quick Summary Sheet:**\n` +
        `- **Core Theme**: High priority board examination concepts.\n` +
        `- **Formula 1**: Standard equilibrium parameters.\n` +
        `- **Law to Remember**: Conservation of energy and mass rules.\n` +
        `- **Exam Alert**: Look out for unit conversion pitfalls (e.g., converting Celsius to Kelvin or cm to meters).`;
    } else if (queryType === "viva") {
      mockResponse += `*Teacher Voice:* Assalamu Alaikum! Let's check your concepts. \n\n**Question:** Can you tell me what the SI unit for this phenomenon is, and what happens if we double the force/concentration? Respond below, and I'll evaluate your answer!`;
    } else if (queryType === "examples") {
      mockResponse += `**Step-by-Step Numerical Example:**\n` +
        `**Given:** Mass (m) = 5kg, Acceleration (a) = 2 m/s².\n` +
        `**Formula:** Force (F) = m * a\n` +
        `**Calculation:** F = 5 * 2 = 10 Newtons (N).\n` +
        `*Exam Tip:* Never forget to write the unit 'N' or 'Newtons'. You will lose 0.5 marks if the unit is absent!`;
    } else {
      mockResponse += `I've received your query: "${message}". Under the Bangladesh NCTB standard, this involves understanding the core parameters in your board textbook. Try reading Section 3.2 first and remember to practice past board questions!\n\nWould you like me to generate some sample creative questions (CQ) or multiple-choice questions (MCQ)?`;
    }

    return res.json({ text: mockResponse });
  }

  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are StudyPilot AI, an elite academic personal tutor and educational coach for Bangladeshi school & college students following the NCTB curriculum (Classes IX-XII, SSC, and HSC).
        - Your main goal is to help students learn their textbook chapters inside out, understand theories deeply, and excel in board exams.
        - You communicate in an encouraging, highly knowledgeable, and warm tone.
        - Use clean, simple language. You can blend Bangla and English (code-switch) naturally (commonly known as "Banglish") to make explanations extremely accessible, or write in proper Bangla or English when requested.
        - Reference actual NCTB syllabus criteria, board exams (Dhaka Board, Chittagong Board, etc.), Creative Question structures (Srijonshil: Ka, Kha, Ga, Gha), and MCQ guidelines.
        - Maintain progress context of the student. Be highly encouraging and provide clear formatting with bullet points and bold headers.`
      }
    });

    // Seed chat history if provided
    if (history && history.length > 0) {
      // Direct message sending is simplest with a clean prompt context
    }

    const contextPrompt = `[Student Profile: Class ${classLevel || "9-10"}, Subject: ${subject}, Chapter: ${chapter}]
    Student Question: ${augmentedMessage}`;

    const result = await chat.sendMessage({ message: contextPrompt });
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Gemini API chat error:", error);
    res.status(500).json({ error: "Failed to generate tutor response", details: error.message });
  }
});

// API: Generate Customized Quizzes
app.post("/api/generate-quiz", async (req, res) => {
  const { subject, chapter, difficulty, classLevel } = req.body;

  if (!subject || !chapter) {
    return res.status(400).json({ error: "Subject and chapter are required parameters." });
  }

  if (!hasRealAPIKey()) {
    console.log("Mocking quiz for", subject, chapter);
    const mockQuiz = generateFallbackQuiz(subject, chapter, difficulty || "medium");
    return res.json(mockQuiz);
  }

  try {
    const ai = getAI();
    const prompt = `Generate an interactive assessment quiz for Class ${classLevel || "9-10"}, Subject: ${subject}, Chapter: ${chapter}.
    Difficulty Level: ${difficulty || "medium"}.
    Under Bangladesh NCTB standards, we need a mix of question types:
    - 2 Multiple Choice Questions (MCQ) (with 4 options: A, B, C, D, correctAnswer, and a helpful explanation).
    - 1 Creative Question (CQ) stem (Srijonshil) containing the main contextual paragraph (stem) and 4 subsequent parts: a (Knowledge - 1 mark), b (Comprehension - 2 marks), c (Application - 3 marks), d (Higher Order - 4 marks), with detailed marking logic or sample guides in explanation.
    - 1 Short Answer Question with sampleAnswer and explanation.
    Provide the output strictly in JSON matching the specified schema structure. All text should be written in clean, engaging academic language, mixing English and Bangla terms naturally where appropriate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            subject: { type: Type.STRING },
            chapter: { type: Type.STRING },
            title: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: "mcq, cq, or short" },
                  questionText: { type: Type.STRING, description: "The question prompt or stem. For CQ, this is the main story scenario." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options, only for MCQ questions."
                  },
                  correctAnswer: { type: Type.STRING, description: "For MCQ, must be one of the option letters e.g. A, B, C, or D." },
                  explanation: { type: Type.STRING, description: "Explanation of why this answer is correct or how creative parts are graded." },
                  questionParts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        part: { type: Type.STRING, description: "a, b, c, or d" },
                        marks: { type: Type.INTEGER },
                        question: { type: Type.STRING }
                      },
                      required: ["part", "marks", "question"]
                    },
                    description: "For CQ questions, contains sub-questions a, b, c, d."
                  },
                  sampleAnswer: { type: Type.STRING, description: "For Short answer or CQ parts, the model reference answer." }
                },
                required: ["id", "type", "questionText", "explanation"]
              }
            }
          },
          required: ["id", "subject", "chapter", "title", "difficulty", "questions"]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API quiz error:", error);
    res.status(500).json({ error: "Failed to generate dynamic quiz", details: error.message });
  }
});

// API: Daily Study Planner
app.post("/api/generate-study-plan", async (req, res) => {
  const { hours, subjects, classLevel, group } = req.body;

  const minutes = hours ? Math.round(parseFloat(hours) * 60) : 120;
  const subjectsToStudy = (subjects && subjects.length > 0) ? subjects : ["Physics", "Chemistry", "Mathematics"];

  if (!hasRealAPIKey()) {
    console.log("Mocking study plan for", minutes, "minutes");
    const mockPlan = generateFallbackPlan(minutes, subjectsToStudy);
    return res.json(mockPlan);
  }

  try {
    const ai = getAI();
    const prompt = `Create a smart, hyper-personalized daily study plan for a Bangladeshi NCTB student.
    Class: ${classLevel || "9-10"}, Group: ${group || "Science"}.
    Total Study Time available today: ${minutes} minutes.
    Subjects requested to prioritize today: ${subjectsToStudy.join(", ")}.
    Break this study block down into 3-5 realistic increments (e.g., 30-45 mins per subject), matching NCTB study patterns. Include reading textbooks, notes creation, solving exercise questions, and a 15-minute revision block at the end.
    Also generate a warm, encouraging quote in Bangla and English to motivate the student.
    Provide the output strictly in JSON according to the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalMinutes: { type: Type.INTEGER },
            plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeInMinutes: { type: Type.INTEGER, description: "Time allocated for this block (e.g. 30, 45)." },
                  subject: { type: Type.STRING },
                  chapter: { type: Type.STRING, description: "Focus chapter name, e.g., Newton's Laws, Organic Chemistry, or Active Chapter." },
                  activity: { type: Type.STRING, description: "Specific learning activity e.g., Read section 4.2 of book, solve 10 MCQs, revise notes." }
                },
                required: ["timeInMinutes", "subject", "chapter", "activity"]
              }
            },
            motivationQuote: { type: Type.STRING, description: "An encouraging quote mixing Bangla and English." }
          },
          required: ["totalMinutes", "plan", "motivationQuote"]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API planner error:", error);
    res.status(500).json({ error: "Failed to generate personalized study plan", details: error.message });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
