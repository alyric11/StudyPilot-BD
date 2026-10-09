// In-memory UI verification only: no live account, database writes or YouTube calls.
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import type { User } from 'firebase/auth';
import { AccountContext } from '../src/auth/AccountContext';
import { auth } from '../src/config/firebase';
import VideoLessonsPage from '../src/components/VideoLessonsPage';
import type { SearchVideo } from '../src/utils/videoSearch';
import { seedVideoLibrary, editVideoLibrary, libraryForViewer } from '../src/utils/videoLibrary';
import '../src/index.css';
const fakeUser = { uid: 'video-preview', email: 'preview@example.test', emailVerified: true, getIdToken: async () => 'preview-token' } as unknown as User;
Object.defineProperty(auth, 'currentUser', { configurable: true, get: () => fakeUser });
const pool: SearchVideo[] = Array.from({ length: 25 }, (_, i) => ({
  videoId: `video${String(i).padStart(6, '0')}`, title: `Vector lesson ${i + 1}`, channelTitle: 'Preview teacher',
  thumbnail: '', viewCount: '12000', duration: 'PT12M', available: true, checkedAt: Date.now(), matchStatus: i === 24 ? 'uncertain' : 'matching',
  matchReason: i === 24 ? 'Curriculum level is not clear.' : '',
}));
let library = seedVideoLibrary(pool.slice(0, 2)), requests = 0, fail = false;
library = editVideoLibrary(library, { type: 'save', videos: pool.slice(0, 12) });
const entries = new Map<string, string>([
  ['sp_saved_videos_physics1_p1_11_ch2', JSON.stringify([pool[2].videoId])],
  ['sp_saved_videos_physics1_p1_11_ch2_details', JSON.stringify({ [pool[2].videoId]: pool[2] })],
]);
const storage = { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value); }, removeItem: (key: string) => { entries.delete(key); }, clear: () => entries.clear() };
const realFetch = window.fetch.bind(window);
window.fetch = async (input, options) => {
  const url = new URL(String(input), location.origin);
  if (!url.pathname.startsWith('/api/')) return realFetch(input, options);
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  if (url.pathname === '/api/chapter-videos/admin') return json({ authorized: true });
  if (url.pathname === '/api/video-library') {
    const admin = new Headers(options?.headers).get('x-overview-admin-token') === 'preview-only';
    if (options?.method === 'POST') {
      if (!admin) return json({ error: 'Management required' }, 403);
      const body = JSON.parse(String(options.body));
      try {
        library = editVideoLibrary(library, body.action === 'saveCandidates'
          ? { type: 'save', videos: pool.filter(video => !body.videoIds || body.videoIds.includes(video.videoId)) }
          : { type: body.action, videoId: body.videoId });
      } catch (error) { return json({ error: (error as Error).message }, 409); }
    }
    return json(libraryForViewer(library, pool, admin));
  }
  if (url.pathname === '/api/video-details') return json(pool.find(v => v.videoId === url.searchParams.get('videoId')) || pool[0]);
  if (url.pathname === '/api/video-lessons') {
    requests++;
    window.dispatchEvent(new Event('preview-search'));
    if (fail) { fail = false; return json({ error: 'Preview search unavailable. Saved lessons are unchanged.' }, 503); }
    if (new Headers(options?.headers).get('x-overview-admin-token') !== 'preview-only') return json({ error: 'Management required' }, 403);
    return json({ videos: pool, batchKey: 'preview-batch', hasMore: false });
  }
  return json({ error: 'Unknown preview request' }, 404);
};
function Preview() {
  const [count, setCount] = useState(0);
  return <AccountContext.Provider value={{ user: fakeUser, storage }}>
    <div className="p-4 text-xs"><button onClick={() => { fail = true; }}>Fail next search</button>{' · '}
      <button onClick={() => setCount(requests)}>Read request count</button><span role="status"> Search requests: {count}</span>
    </div>
    <div className="p-4"><VideoLessonsPage chapter={{ subjectId: 'physics1', subjectName: 'Physics 1st Paper', chapterId: 'p1_11_ch2', chapterName: 'Vector', chapterBanglaName: 'ভেক্টর' }} classLevel="Class 11" subjectAccent="#0891b2" onBack={() => {}} /></div>
  </AccountContext.Provider>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
