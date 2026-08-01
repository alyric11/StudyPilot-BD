# StudyPilot BD - NCTB Academic Companion (MVP)

StudyPilot BD is a learning platform and academic companion designed specifically for school and college students in Bangladesh following the **NCTB (National Curriculum and Textbook Board)** syllabus. It supports **Classes IX, X, XI, and XII (SSC & HSC candidates)**.

This Minimum Viable Product (MVP) has been refactored and structured to be simple, clean, and modular—specifically designed for a beginner developer (such as a Class XI student with knowledge of CS50P, HTML, JavaScript, SQL, and basic programming) to understand, maintain, and easily extend.

---

## 📖 Project Overview & Purpose

Many students in Bangladesh struggle to structure their daily self-study routines, track textbook chapter completion, and get access to high-quality interactive tutoring tailored to their specific NCTB textbook content. **StudyPilot BD** solves this by providing:
1. **Curriculum Alignment**: Automatically adapts to the student's Class (Class IX to XII) and Study Group (Science, Business Studies, Humanities).
2. **AI Co-Pilot Personal Tutoring**: An intelligent, bilingual (Bangla & English / Banglish) chatbot that explains formulas, laws, and concepts with friendly analogies and mathematical examples.
3. **Daily Study Planner**: Automatically partitions available daily study hours into customized, step-by-step learning routines mapped to NCTB priorities.
4. **Offline-First Persistence**: Saves all student progress checklists, logged homework, and diary entries directly in the browser's `localStorage` so data is never lost, even with slow or interrupted internet connections.

---

## 🌟 Main Features Currently Implemented

* **Student Profiles & Dynamic Onboarding**: Onboarding form to select the student's name, class (IX, X, XI, XII), and study group (Science, Business Studies, Humanities).
* **NCTB Subject List**: Automatically renders the correct NCTB curriculum subjects based on the chosen class and study group.
* **Chapter Completion Tracker**: Checklists to track textbook reading, lecture video viewing, solved end-of-chapter exercises, board question practice, formula notes, and revisions.
* **Intelligent AI Chapter Guides**: Loads detailed chapter overviews, prerequisites, real-life applications, estimated study timings, board exam pitfalls/common mistakes, and lists recommended external learning resources (e.g. *10 Minute School*, *Shikho*, *Khan Academy Bangla*).
* **AI Personal Tutor Chat**: Interactive co-pilot tutor featuring bilingual prompts ("Explain in Bangla 🇧🇩", "Explain Like I'm 12 🧒", "Summarize Sheet 📝", "Give Solved Examples 🧮", "Take Oral Viva 🎤") or accepts any custom academic question.
* **Intelligent Daily Study Planner**: Distributes available study time (e.g., 2 hours) into tailored focus sessions with realistic timelines and an amber motivation quote.
* **Homework Log Board**: Organizer to record school assignments, priorities (High, Medium, Low), deadlines, focus chapters, and teachers' notes.
* **Searchable Study Notebook & Formula Diary**: Searchable notebook to log formulas, vocabulary definitions, conceptual notes, and reflections.

---

## 🛠️ Technology Stack

This project is built using a modern **Full-Stack JavaScript/TypeScript** Single Page Application (SPA) architecture:

* **Frontend**:
  * **React (v19)**: A popular component-based UI library.
  * **Vite**: A lightning-fast builder and development server.
  * **TypeScript**: Adds type safety to prevent bugs before the code runs.
  * **Tailwind CSS (v4)**: Utility classes for fully responsive, modern design.
  * **Lucide React**: Clean vector iconography for UI indicators.
  * **Motion**: Smooth entrance and layout animations.
* **Backend**:
  * **Node.js & Express**: Lightweight server that serves frontend assets and API endpoints.
  * **Google GenAI SDK (`@google/genai` v2.4.0)**: Safely communicates server-side with the Google Gemini 3.5-flash AI model to power the study guide, planner, and chat tutor.

---

## 📂 Complete Folder Structure

