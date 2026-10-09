import { Router, type RequestHandler } from 'express';
import { getServerFirestore } from './firebaseAdmin.ts';
import { sharedContent, chapterKey } from './sharedContent.ts';
import { readSavedSearchBatch, resolveVideoContext, VideoSearchError } from './videoSearchPool.ts';
import { videoMetadata } from './videoMetadata.ts';
import { editVideoLibrary, seedVideoLibrary, libraryForViewer, type VideoLibrary, type LibraryAction } from '../src/utils/videoLibrary.ts';

export const videoLibraryRouter = Router();
function adminAllowed(token: string | undefined) {
  return !!process.env.OVERVIEW_ADMIN_TOKEN && token === process.env.OVERVIEW_ADMIN_TOKEN;
}
export const requireVideoAdmin: RequestHandler = (req, res, next) => {
  if (!adminAllowed(req.header('x-overview-admin-token'))) {
    res.status(403).json({ error: 'YouTube search is available only through video management. Explore the saved chapter library instead.' }); return;
  }
  next();
};
videoLibraryRouter.use((req, res, next) => {
  if ((req.method !== 'GET' || req.query.mode === 'admin') && !adminAllowed(req.header('x-overview-admin-token'))) {
    res.status(403).json({ error: 'Unlock video management to change or review the chapter library.' }); return;
  }
  try {
    const input = req.method === 'GET' ? req.query : req.body;
    res.locals.videoContext = resolveVideoContext(input.classLevel, input.subjectId, input.chapterId);
    next();
  } catch { res.status(400).json({ error: 'Choose a valid class, subject and chapter.' }); }
});
async function view(library: VideoLibrary, admin: boolean) {
  const ids = library.entries.filter(entry => admin || entry.approved).map(entry => entry.videoId);
  // A refresh outage must never erase saved identities or admin decisions.
  const details = await videoMetadata.get(ids).catch(() => []);
  const result = libraryForViewer(library, details, admin);
  return { ...result, videos: admin ? result.videos : result.videos.filter(video => video.available === true),
    detailsUnavailable: ids.length > 0 && details.length === 0 };
}
videoLibraryRouter.get('/', async (req, res) => {
  const context = res.locals.videoContext;
  try {
    const key = chapterKey(context.subject.id, context.chapter.id);
    const [saved, legacy] = await Promise.all([
      getServerFirestore().collection('chapterVideoLibraries').doc(key).get(), sharedContent.read(key),
    ]);
    const library = (saved.data()?.library as VideoLibrary | undefined) || seedVideoLibrary(legacy.videos || []);
    res.json(await view(library, req.query.mode === 'admin'));
  } catch { res.status(503).json({ error: 'Could not load the chapter library. Your saved videos are unchanged.' }); }
});
videoLibraryRouter.post('/', async (req, res) => {
  const context = res.locals.videoContext;
  try {
    let action: LibraryAction;
    if (req.body.action === 'saveCandidates') {
      const pool = await readSavedSearchBatch(context, req.body.batchKey);
      const requested = req.body.videoIds;
      if (requested !== undefined && (!Array.isArray(requested) || requested.length > 25 || requested.some(id => typeof id !== 'string' || !pool.videos.some(video => video.videoId === id))))
        throw new VideoSearchError('Choose valid candidates from this chapter’s search.', 400);
      const videos = requested ? pool.videos.filter(video => requested.includes(video.videoId)) : pool.videos;
      if (!videos.length) throw new VideoSearchError('There are no candidates to save.', 400);
      // Only server-held search results can enter the library; browser metadata is ignored.
      await videoMetadata.seed(videos);
      action = { type: 'save', videos };
    } else {
      if (!['feature', 'unfeature', 'approve', 'remove'].includes(req.body.action) || typeof req.body.videoId !== 'string' || !/^[\w-]{11}$/.test(req.body.videoId))
        throw new VideoSearchError('Choose a valid library action.', 400);
      if (req.body.action === 'feature' && (await videoMetadata.get([req.body.videoId]))[0]?.available !== true)
        throw new VideoSearchError('This video is unavailable or could not be checked. Please try later.', 409);
      action = { type: req.body.action, videoId: req.body.videoId };
    }
    const key = chapterKey(context.subject.id, context.chapter.id), legacy = await sharedContent.read(key);
    const db = getServerFirestore(), ref = db.collection('chapterVideoLibraries').doc(key);
    const library = await db.runTransaction(async transaction => {
      const saved = (await transaction.get(ref)).data()?.library as VideoLibrary | undefined;
      let updated;
      try { updated = editVideoLibrary(saved || seedVideoLibrary(legacy.videos || []), action); }
      catch (error) { throw new VideoSearchError((error as Error).message, 409); }
      transaction.set(ref, { library: updated, subjectId: context.subject.id, chapterId: context.chapter.id, classLevel: context.classLevel });
      return updated;
    });
    res.json(await view(library, true));
  } catch (error) {
    res.status(error instanceof VideoSearchError ? error.status : 503).json({ error: error instanceof VideoSearchError ? error.message : 'Could not update the chapter library. Reload it before trying again.' });
  }
});
