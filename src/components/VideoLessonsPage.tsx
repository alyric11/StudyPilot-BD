import { Guidance } from "./InstructionLanguage";
import { studentFetch } from "../utils/studentFetch";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import { AlertTriangle, BookmarkCheck, BookmarkPlus, Search, Settings2, X, Youtube, Plus } from "lucide-react";
import { useAccount } from "../auth/AccountContext";
import useDialogFocus from "../hooks/useDialogFocus";
import StudyPageHeader from "./StudyPageHeader";
import { readPersonalVideoIds, videoCandidatePage, youtubeVideoId, type ChapterVideo } from "../utils/chapterVideos";
import type { SearchVideo } from '../utils/videoSearch';
import type { LibraryVideo } from '../utils/videoLibrary';

interface VideoLessonsPageProps {
  chapter: { subjectId: string; subjectName: string; chapterId: string; chapterName: string; chapterBanglaName: string };
  classLevel: string;
  subjectAccent: string;
  onBack: () => void;
}
const button = "inline-flex min-h-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50";
const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

async function request(url: string, options?: RequestInit) {
  const response = await studentFetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request failed. Please retry.");
  return data;
}

export default function VideoLessonsPage(props: VideoLessonsPageProps) {
  // Remount when changing chapters so searches and admin access never leak into another chapter.
  return <VideoWorkspace key={`${props.classLevel}:${props.chapter.subjectId}:${props.chapter.chapterId}`} {...props} />;
}
function VideoWorkspace({ chapter, classLevel, subjectAccent, onBack }: VideoLessonsPageProps) {
  const { storage } = useAccount();
  const personalKey = `sp_saved_videos_${chapter.subjectId}_${chapter.chapterId}`;
  const detailsKey = `${personalKey}_details`;
  const reduceMotion = useReducedMotion();
  const [personalDetails, setPersonalDetails] = useState<Record<string, ChapterVideo>>({});
  const [addingLink, setAddingLink] = useState(false);
  const [published, setPublished] = useState<ChapterVideo[]>([]);
  const [library, setLibrary] = useState<LibraryVideo[]>([]);
  const [libraryNotice, setLibraryNotice] = useState('');
  const [libraryPage, setLibraryPage] = useState(0);
  const [batchKey, setBatchKey] = useState('');
  const [hasMoreCandidates, setHasMoreCandidates] = useState(false);
  const [personal, setPersonal] = useState<string[]>([]);
  const [loadedPersonal, setLoadedPersonal] = useState(false);
  const [loadedDetails, setLoadedDetails] = useState(false);
  const [loadingPublished, setLoadingPublished] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [publishedError, setPublishedError] = useState("");
  const [personalError, setPersonalError] = useState("");
  const [studentSearched, setStudentSearched] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [managerOpen, setManagerOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [adminResults, setAdminResults] = useState<SearchVideo[]>([]);
  const [adminPage, setAdminPage] = useState(0);
  const [studentPage, setStudentPage] = useState(0);
  const [adminSearched, setAdminSearched] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState("");
  const managerRef = useRef<HTMLDivElement>(null);
  const removalRef = useRef<HTMLDivElement>(null);
  const [removal, setRemoval] = useState<{ video: ChapterVideo; shared: boolean } | null>(null);
  const [removalError, setRemovalError] = useState("");
  const adminRequest = useRef<AbortController | null>(null);
  const closeManager = () => {
    if (adminBusy) return;
    setManagerOpen(false); setPassword(""); setAdminError("");
  };
  useDialogFocus(managerOpen, managerRef, closeManager);
  useDialogFocus(!!removal, removalRef, () => { if (!adminBusy) setRemoval(null); });
  useEffect(() => () => { adminRequest.current?.abort(); }, []);
  const applyLibrary = (data: { featured: ChapterVideo[]; videos: LibraryVideo[]; detailsUnavailable?: boolean }) => {
    setPublished(data.featured); setLibrary(data.videos);
    setLibraryNotice(data.detailsUnavailable ? 'Some video details could not be refreshed. Your saved selections are kept; please retry later.' : '');
  };
  const libraryParams = () => new URLSearchParams({ classLevel, subjectId: chapter.subjectId, chapterId: chapter.chapterId });
  const loadLibrary = async (admin: boolean) => {
    const params = libraryParams(); if (admin) params.set('mode', 'admin');
    const data = await request(`/api/video-library?${params}`, { headers: admin ? { 'x-overview-admin-token': password } : undefined });
    applyLibrary(data);
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoadingPublished(true); setPublishedError("");
    const params = libraryParams();
    request(`/api/video-library?${params}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) applyLibrary(data); })
      .catch(error => { if (!controller.signal.aborted) setPublishedError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoadingPublished(false); });
    return () => controller.abort();
  }, [chapter.subjectId, chapter.chapterId, loadAttempt]);
  useEffect(() => {
    const load = () => {
    try {
      const parsed = readPersonalVideoIds(storage.getItem(personalKey));
      setPersonal(parsed.ids); setLoadedPersonal(true);
      setPersonalError(parsed.unreadable ? "Some older video entries cannot be displayed. Valid links are available; the original list will be backed up if you save changes." : "");
    } catch { setLoadedPersonal(false); setPersonalError("Your saved videos could not be read. Download your backup before changing them."); return; }
    try {
      const details = JSON.parse(storage.getItem(detailsKey) || "{}");
      if (!details || typeof details !== "object" || Array.isArray(details)) throw new Error("Unreadable video details");
      setPersonalDetails(details); setLoadedDetails(true);
    } catch { setLoadedDetails(false); setPersonalError("Video titles could not be loaded. Your saved links remain available."); }
    };
    load();
    return storage.subscribe?.(load);
  }, [storage, personalKey, detailsKey]);
  // Enrich older ID-only personal saves without performing a video search.
  useEffect(() => {
    const controller = new AbortController();
    personal.filter(id => !personalDetails[id]?.checkedAt || personalDetails[id].checkedAt! + 28 * 86400000 <= Date.now()).forEach(id => {
      request(`/api/video-details?videoId=${encodeURIComponent(id)}`, { signal: controller.signal })
        .then((video: ChapterVideo) => {
          if (controller.signal.aborted) return;
          setPersonalDetails(previous => ({ ...previous, [id]: video }));
        }).catch(() => { /* Keep the saved link usable if details are unavailable. */ });
    });
    return () => controller.abort();
  }, [personal]);
  useEffect(() => {
    if (!loadedPersonal || !loadedDetails) return;
    try { storage.setItem(detailsKey, JSON.stringify(personalDetails)); } catch { /* IDs remain saved separately. */ }
  }, [personalDetails, loadedPersonal, loadedDetails, storage, detailsKey]);
  const savePersonal = (ids: string[]) => {
    if (!loadedPersonal) return false;
    try { storage.setItem(personalKey, JSON.stringify(ids)); setPersonal(ids); setPersonalError(""); return true; }
    catch { setPersonalError("Could not save. Your previous videos have been kept."); return false; }
  };
  const addPersonal = (video: ChapterVideo) => {
    if (video.available === false) { setPersonalError('This video is private or unavailable. Try another link.'); return; }
    const id = video.videoId;
    if (personal.length >= 3) { setPersonalError("You can save up to three personal videos."); return; }
    if (personal.includes(id) || published.some(video => video.videoId === id)) {
      setPersonalError("This video is already in a saved panel."); return;
    }
    if (savePersonal([id, ...personal])) {
      setPersonalDetails(previous => ({ ...previous, [id]: video }));
      setShowAdd(false); setUrl("");
    }
  };
  const search = async (more = false) => {
    const controller = new AbortController();
    const target = adminRequest;
    target.current?.abort(); target.current = controller;
    const params = new URLSearchParams({ classLevel, subjectId: chapter.subjectId, chapterId: chapter.chapterId });
    if (more) params.set('after', batchKey);
    const data = await request(`/api/video-lessons?${params}`, { signal: controller.signal,
      headers: { 'x-overview-admin-token': password } });
    if (!controller.signal.aborted) {
      setAdminResults(data.videos as SearchVideo[]); setAdminPage(0); setAdminSearched(true);
      setBatchKey(data.batchKey); setHasMoreCandidates(data.hasMore);
    }
  };
  const manage = async (action: () => Promise<void>) => {
    if (adminBusy) return;
    setAdminBusy(true); setAdminError("");
    try { await action(); } catch (error) {
      if ((error as Error).name !== "AbortError") setAdminError((error as Error).message);
    } finally { setAdminBusy(false); }
  };
  const updateLibrary = async (action: string, videoId?: string, videoIds?: string[]) => {
    const controller = new AbortController(); adminRequest.current = controller;
    const data = await request("/api/video-library", {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json", "x-overview-admin-token": password },
      body: JSON.stringify({ classLevel, subjectId: chapter.subjectId, chapterId: chapter.chapterId, action, videoId, videoIds, batchKey }),
    });
    if (!controller.signal.aborted) applyLibrary(data);
  };
  const formatDuration = (duration: string | null) => {
    const match = duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";
    const [hours, minutes, seconds] = match.slice(1).map(value => Number(value || 0));
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : `${minutes}:${String(seconds).padStart(2, "0")}`;
  };
  const card = (video: ChapterVideo, action?: React.ReactNode, compact = false) => (
    <motion.article key={video.videoId} layout={reduceMotion ? false : "position"} layoutId={reduceMotion ? undefined : video.videoId}
      initial={false} transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-xl border border-slate-200/70 bg-white">
      <div className={`grid items-start gap-x-3 gap-y-2 p-3 ${compact ? "grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)]" : "grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)]"}`} data-video-card>
        <div className={`relative overflow-hidden rounded-lg ${compact ? "" : "sm:row-span-2"}`}>
          <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt="" className="aspect-video h-auto w-full object-cover" loading="lazy" />
          {formatDuration(video.duration) && <span aria-hidden="true" className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1 py-0.5 text-xs font-medium leading-none text-white">{formatDuration(video.duration)}</span>}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 break-words text-sm font-semibold leading-snug text-slate-800" title={video.title}>{video.title}</h3>
          <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">{video.channelTitle}</p>
          {((video as Partial<SearchVideo>).matchStatus === 'uncertain' || (video as Partial<LibraryVideo>).approved === false) && <p className="mt-2 text-xs text-amber-700">
            Review match: {(video as Partial<LibraryVideo>).reviewReason || (video as SearchVideo).matchReason}
          </p>}
          {video.available === false && <p className="mt-2 text-xs text-slate-500">Unavailable. Your saved link is kept.</p>}
        </div>
        <div className={`flex min-w-0 flex-wrap items-center justify-between gap-2 ${compact ? "col-span-2" : "col-span-2 sm:col-span-1 sm:col-start-2"}`}>
          {(video.viewCount !== "0" || video.duration) && <div className="flex flex-wrap items-center gap-x-2 text-xs leading-relaxed text-slate-500">
            {video.viewCount !== "0" && <span>{Number(video.viewCount).toLocaleString()} views</span>}
            {video.viewCount !== "0" && formatDuration(video.duration) && <span aria-hidden="true" className="text-slate-300">·</span>}
            {formatDuration(video.duration) && <span>{formatDuration(video.duration)}</span>}
          </div>}
          <div className={`flex flex-wrap items-center gap-2 ${compact ? "w-full justify-end" : "ml-auto"}`}>
            <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title} on YouTube`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"><Youtube className="h-3.5 w-3.5 text-red-500" />Watch</a>
            {action}
          </div>
        </div>
      </div>
    </motion.article>
  );
  const studentCandidates = videoCandidatePage(library.filter(video => video.approved && video.available === true), published, personal, studentPage);
  const adminCandidates = videoCandidatePage(adminResults, library, [], adminPage);
  const libraryCandidates = videoCandidatePage(library, published, [], libraryPage);
  const availableStudent = studentCandidates.videos;
  const availableAdmin = adminCandidates.videos;
  const pageControls = (data: { page: number; pages: number; total: number }, setPage: (page: number) => void, label: string, cycle = false) => (data.pages > 1 || (cycle && data.total > 0)) && (
    <nav aria-label={label} className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-500">
      <button type="button" className={button} disabled={data.page === 0} onClick={() => setPage(data.page - 1)}>Previous</button>
      <span aria-live="polite">{data.page + 1} / {data.pages}</span>
      {cycle && data.page + 1 >= data.pages
        ? <button type="button" className={button} onClick={() => setPage(0)}>Start again</button>
        : <button type="button" className={button} disabled={data.page + 1 >= data.pages} onClick={() => setPage(data.page + 1)}>Next</button>}
    </nav>
  );
  const askRemoval = (video: ChapterVideo, shared: boolean) => { setRemovalError(""); setRemoval({ video, shared }); };
  return <>
    <div className="mx-auto w-full max-w-[1440px] space-y-4" style={{ "--video-accent": subjectAccent } as CSSProperties}>
      <StudyPageHeader subjectName={chapter.subjectName} title={chapter.chapterName} banglaTitle={chapter.chapterBanglaName}
        context={`${chapter.subjectName} · Video Lessons`} accent={subjectAccent} onBack={onBack} backLabel={`Go back to ${chapter.chapterBanglaName || chapter.chapterName}`} />
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
        <section className="study-panel min-w-0 space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Video Lessons</h2>
              <p className="mt-1 text-sm text-slate-500">Selected lessons for this chapter.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {authorized && <button disabled={adminBusy || loadingPublished || !!publishedError} className={button}
                onClick={() => void manage(() => search())}>
                <Search className="mr-1.5 h-3.5 w-3.5" />{adminBusy ? "Please wait…" : "Search Videos"}
              </button>}
              <button disabled={adminBusy} aria-pressed={authorized}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                onClick={() => {
                  if (authorized) { setAuthorized(false); setPassword(""); setAdminResults([]); setAdminSearched(false); setAdminError(""); }
                  else { setAdminError(""); setManagerOpen(true); }
                }} title={authorized ? "Finish managing videos" : "Manage chapter videos"}>
                <Settings2 className="h-3.5 w-3.5" />Management
              </button>
            </div>
          </div>
          {loadingPublished && <div role="status" className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">Loading saved lessons…</div>}
          {publishedError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{publishedError} <button className={button} onClick={() => setLoadAttempt(value => value + 1)}>Retry</button></div>}
          {authorized && adminError && <p role="alert" className="text-sm text-red-700">{adminError}</p>}
          {libraryNotice && <p role="status" className="text-xs text-slate-500">{libraryNotice}</p>}
          <LayoutGroup id={`shared-${chapter.subjectId}-${chapter.chapterId}`}>
            {!loadingPublished && !publishedError && <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <h3 className="font-semibold">Featured lessons</h3><span>{published.length} / 5</span>
              </div>
              {published.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                {authorized ? "Save candidates to the chapter library, then feature up to five lessons." : "No lessons have been selected for this chapter yet."}
              </div>}
              {published.map(video => card(video, authorized
                ? <button disabled={adminBusy} className={button} aria-label={`Unfeature: ${video.title}`} onClick={() => void manage(() => updateLibrary('unfeature', video.videoId))}>
                    <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" />Featured
                  </button>
                : undefined))}
            </div>}
            {authorized && <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <h3 className="font-semibold">Chapter library</h3><span>{library.length} saved</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">Feature up to five lessons. Review uncertain matches before making them available to students.</p>
              {!library.length && <p className="text-sm text-slate-500">Search for videos, then save candidates to this library.</p>}
              {libraryCandidates.videos.map(video => card(video, <>
                {!video.approved && <button disabled={adminBusy || video.available !== true} className={button}
                  aria-label={`Approve: ${video.title}`} onClick={() => void manage(() => updateLibrary('approve', video.videoId))}>Approve</button>}
                <button disabled={adminBusy || !video.approved || video.available !== true || published.length >= 5} className={button}
                  aria-label={`Feature: ${video.title}`} onClick={() => void manage(() => updateLibrary('feature', video.videoId))}>Feature</button>
                <button disabled={adminBusy} className="rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-slate-100"
                  aria-label={`Remove from library: ${video.title}`} onClick={() => askRemoval(video, true)}>Remove</button>
              </>))}
              {pageControls(libraryCandidates, setLibraryPage, 'Browse chapter library')}
            </div>}
            {authorized && adminSearched && <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <h3 className="font-semibold">Search results</h3><span>Showing {availableAdmin.length} of {adminCandidates.total} candidates</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">Save candidates to your chapter library, then choose the featured five. Uncertain matches remain hidden until approved.</p>
              <button disabled={adminBusy || adminCandidates.total === 0} className={button}
                onClick={() => void manage(() => updateLibrary('saveCandidates'))}>Save all candidates</button>
              {availableAdmin.length === 0 && <p className="text-sm text-slate-500">No more matching videos in this search.</p>}
              {availableAdmin.map(video => card(video, <button disabled={adminBusy}
                className={button} onClick={() => void manage(() => updateLibrary('saveCandidates', undefined, [video.videoId]))}>
                <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />Save to library
              </button>))}
              {pageControls(adminCandidates, setAdminPage, 'Browse admin video candidates')}
              {hasMoreCandidates && <button disabled={adminBusy} className={button} onClick={() => void manage(() => search(true))}>Find more candidates</button>}
            </div>}
          </LayoutGroup>
        </section>
        <section className="study-panel min-w-0 space-y-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-base font-semibold text-slate-800">My Saved Videos</h2>
              <p className="mt-1 text-sm text-slate-500"><Guidance>Keep up to 3 useful videos for this chapter.</Guidance></p></div>
            <span className="shrink-0 text-xs font-semibold text-slate-400">{personal.length} / 3</span>
          </div>
          {personalError && <p role="alert" className="text-sm text-red-700"><Guidance>{personalError}</Guidance></p>}
          <button disabled={!loadedPersonal || personal.length >= 3} className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setShowAdd(value => !value)}><Plus className="h-3.5 w-3.5 text-indigo-500" />Add YouTube Video</button>
          {showAdd && <form className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4" onSubmit={async event => {
            event.preventDefault(); const id = youtubeVideoId(url);
            if (!id) { setPersonalError("Enter a valid YouTube video link."); return; }
            setAddingLink(true); setPersonalError("");
            try { addPersonal(await request(`/api/video-details?videoId=${encodeURIComponent(id)}`)); }
            catch (error) { setPersonalError((error as Error).message); }
            finally { setAddingLink(false); }
          }}>
            <label className="block text-xs font-semibold text-slate-600" htmlFor="personal-video-url">YouTube link</label>
            <input id="personal-video-url" type="url" placeholder="https://www.youtube.com/watch?v=…" className={field} value={url} onChange={event => setUrl(event.target.value)} required disabled={addingLink} />
            <div className="flex justify-end gap-2">
              <button type="button" disabled={addingLink} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100" onClick={() => { setShowAdd(false); setUrl(""); }}>Cancel</button>
              <button disabled={addingLink || !loadedPersonal || personal.length >= 3} className={button}>{addingLink ? "Checking…" : "Save Video"}</button>
            </div>
          </form>}
          <LayoutGroup id={`personal-${chapter.subjectId}-${chapter.chapterId}`}>
            <div className="space-y-3">
              {personal.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500"><Guidance>No personal videos saved yet.</Guidance></div>}
              {personal.map(id => {
                const video = personalDetails[id] || { videoId: id, title: "Saved YouTube video", channelTitle: "Details unavailable", thumbnail: "", duration: null, viewCount: "0" };
                return card(video, <button disabled={addingLink} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--video-accent)_20%,white)] bg-[color-mix(in_srgb,var(--video-accent)_6%,white)] px-3 py-2 text-xs font-semibold text-[color-mix(in_srgb,var(--video-accent)_55%,#17243b)] transition-colors hover:bg-[color-mix(in_srgb,var(--video-accent)_12%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--video-accent)] disabled:opacity-50" aria-label={`Remove personal video: ${video.title}`} onClick={() => askRemoval(video, false)}>
                  <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" />Saved
                </button>, true);
              })}
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-4">
              {!studentSearched && <button disabled={loadingPublished || !!publishedError || !loadedPersonal} className={`w-full gap-1.5 ${button}`}
                onClick={() => { setStudentPage(0); setStudentSearched(true); }}><Search className="h-4 w-4" />Explore more videos</button>}
              <p className="text-xs leading-relaxed text-slate-500"><Guidance>Explore this chapter’s saved library. Featured lessons and your personal saves are excluded.</Guidance></p>
              {studentSearched && availableStudent.length === 0 && <p className="text-sm text-slate-500"><Guidance>No additional saved videos are available for this chapter.</Guidance></p>}
              {studentSearched && availableStudent.map(video => card(video, <button disabled={addingLink || personal.length >= 3} className={button} onClick={() => addPersonal(video)}>
                <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />Save
              </button>, true))}
              {studentSearched && studentCandidates.total > 0 && studentCandidates.page + 1 >= studentCandidates.pages && <p className="text-xs text-slate-500">You’ve seen all available videos.</p>}
              {studentSearched && pageControls(studentCandidates, setStudentPage, 'Browse additional video candidates', true)}
            </div>
          </LayoutGroup>
        </section>
      </div>
    </div>
    {createPortal(<AnimatePresence>
      {(managerOpen || removal) && <motion.div key={managerOpen ? "management" : "removal"}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
        <button type="button" aria-label="Close dialog" disabled={adminBusy} className="absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[1px]"
          onClick={() => { if (managerOpen) closeManager(); else setRemoval(null); }} />
        <motion.div ref={managerOpen ? managerRef : removalRef} role="dialog" aria-modal="true" tabIndex={-1}
          aria-labelledby={managerOpen ? "video-management-title" : "video-removal-title"}
          initial={reduceMotion ? false : { y: 10, scale: 0.98 }} animate={{ y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
          {managerOpen ? <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="video-management-title" className="text-base font-semibold text-slate-800">Manage video lessons</h2>
              <button aria-label="Close management" disabled={adminBusy} onClick={closeManager} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><X className="h-4 w-4" /></button>
            </div>
            <form className="space-y-3" onSubmit={event => { event.preventDefault(); void manage(async () => {
              const controller = new AbortController(); adminRequest.current = controller;
              await request("/api/chapter-videos/admin", { method: "POST", signal: controller.signal, headers: { "x-overview-admin-token": password } });
              await loadLibrary(true);
              if (!controller.signal.aborted) { setAuthorized(true); setManagerOpen(false); }
            }); }}>
              <label className="block text-sm text-slate-600" htmlFor="video-admin-password">Admin password</label>
              <input id="video-admin-password" type="password" autoComplete="off" className={field} value={password} onChange={event => setPassword(event.target.value)} required disabled={adminBusy} />
              {adminError && <p role="alert" className="text-xs text-red-700">{adminError}</p>}
              <button disabled={adminBusy} className={`w-full ${button}`}>{adminBusy ? "Checking…" : "Unlock management"}</button>
            </form>
          </> : removal && <>
            <div className="flex items-center justify-center gap-2">
              <span className="rounded-lg bg-rose-50 p-1.5 text-rose-600"><AlertTriangle className="h-4 w-4" /></span>
              <h2 id="video-removal-title" className="text-sm font-semibold text-slate-800">{removal.shared ? 'Remove from chapter library?' : 'Remove saved video?'}</h2>
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-500"><Guidance>{removal.shared
              ? "This video will leave the chapter library and featured list. Students’ personal saves will be kept."
              : "This video will be removed from your personal saved list."}</Guidance></p>
            {removalError && <p role="alert" className="mt-2 text-center text-xs text-red-700"><Guidance>{removalError}</Guidance></p>}
            <div className="mt-4 flex justify-center gap-2">
              <button disabled={adminBusy} onClick={() => setRemoval(null)} className="min-w-24 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Keep saved</button>
              <button disabled={adminBusy} className="min-w-24 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                onClick={async () => {
                  if (!removal.shared) {
                    if (savePersonal(personal.filter(id => id !== removal.video.videoId))) setRemoval(null);
                    else setRemovalError("Could not remove this video. Please retry.");
                    return;
                  }
                  setAdminBusy(true); setRemovalError("");
                  try { await updateLibrary('remove', removal.video.videoId); setRemoval(null); }
                  catch (error) { setRemovalError((error as Error).message); }
                  finally { setAdminBusy(false); }
                }}>{adminBusy ? "Removing…" : "Remove"}</button>
            </div>
          </>}
        </motion.div>
      </motion.div>}
    </AnimatePresence>, document.body)}
  </>;
}