```text
├── .env.example              # Sample configuration for environment keys.
├── .gitignore                # Lists files/folders ignored by git (like node_modules/).
├── assets/                   # Static media, icons, and illustrations.
├── index.html                # HTML mount point where React injects components.
├── metadata.json             # Applet metadata (name, permissions, capabilities).
├── package.json              # List of dependencies (libraries) and shell scripts.
├── server.ts                 # Full Express backend entry point (serves APIs & mounts Vite).
├── tsconfig.json             # Configuration settings for the TypeScript compiler.
├── vite.config.ts            # Configuration settings for Vite and Tailwind.
├── src/                      # Source directory containing all frontend code.
│   ├── main.tsx              # React mounting script. Binds App.tsx to index.html.
│   ├── App.tsx               # Main coordinator holding global application states.
│   ├── index.css             # Global styling sheet (imports Tailwind, custom fonts).
│   ├── types.ts              # Global TypeScript interfaces.
│   ├── data/                 # Static datasets.
│   │   └── curriculum.ts     # Reference NCTB syllabus mapping for Classes IX-XII.
│   └── components/           # Reusable user-interface components:
│       ├── ProfileSetup.tsx       # Onboarding form to capture student properties.
│       ├── ChapterPage.tsx        # Chapter learning center, guide tracker, and chat tutor.
│       ├── StudyPlanner.tsx       # Daily hours-based study routine generator.
│       ├── HomeworkManager.tsx    # Daily homework and priority task log.
│       └── StudyDiary.tsx         # Searchable study diary, formula sheet, and vocabulary notebook.
```

---

## 🔄 Lifecycle: How the App Works

```text
+--------------------------------------------------------------------------+
|                                1. STARTUP                                |
|  - Developer runs "npm run dev".                                         |
|  - server.ts initializes Express on port 3000.                           |
|  - Vite middleware runs to compile and host React frontend files in dev. |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                                2. MOUNTING                               |
|  - Browser goes to http://localhost:3000.                                |
|  - index.html is loaded, executing src/main.tsx.                         |
|  - React renders App.tsx into the page.                                  |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                            3. STATE INGESTION                            |
|  - App.tsx checks browser's LocalStorage for saved progress & notes.     |
|  - If found, loads them into state. If empty, starts fresh.              |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                            4. PROFILE BARRIER                            |
|  - If no profile exists, shows ProfileSetup.tsx onboarding screen.       |
|  - Saving the profile triggers NCTB subject lists and unlocks dashboard. |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                            5. RUNTIME CYCLE                              |
|  - Student navigates tabs (Dashboard, Planner, Homework, Diary).         |
|  - Checking checklists or adding items updates React state and backs up  |
|    automatically into browser LocalStorage.                              |
|  - AI components send JSON payloads to server.ts, which queries Gemini.  |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                               6. SHUTDOWN                                |
|  - Closing browser retains data inside browser LocalStorage.             |
|  - Terminating dev terminal (Ctrl+C) stops local server execution.       |
+--------------------------------------------------------------------------+
```

---

## 📈 Data Flow: How Data Moves

Here is how data passes between the frontend, backend, and the Gemini AI API:

```text
[Student Action: Clicks "Explain in Bangla 🇧🇩" on Chemistry chapter]
                       │
                       ▼
[ChapterPage.tsx Component]
                       │ (Fires native JavaScript fetch() POST request to "/api/tutor-chat")
                       ▼
[Express Server (server.ts)]
                       │ (Receives request on /api/tutor-chat with chapter & query details)
                       │ (Checks if GEMINI_API_KEY environment variable is defined)
                       │
                       ├───────► [No Key (Fallback Mode)] ────► Returns clean, static mock guide
                       │                                       answers instantly.
                       ▼
               [Real Key Found (AI Mode)]
                       │ (Initializes GoogleGenAI SDK)
                       │ (Prompts Gemini 3.5-flash to act as an NCTB teacher in Banglish)
                       ▼
               [Gemini 3.5-flash AI]
                       │ (Computes friendly response, structures bullet sheets and formulas)
                       ▼
[ChapterPage.tsx Component]
                       │ (Parses returned JSON text, hides typing animations)
                       ▼
[Browser screen updating & LocalStorage auto-save]
```

---

## 🎛️ State Management Explanation

In React, **State** represents any information that can change over time and affects how components look. This application uses simple, straightforward React Hooks:

1. **State Lifting**: Since multiple tabs need to share and sync the same data (for example, the Dashboard needs to read chapter checklist percentages), all core states are defined at the very top inside `/src/App.tsx`:
   * `profile`: holds student onboarding details.
   * `studentProgress`: holds checklist completions.
   * `homeworks`: holds logged assignments.
   * `diaryEntries`: holds formulas and logs.
2. **Props**: These states are passed down as **Props** (properties) to components (e.g. `<StudyDiary entries={diaryEntries} onAddEntry={handleAddEntry} ... />`).
3. **Browser LocalStorage**: To ensure offline-first safety, any handler (like `handleToggleHomework`) updates the React state to change the UI instantly, and converts the data into a JSON string to back up in `localStorage` in one atomic flow:
   ```typescript
   localStorage.setItem("sp_homeworks", JSON.stringify(updatedHomeworks));
   ```

---

## 💻 Installation & Running Guide (Windows)

