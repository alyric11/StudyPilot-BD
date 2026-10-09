// Isolated page-refresh verification: no real account, cloud writes or API calls.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { User } from 'firebase/auth';
import App from '../src/App';
import { AccountContext } from '../src/auth/AccountContext';
import { auth } from '../src/config/firebase';
import '../src/index.css';
import { bangladeshDateKey } from '../src/utils/sessionAppearance';

const user = { uid: 'navigation-preview', email: 'preview@example.test', emailVerified: true,
  getIdToken: async () => 'preview-token' } as unknown as User;
Object.defineProperty(auth, 'currentUser', { configurable: true, get: () => user });
const entries = new Map<string, string>([
  ['sp_profile', JSON.stringify({ name: 'Navigation Preview', email: user.email, classLevel: 'Class 11',
    group: 'Science', board: 'Dhaka', examYear: '2027', school: 'Preview' })],
  ...['sp_homework', 'sp_routine', 'sp_diary', 'sp_additional_subjects'].map(key => [key, '[]'] as [string, string]),
]);
// Optional dated-session fixture; all changes stay in the in-memory account.
if (new URLSearchParams(location.search).has('session-colors')) {
  const today = bangladeshDateKey();
  const yesterday = bangladeshDateKey(new Date(Date.now() - 86400000));
  const makeBlock = (id: string, date: string, homeworkText = '') => ({
    id, title: 'Physics 1st Paper', subjectId: 'physics1', color: 'cyan',
    dayOfWeek: new Date(`${date}T12:00:00+06:00`).getDay(), startTime: '18:00', endTime: '19:00', homeworkText,
  });
  const samples = [
    { date: today, block: makeBlock('today-preview', today, 'Practise exercise 2'), completed: false },
    { date: yesterday, block: makeBlock('unfinished-preview', yesterday, 'Review exercise 1'), completed: false },
    { date: yesterday, block: makeBlock('completed-preview', yesterday, 'Read the chapter'), completed: true },
    { date: yesterday, block: makeBlock('empty-preview', yesterday), completed: false },
  ];
  entries.set('sp_routine', JSON.stringify(samples.map(task => task.block)));
  entries.set('sp_daily_routine_tasks', JSON.stringify(samples.map(task => ({ ...task,
    subjectKey: 'physics1', subjectName: 'Physics 1st Paper', chapterBanglaName: '', paletteColor: 'cyan',
  }))));
}
const storage = { getItem: (key: string) => entries.get(key) ?? null,
  setItem: (key: string, value: string) => { entries.set(key, value); },
  removeItem: (key: string) => { entries.delete(key); }, clear: () => entries.clear() };
const realFetch = window.fetch.bind(window);
window.fetch = async (input, options) => {
  const url = new URL(String(input), location.origin);
  if (!url.pathname.startsWith('/api/')) return realFetch(input, options);
  return new Response(JSON.stringify(url.pathname === '/api/video-library'
    ? { featured: [], videos: [], revision: 0 } : { introduction: 'Preview chapter overview.', importantTopics: [] }),
    { headers: { 'Content-Type': 'application/json' } });
};
createRoot(document.getElementById('root')!).render(<StrictMode><AccountContext.Provider value={{ user, storage }}><App /></AccountContext.Provider></StrictMode>);
