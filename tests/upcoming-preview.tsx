// Fake, memory-only data. No real student records or authentication actions.
import { createRoot } from 'react-dom/client';
import type { User } from 'firebase/auth';
import { AccountContext } from '../src/auth/AccountContext';
import App from '../src/App';
import '../src/index.css';
import { localDateKey } from '../src/utils/routineTasks';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const blocks = [
  { id: 'preview-physics', subjectId: 'physics1', title: 'Physics-1', dayOfWeek: tomorrow.getDay(), startTime: '18:00', endTime: '19:00', color: 'cyan' },
  { id: 'preview-physics-2', subjectId: 'physics1', title: 'Physics-1', dayOfWeek: (tomorrow.getDay() + 2) % 7, startTime: '20:00', endTime: '21:00', color: 'cyan' },
  { id: 'preview-physics-today', subjectId: 'physics1', title: 'Physics-1', dayOfWeek: new Date().getDay(), startTime: '23:59', endTime: '00:30', color: 'cyan' },
  { id: 'preview-chemistry-today', subjectId: 'chemistry1', title: 'Chemistry-1', dayOfWeek: new Date().getDay(), startTime: '23:58', endTime: '00:30', color: 'pink' },
  { id: 'preview-chemistry', subjectId: 'chemistry1', title: 'Chemistry-1', dayOfWeek: tomorrow.getDay(), startTime: '16:00', endTime: '17:00', color: 'pink' },
];
const entries = new Map<string, string>([
  ['sp_profile', JSON.stringify({ name: 'Preview Student', email: 'preview@example.test', school: 'Preview School', classLevel: 'Class 11', group: 'Science', board: 'Dhaka', examYear: '2027' })],
  ['sp_routine', JSON.stringify(blocks)],
  ['sp_daily_routine_tasks', JSON.stringify([
    { date: localDateKey(new Date()), block: { ...blocks[2], chapterId: 'p1_11_ch2', homeworkText: 'Read pages 12–15 and solve questions 1–3' }, subjectKey: 'subject:physics1', subjectName: 'Physics 1st Paper', chapterBanglaName: 'ভেক্টর', paletteColor: 'cyan', completed: false },
    { date: localDateKey(new Date()), block: { ...blocks[3], chapterId: 'c1_11_ch2', homeworkText: 'Review the examples and practise questions 1–3' }, subjectKey: 'subject:chemistry1', subjectName: 'Chemistry 1st Paper', chapterBanglaName: 'গুণগত রসায়ন', paletteColor: 'pink', completed: false },
  ])],
]);
let fail = false;
const storage = {
  getItem: (key: string) => entries.get(key) ?? null,
  setItem: (key: string, value: string) => { if (fail && key === 'sp_daily_routine_tasks') { fail = false; throw new Error('Preview save failure'); } entries.set(key, value); },
  removeItem: (key: string) => { entries.delete(key); }, clear: () => entries.clear(),
};
createRoot(document.getElementById('root')!).render(<AccountContext.Provider value={{ user: { uid: 'upcoming-preview', email: 'preview@example.test' } as User, storage }}>
  <button className="fixed bottom-10 left-3 z-[80] rounded-xl border bg-white p-2 text-xs" onClick={() => { fail = true; }}>Fail next homework save</button>
  <App />
</AccountContext.Provider>);