Follow these steps to run StudyPilot BD locally on your PC:

### Step 1: Install Node.js
Download and install the **LTS (Long Term Support)** version of Node.js from [https://nodejs.org/](https://nodejs.org/). This provides the Node runtime environment and `npm` package manager. (Requires Node.js version 18 or higher).

### Step 2: Navigate to Project Directory
Open the **Command Prompt (cmd)** or PowerShell, and navigate to the project root:
```cmd
cd C:\path\to\StudyPilot-BD
```

### Step 3: Install Required Packages
Run the following command to download all dependencies into the `node_modules` folder:
```cmd
npm install
```

### Step 4: Add Gemini API Key (Optional but Recommended)
1. Get a free API key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/).
2. Create a file named `.env` in the project root directory.
3. Write your key inside:
   ```env
   GEMINI_API_KEY="AIzaSyYourActualAPIKeyHere"
   ```
*If you skip this step, don't worry! The application detects when a key is missing and automatically loads offline mock responses, allowing you to fully test every feature of the app without any API fees.*

### Step 5: Start the Server
Run the development command:
```cmd
npm run dev
```
Open your web browser and go to: **`http://localhost:3000`**

---

## 🧭 Developer Roadmap (For You to Build!)

Now that the codebase is simplified and robust, here is your personal roadmap of features you can implement next using your knowledge of React, JavaScript, HTML, and SQL!

### 🗺️ Feature 1: Build the Interactive Quiz Section
**Goal**: Add a tab where students can generate and answer Multiple Choice Questions (MCQs), practice Creative Questions (CQs), and write short answers using Gemini.
* **Where to code**:
  1. Create a file called `/src/components/QuizSection.tsx`.
  2. Implement a selection form for Subject and Chapter.
  3. When clicking "Generate Quiz", make a fetch POST request to the existing server route `/api/generate-quiz` (which is already configured in `/server.ts`!).
  4. Parse the returned question array, show MCQs with interactive buttons, and check if the student picked the correct answer.
  5. In `/src/App.tsx`, import your new `QuizSection` component, add a `"quiz"` tab in the sidebar navigation, and render it when selected!

### 🗺️ Feature 2: Connect to a Real NoSQL Cloud Database (Firebase Firestore)
**Goal**: Sync study progress, diary entries, and profiles to Google Firestore so students can log in from other devices without losing their data.
* **Where to code**:
  1. Read the provided **firebase-integration** skill (`/skills/system_skills/firebase-skill/SKILL.md`) to understand firestore schemas and security rules.
  2. Run `set_up_firebase` in the AI Studio UI to provision your database.
  3. Modify `/src/App.tsx`: Replace the `localStorage` loading and saving logic inside `useEffect` with Firebase Firestore `setDoc()` and `getDoc()` calls using the standard Firebase Web SDK.
  4. Ensure you check for authenticated user sessions using Firebase Authentication!

### 🗺️ Feature 3: Embed Video Lectures Directly on the Chapter Page
**Goal**: Allow students to watch animated textbook videos (from YouTube) inside the app instead of clicking external links.
* **Where to code**:
  1. Open `/src/components/ChapterPage.tsx`.
  2. Find where `guideData.recommendedResources` is mapped (around line 380).
  3. Replace the plain `<a>` tags for video links with a responsive HTML `<iframe>` container pointing to YouTube embed codes (e.g., `https://www.youtube.com/embed/VIDEO_ID`), styled with Tailwind.
  4. This allows the video to play cleanly in-app without navigating away!

---

## 🔍 Troubleshooting

* **Error: Port 3000 is already in use**: This means another server process is already running. Open Task Manager, close any running "Node.js JavaScript Runtime" tasks, or restart your PC, and run `npm run dev` again.
* **"npm is not recognized"**: Ensure Node.js was successfully installed. Restart your command terminal so Windows registers the path variables.
* **Changes don't appear in browser**: Hard-refresh your browser tab (Ctrl + F5 on Windows) to clear the cached styles and scripts.

---

## 📚 Technical Glossary

* **Component**: A self-contained visual building block in React (e.g. a button, text input, or a header modal) that manages its own properties and layout.
* **State**: A special React variable that stores data. When state changes, React immediately refreshes the visual output on the page automatically.
* **Props**: Data passed down from a parent React component to a child component, behaving like read-only configuration settings.
* **LocalStorage**: A simple storage database built inside every browser allowing websites to save key-value pairs persistently even after closing the tab.
* **TypeScript**: JavaScript with strict type-declarations, which alerts you immediately if you try to put text inside a variable meant for numbers.
* **Express**: A minimal, light Node.js library used to control incoming website API requests and return structured JSON responses.
