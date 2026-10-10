import { Router, type RequestHandler } from 'express';
import { getServerFirestore } from './firebaseAdmin.ts';
import { chapterKey } from './sharedContent.ts';
import { readSharedVideoLibrary } from './sharedVideoLibrary';
import { SharedChapterConflict } from './sharedChapterMerge';
import { sharedChapterIdentity } from '../src/utils/sharedChapterIdentity';
import { readSavedSearchBatch, resolveVideoContext, VideoSearchError } from './videoSearchPool.ts';
import { videoMetadata } from './videoMetadata.ts';
import { videoAdminAllowed as adminAllowed } from './videoDevelopment.ts';
import { editVideoLibrary, libraryForViewer, selectFeaturedVideos, videoApprovalAllows, type VideoLibrary, type LibraryAction } from '../src/utils/videoLibrary.ts';

export const videoLibraryRouter = Router();
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
  const ids = library.entries.filter(entry => admin || videoApprovalAllows(entry)).map(entry => entry.videoId);
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
    const library = await readSharedVideoLibrary(key);
    res.json(await view(library, req.query.mode === 'admin'));
  } catch (error) { res.status(error instanceof SharedChapterConflict ? 409 : 503).json({ error: error instanceof SharedChapterConflict ? error.message : 'Could not load the chapter library. Your saved videos are unchanged.' }); }
});
videoLibraryRouter.post('/', async (req, res) => {
  const context = res.locals.videoContext;
  try {
    let action: LibraryAction | undefined;
    let autoFill = false;
    const replaceFeatured = req.body.action === 'autoFeature';
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
      autoFill = requested === undefined;
    } else if (!replaceFeatured) {
      if (!['feature', 'unfeature', 'approve', 'remove'].includes(req.body.action) || typeof req.body.videoId !== 'string' || !/^[\w-]{11}$/.test(req.body.videoId))
        throw new VideoSearchError('Choose a valid library action.', 400);
      if (req.body.action === 'feature' && (await videoMetadata.get([req.body.videoId]))[0]?.available !== true)
        throw new VideoSearchError('This video is unavailable or could not be checked. Please try later.', 409);
      action = { type: req.body.action, videoId: req.body.videoId };
    }
    const key = chapterKey(context.subject.id, context.chapter.id);
    const db = getServerFirestore(), ref = db.collection('chapterVideoLibraries').doc(key);
    const before = await readSharedVideoLibrary(key);
    // Refresh older records without channel IDs through videos.list, never Search.
    // Keep network requests outside Firestore's retryable transaction.
    const details = (replaceFeatured || (autoFill && before.featuredIds.length < 5)) ? await videoMetadata.get([
      ...before.entries.map(entry => entry.videoId), ...(action?.type === 'save' ? action.videos.map(video => video.videoId) : []),
    ], true) : [];
    const library = await db.runTransaction(async transaction => {
      const current = await readSharedVideoLibrary(key, transaction);
      if ((autoFill || replaceFeatured) && current.revision !== before.revision)
        throw new VideoSearchError('The library changed while videos were checked. Please retry; existing choices are kept.', 409);
      let updated;
      try {
        updated = action ? editVideoLibrary(current, action) : { ...current, revision: current.revision + 1 };
        if (autoFill || replaceFeatured) {
          const featuredIds = selectFeaturedVideos(updated, details, replaceFeatured);
          if (replaceFeatured && !featuredIds.length) throw new Error('No available videos with verified channels could be selected. Existing choices are kept.');
          updated = { ...updated, featuredIds };
        }
      }
      catch (error) { throw new VideoSearchError((error as Error).message, 409); }
      const { legacyKeys } = sharedChapterIdentity(context.subject.id, context.chapter.id);
      const [subjectId, chapterId] = key.split(':');
      transaction.set(ref, { library: updated, subjectId, chapterId,
        ...(legacyKeys.length ? { sharedClasses: ['Class 11', 'Class 12'], sharedFrom: legacyKeys } : { classLevel: context.classLevel }) });
      return updated;
    });
    res.json(await view(library, true));
  } catch (error) {
    res.status(error instanceof SharedChapterConflict ? 409 : error instanceof VideoSearchError ? error.status : 503).json({ error: error instanceof VideoSearchError || error instanceof SharedChapterConflict ? error.message : 'Could not update the chapter library. Reload it before trying again.' });
  }
});
