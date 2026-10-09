// Isolated page-refresh verification: no real account, cloud writes or API calls.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { User } from 'firebase/auth';
import App from '../src/App';
import { AccountContext } from '../src/auth/AccountContext';
import { auth } from '../src/config/firebase';
import '../src/index.css';

const user = { uid: 'navigation-preview', email: 'preview@example.test', emailVerified: true,
  getIdToken: async () => 'preview-token' } as unknown as User;
Object.defineProperty(auth, 'currentUser', { configurable: true, get: () => user });
const entries = new Map<string, string>([
  ['sp_profile', JSON.stringify({ name: 'Navigation Preview', email: user.email, classLevel: 'Class 11',
    group: 'Science', board: 'Dhaka', examYear: '2027', school: 'Preview' })],
  ...['sp_homework', 'sp_routine', 'sp_diary', 'sp_additional_subjects'].map(key => [key, '[]'] as [string, string]),
]);
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
